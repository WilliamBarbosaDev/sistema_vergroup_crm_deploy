-- ============================================================================
-- VERGROUP DB MIGRATION: 20260831_contact_360_hub_schema.sql
-- Module: Contact 360º Relationship Hub (Ficha 360º do Contato)
-- Engine: Supabase PostgreSQL with Row Level Security (RLS)
-- ============================================================================

-- 1. EXTEND PUBLIC.CONTACTS TABLE WITH 360º RELATIONSHIP COLUMNS
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS document TEXT, -- CPF ou RG
  ADD COLUMN IF NOT EXISTS salutation TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS address_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS additional_phones JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS additional_emails JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS digital_channels JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS company_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS internal_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_contacts_doc ON public.contacts(document);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON public.contacts(company_id);

-- 2. CONTACT AUDIT & EVENT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.contact_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES public.users(id),
  actor_type TEXT DEFAULT 'human_user',
  field_name TEXT NOT NULL,
  value_before TEXT,
  value_after TEXT,
  correlation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_audit_contact ON public.contact_audit_logs(contact_id);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.contact_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_audit_logs_read" ON public.contact_audit_logs
  FOR SELECT USING (true);

CREATE POLICY "contact_audit_logs_insert" ON public.contact_audit_logs
  FOR INSERT WITH CHECK (true);
