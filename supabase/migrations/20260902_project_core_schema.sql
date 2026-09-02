-- ============================================================================
-- VERGROUP DB MIGRATION: 20260902_project_core_schema.sql
-- Module: Projects Core Engine & RLS Governance
-- Engine: Supabase PostgreSQL Relational Schema for Projects
-- ============================================================================

-- 1. CREATE PUBLIC.PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  service_category VARCHAR(100),
  manager_id UUID REFERENCES public.users(id),
  member_ids JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  target_end_date DATE,
  status VARCHAR(30) DEFAULT 'in_progress',
  health VARCHAR(20) DEFAULT 'on_track',
  progress_percentage INT DEFAULT 0,
  milestones JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  budget NUMERIC(15, 2) DEFAULT 0,
  budgeted_hours INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREATE PERFORMANCE INDEXES FOR RLS & SEARCHES
CREATE INDEX IF NOT EXISTS idx_projects_bu_status 
  ON public.projects(business_unit_id, status);

CREATE INDEX IF NOT EXISTS idx_projects_company 
  ON public.projects(company_id);

CREATE INDEX IF NOT EXISTS idx_projects_manager 
  ON public.projects(manager_id);

-- 3. VERIFY TASK TO PROJECT RELATIONSHIP INDEX
CREATE INDEX IF NOT EXISTS idx_tasks_project_rel 
  ON public.tasks(project_id, status);
