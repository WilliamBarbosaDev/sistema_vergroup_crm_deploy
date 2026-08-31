-- ============================================================================
-- VERGROUP DB MIGRATION: 20260831_collaborator_cockpit_schema.sql
-- Module: Collaborator Cockpit, Organizational Hierarchy & VER AI Copilot
-- Engine: Supabase PostgreSQL with Row Level Security (RLS)
-- ============================================================================

-- 1. USERS TABLE EXTENSION (OFFICIAL POSTGRESQL COLUMNS)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS extension_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Manaus, AM',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'Português (Brasil)',
  ADD COLUMN IF NOT EXISTS hired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. MULTI-DEPARTMENT MEMBERSHIPS TABLE (REPLACING LOOSE ARRAYS)
CREATE TABLE IF NOT EXISTS public.user_department_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  business_unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, department_id)
);

-- Index for RLS performance
CREATE INDEX IF NOT EXISTS idx_dept_mem_user_id ON public.user_department_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_dept_mem_dept_id ON public.user_department_memberships(department_id);

-- 3. HIERARCHY & MANAGER RELATIONSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.user_manager_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subordinate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'direct_manager', -- 'direct_manager' | 'supervisor' | 'substitute'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subordinate_id, manager_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_mgr_rel_subordinate ON public.user_manager_relationships(subordinate_id);
CREATE INDEX IF NOT EXISTS idx_mgr_rel_manager ON public.user_manager_relationships(manager_id);

-- 4. COLLABORATOR INVITES TABLE
CREATE TABLE IF NOT EXISTS public.collaborator_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('link', 'email', 'direct', 'external')),
  email TEXT,
  phone TEXT,
  name TEXT,
  token TEXT NOT NULL UNIQUE,
  business_unit_id UUID NOT NULL REFERENCES public.business_units(id),
  department_id UUID NOT NULL REFERENCES public.departments(id),
  team_id UUID REFERENCES public.teams(id),
  job_title TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator',
  manager_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked', 'failed', 'invite_not_sent')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  is_external BOOLEAN DEFAULT FALSE,
  external_access_days INT,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  allowed_resource_ids JSONB,
  invited_by_user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON public.collaborator_invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_status ON public.collaborator_invites(status);

-- 5. ONBOARDING TASKS TABLE
CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id),
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON public.onboarding_tasks(user_id);

-- 6. TIME ENTRIES (OPERATIONAL TASK & PROJECT TIME TRACKING)
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  duration_minutes INT NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_time_entries_user ON public.time_entries(user_id);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.user_department_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_manager_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own department memberships or manager's subordinates
CREATE POLICY "user_dept_memberships_select_policy" ON public.user_department_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_manager_relationships
      WHERE manager_id = auth.uid() AND subordinate_id = user_department_memberships.user_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'company_admin', 'director', 'manager')
    )
  );

-- RLS Policy: Private Data Capability (users.private_data.read)
-- Restricts birth_date and emergency_contact access
CREATE OR REPLACE FUNCTION public.can_read_private_user_data(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() = target_user_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'company_admin', 'director', 'manager')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
