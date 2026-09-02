-- ============================================================================
-- VERGROUP DB MIGRATION: 20260902_single_running_timer_backend_engine.sql
-- Module: Single Active Running Timer Engine & Concurrency-Safe Time Tracking
-- Engine: Supabase PostgreSQL Partial Unique Index & Atomic Transaction Functions
-- ============================================================================

-- 1. CREATE TIME_ENTRIES TABLE AS THE OFFICIAL SOURCE OF TRUTH FOR TIME TRACKING
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  task_id UUID NOT NULL REFERENCES public.tasks(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMPTZ,
  duration_seconds INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. STRICT DATABASE UNIQUE PARTIAL INDEX (1 USER = MAX 1 RUNNING TIMER AT ANY MILLISECOND)
CREATE UNIQUE INDEX IF NOT EXISTS idx_time_entries_single_active_per_user 
  ON public.time_entries(user_id) 
  WHERE ended_at IS NULL AND status = 'running';

-- Performance Index for Reports & Task Time Tracking
CREATE INDEX IF NOT EXISTS idx_time_entries_task_user 
  ON public.time_entries(task_id, user_id, started_at DESC);

-- 3. ATOMIC TRANSACTION PROCEDURE TO START OR SWITCH TASK TIMER (BACKEND GUARANTEE)
CREATE OR REPLACE FUNCTION public.start_task_timer_transaction(
  p_user_id UUID,
  p_task_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_active_entry RECORD;
  v_new_entry_id UUID;
  v_prev_duration INT := 0;
  v_prev_task_protocol TEXT;
  v_new_task_protocol TEXT;
  v_now TIMESTAMPTZ := CURRENT_TIMESTAMP;
  v_result JSONB;
BEGIN
  -- Step 1: Atomic lock & pause any existing active running timer for this user
  SELECT te.*, t.protocol_number INTO v_active_entry
  FROM public.time_entries te
  JOIN public.tasks t ON t.id = te.task_id
  WHERE te.user_id = p_user_id
    AND te.ended_at IS NULL
    AND te.status = 'running'
  FOR UPDATE;

  -- Idempotent check: if starting timer on the SAME task, return running status
  IF FOUND AND v_active_entry.task_id = p_task_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_running', true,
      'time_entry_id', v_active_entry.id
    );
  END IF;

  -- If user has an active timer on ANOTHER task (e.g. Task A), atomic pause it without losing seconds!
  IF FOUND THEN
    v_prev_duration := GREATEST(0, ROUND(EXTRACT(EPOCH FROM (v_now - v_active_entry.started_at))));
    v_prev_task_protocol := v_active_entry.protocol_number;

    -- Update previous time entry to paused
    UPDATE public.time_entries
    SET ended_at = v_now,
        status = 'paused',
        duration_seconds = v_prev_duration
    WHERE id = v_active_entry.id;

    -- Update Task A aggregate timer_seconds
    UPDATE public.tasks
    SET timer_seconds = COALESCE(timer_seconds, 0) + v_prev_duration,
        spent_hours = ROUND((COALESCE(timer_seconds, 0) + v_prev_duration)::NUMERIC / 3600, 2),
        updated_at = v_now
    WHERE id = v_active_entry.task_id;

    -- Audit Log entry for automatic pause
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
      INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_type, actor_id, details)
      VALUES (
        'task',
        v_active_entry.task_id::TEXT,
        'task.timer.auto_paused',
        'human_user',
        p_user_id::TEXT,
        'Cronômetro da tarefa [' || COALESCE(v_prev_task_protocol, v_active_entry.task_id::TEXT) || '] pausado automaticamente ao iniciar nova tarefa.'
      );
    END IF;
  END IF;

  -- Step 2: Fetch protocol of new target task
  SELECT protocol_number INTO v_new_task_protocol FROM public.tasks WHERE id = p_task_id;

  -- Step 3: Insert NEW active time_entry (Protected by partial unique index)
  INSERT INTO public.time_entries (user_id, task_id, started_at, status)
  VALUES (p_user_id, p_task_id, v_now, 'running')
  RETURNING id INTO v_new_entry_id;

  -- Step 4: Update target task status to 'in_progress'
  UPDATE public.tasks
  SET status = CASE WHEN status = 'pending' THEN 'in_progress' ELSE status END,
      updated_at = v_now
  WHERE id = p_task_id;

  -- Audit Log entry for starting timer
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_type, actor_id, details)
    VALUES (
      'task',
      p_task_id::TEXT,
      'task.timer.started',
      'human_user',
      p_user_id::TEXT,
      'Cronômetro iniciado para a tarefa [' || COALESCE(v_new_task_protocol, p_task_id::TEXT) || ']'
    );
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'time_entry_id', v_new_entry_id,
    'started_at', v_now,
    'previous_paused_task_protocol', v_prev_task_protocol,
    'previous_duration_seconds', v_prev_duration
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 4. ATOMIC TRANSACTION PROCEDURE TO PAUSE TASK TIMER
CREATE OR REPLACE FUNCTION public.pause_task_timer_transaction(
  p_user_id UUID,
  p_task_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_active_entry RECORD;
  v_duration INT := 0;
  v_now TIMESTAMPTZ := CURRENT_TIMESTAMP;
  v_task_protocol TEXT;
BEGIN
  -- Locate running time_entry for this user
  SELECT te.*, t.protocol_number INTO v_active_entry
  FROM public.time_entries te
  JOIN public.tasks t ON t.id = te.task_id
  WHERE te.user_id = p_user_id
    AND te.ended_at IS NULL
    AND te.status = 'running'
    AND (p_task_id IS NULL OR te.task_id = p_task_id)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Nenhum cronômetro ativo encontrado');
  END IF;

  v_duration := GREATEST(0, ROUND(EXTRACT(EPOCH FROM (v_now - v_active_entry.started_at))));
  v_task_protocol := v_active_entry.protocol_number;

  -- Update time_entry
  UPDATE public.time_entries
  SET ended_at = v_now,
      status = 'paused',
      duration_seconds = v_duration
  WHERE id = v_active_entry.id;

  -- Update Task aggregate timer_seconds
  UPDATE public.tasks
  SET timer_seconds = COALESCE(timer_seconds, 0) + v_duration,
      spent_hours = ROUND((COALESCE(timer_seconds, 0) + v_duration)::NUMERIC / 3600, 2),
      updated_at = v_now
  WHERE id = v_active_entry.task_id;

  -- Log Audit entry
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_type, actor_id, details)
    VALUES (
      'task',
      v_active_entry.task_id::TEXT,
      'task.timer.paused',
      'human_user',
      p_user_id::TEXT,
      'Cronômetro da tarefa [' || COALESCE(v_task_protocol, v_active_entry.task_id::TEXT) || '] pausado (' || v_duration || ' segundos decorridos).'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'time_entry_id', v_active_entry.id,
    'duration_seconds', v_duration,
    'task_protocol', v_task_protocol
  );
END;
$$ LANGUAGE plpgsql;

-- 5. FUNCTION TO GET ACTIVE USER TIMER FOR RECOVERY AFTER LOGIN / REFRESH
CREATE OR REPLACE FUNCTION public.get_active_user_timer(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_active_entry RECORD;
BEGIN
  SELECT te.*, t.protocol_number, t.title INTO v_active_entry
  FROM public.time_entries te
  JOIN public.tasks t ON t.id = te.task_id
  WHERE te.user_id = p_user_id
    AND te.ended_at IS NULL
    AND te.status = 'running'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('active', false);
  END IF;

  RETURN jsonb_build_object(
    'active', true,
    'time_entry_id', v_active_entry.id,
    'task_id', v_active_entry.task_id,
    'task_protocol', v_active_entry.protocol_number,
    'task_title', v_active_entry.title,
    'started_at', v_active_entry.started_at,
    'elapsed_seconds', ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_active_entry.started_at)))
  );
END;
$$ LANGUAGE plpgsql;

-- 6. OFFICIAL TIME TRACKING & FINANCIAL REPORT AGGREGATION VIEW (SINGLE SOURCE OF TRUTH)
CREATE OR REPLACE VIEW public.vw_task_time_entries_summary AS
SELECT 
  te.task_id,
  te.user_id,
  t.business_unit_id,
  t.protocol_number,
  COUNT(te.id) AS total_work_sessions,
  SUM(te.duration_seconds) AS total_seconds_worked,
  ROUND(SUM(te.duration_seconds)::NUMERIC / 3600, 2) AS total_hours_worked,
  MIN(te.started_at) AS first_session_at,
  MAX(COALESCE(te.ended_at, te.started_at)) AS last_session_at
FROM public.time_entries te
JOIN public.tasks t ON t.id = te.task_id
GROUP BY te.task_id, te.user_id, t.business_unit_id, t.protocol_number;
