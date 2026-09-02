-- ============================================================================
-- VERGROUP DB MIGRATION: 20260902_task_sla_proactive_supervisor.sql
-- Module: Proactive VER AI SLA Supervisor & Task Risk Governance Engine
-- Engine: Supabase PostgreSQL with Job Execution Telemetry & Hierarchical Escalation
-- ============================================================================

-- 1. CREATE JOB EXECUTION TELEMETRY LOGS TABLE FOR BACKEND WORKERS & SCHEDULERS
CREATE TABLE IF NOT EXISTS public.job_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(100) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  tasks_scanned INT DEFAULT 0,
  tasks_flagged INT DEFAULT 0,
  suggestions_created INT DEFAULT 0,
  notifications_created INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running',
  error_message TEXT,
  duration_ms INT
);

-- Index for Telemetry Log Queries
CREATE INDEX IF NOT EXISTS idx_job_execution_logs_name_time 
  ON public.job_execution_logs(job_name, started_at DESC);

-- 1.1 CREATE PUBLIC.SLA_POLICIES TABLE FOR CUSTOMIZABLE THRESHOLDS (BU / DEPT / PRIORITY / PROCESS)
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id VARCHAR(50),
  department_id VARCHAR(50),
  priority VARCHAR(20),
  task_type VARCHAR(50),
  attention_threshold_pct INT DEFAULT 60,
  risk_threshold_pct INT DEFAULT 80,
  critical_threshold_pct INT DEFAULT 95,
  supervisor_escalation_hours INT DEFAULT 8,
  director_escalation_hours INT DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADD SLA GOVERNANCE & PENDING REASON COLUMNS TO PUBLIC.TASKS
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS sla_state VARCHAR(20) DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS sla_percentage_consumed INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_sla_check_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_sla_notification_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_escalation_level VARCHAR(30) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS next_escalation_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pending_reason_category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS pending_reason_text TEXT,
  ADD COLUMN IF NOT EXISTS status_requested_at TIMESTAMPTZ;

-- Index for SLA Worker Searches
CREATE INDEX IF NOT EXISTS idx_tasks_sla_supervisor 
  ON public.tasks(status, sla_state, last_escalation_level, business_unit_id);

-- 3. PROACTIVE SLA SUPERVISOR ENGINE FUNCTION (PL/pgSQL ENGINE WITH ACTOR_TYPE = 'ai_agent')
CREATE OR REPLACE FUNCTION public.process_task_sla_supervisor_audit(p_target_task_id UUID DEFAULT NULL)
RETURNS INT AS $$
DECLARE
  r RECORD;
  v_count INT := 0;
  v_notif_count INT := 0;
  v_now TIMESTAMPTZ := CURRENT_TIMESTAMP;
  v_total_sec NUMERIC;
  v_elapsed_sec NUMERIC;
  v_consumed_pct INT;
  v_new_sla_state VARCHAR(20);
  v_target_escalation VARCHAR(30);
  v_target_user_id UUID;
  v_message_text TEXT;
  v_cooldown_passed BOOLEAN;
  v_correlation_id TEXT;
BEGIN
  FOR r IN
    SELECT t.id, t.title, t.protocol_number, t.status, t.due_date, t.created_at, 
           t.assigned_user_id, t.owner_user_id, t.business_unit_id, t.client_id,
           t.sla_state, t.last_sla_notification_at, t.last_escalation_level,
           t.pending_reason_category, t.pending_reason_text
    FROM public.tasks t
    WHERE (p_target_task_id IS NULL OR t.id = p_target_task_id)
      AND t.status NOT IN ('completed', 'cancelled')
  LOOP
    v_count := v_count + 1;

    -- Calculate SLA Consumed Percentage
    v_total_sec := GREATEST(1, EXTRACT(EPOCH FROM (r.due_date - r.created_at)));
    v_elapsed_sec := GREATEST(0, EXTRACT(EPOCH FROM (v_now - r.created_at)));
    v_consumed_pct := LEAST(999, ROUND((v_elapsed_sec / v_total_sec) * 100));

    -- Determine SLA Risk State
    IF v_now > r.due_date THEN
      v_new_sla_state := 'breached';
    ELSIF v_consumed_pct >= 95 THEN
      v_new_sla_state := 'critical';
    ELSIF v_consumed_pct >= 80 THEN
      v_new_sla_state := 'risk';
    ELSIF v_consumed_pct >= 60 THEN
      v_new_sla_state := 'attention';
    ELSE
      v_new_sla_state := 'normal';
    END IF;

    -- Cooldown check (Alert Fatigue suppression: min 4h interval unless state escalated)
    v_cooldown_passed := r.last_sla_notification_at IS NULL 
      OR r.last_sla_notification_at < (v_now - INTERVAL '4 hours')
      OR v_new_sla_state <> COALESCE(r.sla_state, 'normal');

    -- Determine Target Escalation Level & Recipient
    v_target_escalation := 'none';
    v_target_user_id := COALESCE(r.assigned_user_id, r.owner_user_id);

    IF v_new_sla_state = 'breached' THEN
      IF (v_now - r.due_date) > INTERVAL '24 hours' THEN
        v_target_escalation := 'director';
        -- Escalation to Director
        SELECT id INTO v_target_user_id FROM public.users WHERE role IN ('director', 'superadmin', 'company_admin') LIMIT 1;
      ELSIF (v_now - r.due_date) > INTERVAL '8 hours' THEN
        v_target_escalation := 'supervisor';
        -- Escalation to Manager / Supervisor
        SELECT id INTO v_target_user_id FROM public.users WHERE role IN ('manager', 'director') LIMIT 1;
      ELSE
        v_target_escalation := 'assignee';
        v_target_user_id := COALESCE(r.assigned_user_id, r.owner_user_id);
      END IF;
    ELSIF v_new_sla_state IN ('critical', 'risk', 'attention') THEN
      v_target_escalation := 'assignee';
    END IF;

    -- Update Task SLA Governance State
    UPDATE public.tasks
    SET sla_state = v_new_sla_state,
        sla_percentage_consumed = v_consumed_pct,
        last_sla_check_at = v_now
    WHERE id = r.id;

    -- Handle Notifications & Alert Dispatch (Only if cooldown passed & state requires alert)
    IF v_new_sla_state <> 'normal' AND v_cooldown_passed THEN
      v_correlation_id := 'job-sla-supervisor-' || r.id || '-' || TO_CHAR(v_now, 'YYYYMMDDHH24MISS');

      -- Differentiate message if waiting for client
      IF r.pending_reason_category = 'waiting_client' THEN
        v_message_text := 'VER AI (Supervisor de SLA): A tarefa [' || COALESCE(r.protocol_number, r.id::TEXT) || '] está pendente de retorno do cliente. Faça follow-up com o cliente.';
      ELSIF v_new_sla_state = 'breached' THEN
        v_message_text := 'VER AI (Supervisor de SLA - ESCALONAMENTO ' || UPPER(v_target_escalation) || '): A tarefa [' || COALESCE(r.protocol_number, r.id::TEXT) || '] estourou o SLA (' || v_consumed_pct || '% consumido). Motivo: ' || COALESCE(r.pending_reason_text, 'Ausência de atualização recente');
      ELSE
        v_message_text := 'VER AI (Supervisor de SLA): A tarefa [' || COALESCE(r.protocol_number, r.id::TEXT) || '] atingiu o estado ' || UPPER(v_new_sla_state) || ' (' || v_consumed_pct || '% do SLA consumido).';
      END IF;

      -- Insert Notification
      IF v_target_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, business_unit_id, title, message, type, link_entity_type, link_entity_id)
        VALUES (
          v_target_user_id,
          r.business_unit_id,
          'VER AI — Alerta de SLA & Supervisão',
          v_message_text,
          'sla_supervisor_alert',
          'task',
          r.id::TEXT
        );
        v_notif_count := v_notif_count + 1;
      END IF;

      -- Log Audit Entry with ActorContext = 'ai_agent'
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_type, actor_id, business_unit_id, details, correlation_id)
        VALUES (
          'task',
          r.id::TEXT,
          'task.sla.evaluated',
          'ai_agent',
          'ver-ai-sla-supervisor',
          r.business_unit_id,
          'SLA Estado: ' || v_new_sla_state || ' (' || v_consumed_pct || '%). Escalonamento: ' || v_target_escalation,
          v_correlation_id
        );
      END IF;

      -- Update Last Notification Timestamp
      UPDATE public.tasks
      SET last_sla_notification_at = v_now,
          last_escalation_level = v_target_escalation
      WHERE id = r.id;
    END IF;

  END LOOP;

  RETURN v_notif_count;
END;
$$ LANGUAGE plpgsql;

-- 4. EVENT-DRIVEN TRIGGER FUNCTION FOR SLA GOVERNANCE
CREATE OR REPLACE FUNCTION public.fn_trigger_task_sla_supervisor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('completed', 'cancelled') THEN
    PERFORM public.process_task_sla_supervisor_audit(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. ATTACH TRIGGER AFTER INSERT OR UPDATE ON PUBLIC.TASKS
DROP TRIGGER IF EXISTS trg_tasks_sla_supervisor_event ON public.tasks;

CREATE TRIGGER trg_tasks_sla_supervisor_event
  AFTER INSERT OR UPDATE OF due_date, status, pending_reason_category ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_task_sla_supervisor();

-- 6. WRAPPER PROCEDURE FOR SCHEDULER & PG_CRON WITH TELEMETRY LOGGING
CREATE OR REPLACE FUNCTION public.run_scheduled_sla_supervisor()
RETURNS VOID AS $$
DECLARE
  v_job_id UUID;
  v_start_time TIMESTAMPTZ := CURRENT_TIMESTAMP;
  v_end_time TIMESTAMPTZ;
  v_notif_created INT := 0;
  v_scanned_count INT := 0;
BEGIN
  -- Create Telemetry Log Header
  INSERT INTO public.job_execution_logs (job_name, started_at, status)
  VALUES ('task_sla_supervisor_job', v_start_time, 'running')
  RETURNING id INTO v_job_id;

  BEGIN
    SELECT COUNT(*) INTO v_scanned_count FROM public.tasks WHERE status NOT IN ('completed', 'cancelled');
    v_notif_created := public.process_task_sla_supervisor_audit(NULL);
    v_end_time := CURRENT_TIMESTAMP;

    -- Update Telemetry Log Success State
    UPDATE public.job_execution_logs
    SET completed_at = v_end_time,
        tasks_scanned = v_scanned_count,
        notifications_created = v_notif_created,
        status = 'success',
        duration_ms = ROUND(EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000)
    WHERE id = v_job_id;

  EXCEPTION WHEN OTHERS THEN
    v_end_time := CURRENT_TIMESTAMP;
    UPDATE public.job_execution_logs
    SET completed_at = v_end_time,
        status = 'failed',
        error_message = SQLERRM,
        duration_ms = ROUND(EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000)
    WHERE id = v_job_id;
  END;
END;
$$ LANGUAGE plpgsql;

-- 7. SCHEDULE PERIODIC JOB VIA PG_CRON (EVERY 15 MINUTES)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'task_sla_supervisor_job',
      '*/15 * * * *',
      'SELECT public.run_scheduled_sla_supervisor()'
    );
  END IF;
END;
$$;
