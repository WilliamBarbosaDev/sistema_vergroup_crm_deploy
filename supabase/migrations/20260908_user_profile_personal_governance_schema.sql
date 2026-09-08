-- ============================================================================
-- VERGROUP DB MIGRATION: 20260908_user_profile_personal_governance_schema.sql
-- Module: User Profile, Personal Data & Governance Separation
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS personal_email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Manaus',
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS personal_notes TEXT,
  ADD COLUMN IF NOT EXISTS employee_code TEXT,
  ADD COLUMN IF NOT EXISTS last_password_changed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.users.avatar IS 'Official user profile avatar URL. Auth stores credentials; profile stores identity.';
COMMENT ON COLUMN public.users.avatar_storage_path IS 'External storage path for official profile avatar when a storage provider is configured.';
COMMENT ON COLUMN public.users.role IS 'Governance field managed only by authorized administrators.';
COMMENT ON COLUMN public.users.primary_business_unit_id IS 'Governance field managed only by authorized administrators.';
COMMENT ON COLUMN public.users.department_id IS 'Governance field managed only by authorized administrators.';
