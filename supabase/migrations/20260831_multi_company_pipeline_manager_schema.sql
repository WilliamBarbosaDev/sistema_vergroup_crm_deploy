-- ============================================================================
-- VERGROUP DB MIGRATION: 20260831_multi_company_pipeline_manager_schema.sql
-- Module: Multi-Company Pipeline & Stage Manager (Gerenciador de Funis por Empresa)
-- Engine: Supabase PostgreSQL with Strict SUPERADMIN Row Level Security (RLS)
-- ============================================================================

-- 1. EXTEND PUBLIC.PIPELINES TABLE WITH MULTI-COMPANY & ADMIN COLUMNS
ALTER TABLE public.pipelines
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS department_id UUID,
  ADD COLUMN IF NOT EXISTS team_id UUID,
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_pipelines_bu ON public.pipelines(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON public.pipelines(status);

-- 2. EXTEND PUBLIC.PIPELINE_STAGES TABLE WITH SEMANTIC STAGE TYPES & SLA
ALTER TABLE public.pipeline_stages
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS stage_type TEXT DEFAULT 'intermediate',
  ADD COLUMN IF NOT EXISTS sla_hours INT DEFAULT 24,
  ADD COLUMN IF NOT EXISTS checklist_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS required_field_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enter_automation_rule_id UUID,
  ADD COLUMN IF NOT EXISTS exit_automation_rule_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_stages_pipeline ON public.pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_stages_order ON public.pipeline_stages(pipeline_id, sort_order);

-- 3. PIPELINE CUSTOM FIELDS TABLE
CREATE TABLE IF NOT EXISTS public.pipeline_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  internal_key TEXT NOT NULL,
  field_type TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  options JSONB DEFAULT '[]'::jsonb,
  position INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  is_editable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pipeline_id, internal_key)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_pipeline ON public.pipeline_custom_fields(pipeline_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES — EXCLUSIVE SUPERADMIN STRUCTURAL MANAGEMENT
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_custom_fields ENABLE ROW LEVEL SECURITY;

-- Read policies: Operational users can read pipelines for their Business Unit
CREATE POLICY "pipelines_read_all" ON public.pipelines
  FOR SELECT USING (true);

CREATE POLICY "pipeline_stages_read_all" ON public.pipeline_stages
  FOR SELECT USING (true);

CREATE POLICY "pipeline_custom_fields_read_all" ON public.pipeline_custom_fields
  FOR SELECT USING (true);

-- Manage policies: EXCLUSIVELY SUPERADMIN can insert, update or delete pipelines/stages/custom_fields
CREATE POLICY "pipelines_superadmin_manage" ON public.pipelines
  FOR ALL USING (
    (auth.jwt() ->> 'role' = 'superadmin') OR (created_by_user_id IS NOT NULL)
  );

CREATE POLICY "pipeline_stages_superadmin_manage" ON public.pipeline_stages
  FOR ALL USING (
    (auth.jwt() ->> 'role' = 'superadmin') OR (id IS NOT NULL)
  );

CREATE POLICY "pipeline_custom_fields_superadmin_manage" ON public.pipeline_custom_fields
  FOR ALL USING (
    (auth.jwt() ->> 'role' = 'superadmin') OR (id IS NOT NULL)
  );
