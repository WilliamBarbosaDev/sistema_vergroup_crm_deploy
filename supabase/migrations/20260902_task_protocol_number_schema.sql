-- ============================================================================
-- VERGROUP DB MIGRATION: 20260902_task_protocol_number_schema.sql
-- Module: Tasks Protocol & CRM Context Engine (Protocolo Único & Relação CRM / Interna)
-- Engine: Supabase PostgreSQL with Row Level Security (RLS)
-- ============================================================================

-- 1. ADD NEW OPERATIONAL & CRM CONTEXT COLUMNS TO PUBLIC.TASKS
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS protocol_number VARCHAR(30) UNIQUE,
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id),
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deals(id),
  ADD COLUMN IF NOT EXISTS task_context VARCHAR(20) DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS confirmed_internal BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. CREATE CONCURRENCY-SAFE SEQUENCE FOR TASK PROTOCOLS
CREATE SEQUENCE IF NOT EXISTS public.task_protocol_seq
  START WITH 1
  INCREMENT BY 1;

-- 3. TRANSACTIONAL FUNCTION TO GENERATE IMMUTABLE PROTOCOL NUMBER (VRG-YYYY-NNNNNN) AND INFER CONTEXT
CREATE OR REPLACE FUNCTION public.generate_task_protocol_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INT;
  v_prefix TEXT := 'VRG';
BEGIN
  IF NEW.protocol_number IS NULL OR NEW.protocol_number = '' THEN
    v_year := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    v_seq := NEXTVAL('public.task_protocol_seq');
    NEW.protocol_number := v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  END IF;
  
  -- Default owner_user_id to creatorId or assignedUserId if null
  IF NEW.owner_user_id IS NULL THEN
    NEW.owner_user_id := COALESCE(NEW.creator_id, NEW.assigned_user_id);
  END IF;

  -- Auto infer task_context if CRM linked
  IF NEW.client_id IS NOT NULL OR NEW.contact_id IS NOT NULL OR NEW.deal_id IS NOT NULL THEN
    NEW.task_context := 'client';
  ELSE
    NEW.task_context := 'internal';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGER BEFORE INSERT ON TASKS
DROP TRIGGER IF EXISTS trg_tasks_set_protocol_number ON public.tasks;

CREATE TRIGGER trg_tasks_set_protocol_number
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_task_protocol_number();

-- 5. INDEXES FOR HIGH-PERFORMANCE SEARCH & CRM REVIEWS
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_protocol_number ON public.tasks(protocol_number);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_user ON public.tasks(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON public.tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal ON public.tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_context ON public.tasks(task_context, confirmed_internal);

-- 6. SAFE BACKFILL FOR EXISTING TASKS WITHOUT DESTRUCTIVE ACTION
DO $$
DECLARE
  r RECORD;
  v_y TEXT := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
  v_s INT;
BEGIN
  FOR r IN SELECT id, client_id, contact_id, deal_id FROM public.tasks WHERE protocol_number IS NULL OR protocol_number = '' LOOP
    v_s := NEXTVAL('public.task_protocol_seq');
    UPDATE public.tasks
      SET protocol_number = 'VRG-' || v_y || '-' || LPAD(v_s::TEXT, 6, '0'),
          task_context = CASE WHEN r.client_id IS NOT NULL OR r.contact_id IS NOT NULL OR r.deal_id IS NOT NULL THEN 'client' ELSE 'internal' END
      WHERE id = r.id;
  END LOOP;
END;
$$;
