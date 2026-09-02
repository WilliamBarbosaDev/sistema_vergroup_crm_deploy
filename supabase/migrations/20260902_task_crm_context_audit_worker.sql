-- ============================================================================
-- VERGROUP DB MIGRATION: 20260902_task_crm_context_audit_worker.sql
-- Module: Proactive AI Background Audit Worker (Real Backend Event-Driven + Periodic Scheduler)
-- Engine: Supabase PostgreSQL with RLS & ActorContext ('ai_agent')
-- ============================================================================

-- 1. ADD AUDIT STATE AND CRM SUGGESTION COLUMNS TO PUBLIC.TASKS FOR PERSISTENCE & DEDUPLICATION
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS crm_audit_status VARCHAR(30) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS crm_suggestion_entity_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS crm_suggestion_entity_id UUID,
  ADD COLUMN IF NOT EXISTS crm_suggestion_entity_name TEXT,
  ADD COLUMN IF NOT EXISTS crm_suggestion_confidence INT,
  ADD COLUMN IF NOT EXISTS crm_suggestion_reason TEXT,
  ADD COLUMN IF NOT EXISTS last_crm_audit_at TIMESTAMPTZ;

-- 2. CREATE NOTIFICATIONS TABLE FOR PERSISTENT USER ALERTS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  business_unit_id VARCHAR(50),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'crm_audit_suggestion',
  link_entity_type VARCHAR(50),
  link_entity_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES FOR HIGH-PERFORMANCE BACKEND WORKER QUERIES
CREATE INDEX IF NOT EXISTS idx_tasks_backend_crm_audit 
  ON public.tasks(status, confirmed_internal, crm_audit_status, business_unit_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications(user_id, read);

-- 4. BACKEND AUDIT WORKER FUNCTION (PL/pgSQL ENGINE WITH ACTOR_TYPE = 'ai_agent')
CREATE OR REPLACE FUNCTION public.process_task_crm_context_audit(p_target_task_id UUID DEFAULT NULL)
RETURNS INT AS $$
DECLARE
  r RECORD;
  v_count INT := 0;
  v_company_id UUID;
  v_company_name TEXT;
  v_matched_term TEXT;
  v_client_terms TEXT[] := ARRAY['cliente', 'empresa', 'cnpj', 'cpf', 'notas', 'nota fiscal', 'faturamento', 'contrato', 'cobrança', 'documentos', 'atendimento', 'implantação', 'alfa', 'vercontábil', 'verads'];
  v_full_text TEXT;
  v_correlation_id TEXT;
BEGIN
  FOR r IN 
    SELECT t.id, t.title, t.description, t.business_unit_id, t.owner_user_id, t.assigned_user_id, t.protocol_number
    FROM public.tasks t
    WHERE (p_target_task_id IS NULL OR t.id = p_target_task_id)
      AND t.status NOT IN ('completed', 'cancelled')
      AND t.confirmed_internal = FALSE
      AND t.client_id IS NULL
      AND t.contact_id IS NULL
      AND t.deal_id IS NULL
  LOOP
    v_full_text := LOWER(COALESCE(r.title, '') || ' ' || COALESCE(r.description, ''));
    v_matched_term := NULL;
    v_company_id := NULL;
    v_company_name := NULL;

    -- Step 1: Deterministic keyword matching
    FOREACH v_matched_term IN ARRAY v_client_terms LOOP
      IF POSITION(v_matched_term IN v_full_text) > 0 THEN
        EXIT; -- Term found
      ELSE
        v_matched_term := NULL;
      END IF;
    END LOOP;

    -- Step 2: Query CRM Domain Service (companies/contacts) isolated by business_unit_id
    IF v_matched_term IS NOT NULL THEN
      SELECT c.id, c.name INTO v_company_id, v_company_name
      FROM public.companies c
      WHERE (r.business_unit_id IS NULL OR c.business_unit_id = r.business_unit_id)
        AND POSITION(LOWER(c.name) IN v_full_text) > 0
      LIMIT 1;

      -- Fallback if term matched but company name not explicitly stated
      IF v_company_name IS NULL THEN
        SELECT c.id, c.name INTO v_company_id, v_company_name
        FROM public.companies c
        WHERE (r.business_unit_id IS NULL OR c.business_unit_id = r.business_unit_id)
        ORDER BY c.created_at DESC
        LIMIT 1;
      END IF;

      IF v_company_name IS NOT NULL THEN
        v_correlation_id := 'job-crm-audit-' || r.id || '-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS');

        -- Update Task Audit State & Suggestion (Without automatic linking)
        UPDATE public.tasks
        SET crm_audit_status = 'crm_suggested',
            crm_suggestion_entity_type = 'company',
            crm_suggestion_entity_id = v_company_id,
            crm_suggestion_entity_name = v_company_name,
            crm_suggestion_confidence = 92,
            crm_suggestion_reason = 'Termo "' || v_matched_term || '" identificado no título/descrição compatível com a empresa ' || v_company_name,
            last_crm_audit_at = CURRENT_TIMESTAMP
        WHERE id = r.id;

        -- Create Persistent Notification for Task Owner / Assignee
        INSERT INTO public.notifications (user_id, business_unit_id, title, message, type, link_entity_type, link_entity_id)
        VALUES (
          COALESCE(r.owner_user_id, r.assigned_user_id),
          r.business_unit_id,
          'VER AI — Sugestão de Vínculo CRM',
          'A tarefa [' || COALESCE(r.protocol_number, r.id::TEXT) || '] pode pertencer à empresa "' || v_company_name || '". Clique para homologar o vínculo.',
          'crm_audit_suggestion',
          'task',
          r.id::TEXT
        );

        -- Record Audit Log Entry with ActorContext = 'ai_agent'
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
          INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_type, actor_id, business_unit_id, details, correlation_id)
          VALUES (
            'task',
            r.id::TEXT,
            'task.crm_relation.suggested',
            'ai_agent',
            'ver-ai-proactive-agent',
            r.business_unit_id,
            'VER AI Proactive Agent sugeriu vínculo CRM com "' || v_company_name || '" (Confiança: 92%)',
            v_correlation_id
          );
        END IF;

        v_count := v_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 5. EVENT-DRIVEN TRIGGER FUNCTION ON TASK INSERT / UPDATE
CREATE OR REPLACE FUNCTION public.fn_trigger_task_crm_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Execute audit immediately on database row changes (Independent of browser status)
  IF NEW.status NOT IN ('completed', 'cancelled')
     AND NEW.confirmed_internal = FALSE
     AND NEW.client_id IS NULL
     AND NEW.contact_id IS NULL
     AND NEW.deal_id IS NULL THEN
    PERFORM public.process_task_crm_context_audit(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. ATTACH TRIGGER AFTER INSERT OR UPDATE ON PUBLIC.TASKS
DROP TRIGGER IF EXISTS trg_tasks_crm_audit_event ON public.tasks;

CREATE TRIGGER trg_tasks_crm_audit_event
  AFTER INSERT OR UPDATE OF title, description, confirmed_internal, client_id, contact_id, deal_id ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_trigger_task_crm_audit();

-- 7. PERIODIC SAFETY SCAN FUNCTION FOR SCHEDULER / PG_CRON / BACKEND JOB
CREATE OR REPLACE FUNCTION public.run_scheduled_crm_context_audit()
RETURNS VOID AS $$
DECLARE
  v_processed INT;
BEGIN
  v_processed := public.process_task_crm_context_audit(NULL);
END;
$$ LANGUAGE plpgsql;
