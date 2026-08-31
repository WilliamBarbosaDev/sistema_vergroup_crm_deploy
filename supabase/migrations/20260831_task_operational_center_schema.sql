-- ============================================================================
-- VERGROUP DB MIGRATION: 20260831_task_operational_center_schema.sql
-- Module: Task Operational Execution Center (Central Operacional de Execução)
-- Engine: Supabase PostgreSQL with Row Level Security (RLS)
-- ============================================================================

-- 1. EXTEND PUBLIC.TASKS TABLE WITH OPERATIONAL COLUMNS
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS competence_month INT,
  ADD COLUMN IF NOT EXISTS competence_year INT,
  ADD COLUMN IF NOT EXISTS template_id UUID,
  ADD COLUMN IF NOT EXISTS is_status_report_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_status_report_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_tasks_parent ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_competence ON public.tasks(competence_year, competence_month);

-- 2. TASK TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID REFERENCES public.business_units(id),
  department_id UUID REFERENCES public.departments(id),
  title TEXT NOT NULL,
  description TEXT,
  default_priority TEXT DEFAULT 'medium',
  default_sla_hours INT DEFAULT 48,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  created_by_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TASK STATUS REPORTS TABLE (PROGRESS UPDATES)
CREATE TABLE IF NOT EXISTS public.task_status_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_status_reports_task ON public.task_status_reports(task_id);

-- 4. TASK DEPENDENCIES TABLE (RELATIONAL BLOCKING LINKS)
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  successor_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(predecessor_task_id, successor_task_id)
);

CREATE INDEX IF NOT EXISTS idx_deps_predecessor ON public.task_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_deps_successor ON public.task_dependencies(successor_task_id);

-- 5. USER SAVED FILTERS TABLE
CREATE TABLE IF NOT EXISTS public.user_saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filter_name TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON public.user_saved_filters(user_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_status_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_templates_read" ON public.task_templates
  FOR SELECT USING (true);

CREATE POLICY "task_status_reports_read" ON public.task_status_reports
  FOR SELECT USING (true);

CREATE POLICY "task_dependencies_read" ON public.task_dependencies
  FOR SELECT USING (true);

CREATE POLICY "user_saved_filters_policy" ON public.user_saved_filters
  FOR ALL USING (auth.uid() = user_id OR user_id IS NOT NULL);
