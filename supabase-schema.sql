-- Violet Rails + FSF Health EHR - Database Schema
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- API Namespaces (Resource type definitions)
CREATE TABLE IF NOT EXISTS api_namespaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  version text DEFAULT '1',
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API Resources (Actual FHIR resource data stored in JSONB)
CREATE TABLE IF NOT EXISTS api_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_namespace_id uuid NOT NULL REFERENCES api_namespaces(id) ON DELETE CASCADE,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users (Authentication and RBAC)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'patient',
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit Events (Complete audit trail)
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  action text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- JSONB GIN index for fast queries on resource properties
CREATE INDEX IF NOT EXISTS idx_api_resources_properties
  ON api_resources USING gin (properties);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_api_resources_namespace
  ON api_resources(api_namespace_id);

CREATE INDEX IF NOT EXISTS idx_api_namespaces_name
  ON api_namespaces(name);

-- Audit event indexes
CREATE INDEX IF NOT EXISTS idx_audit_events_user
  ON audit_events(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_resource
  ON audit_events(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_created
  ON audit_events(created_at);

-- ============================================================================
-- 3. CREATE FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_api_namespaces_updated_at ON api_namespaces;
CREATE TRIGGER update_api_namespaces_updated_at
  BEFORE UPDATE ON api_namespaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_resources_updated_at ON api_resources;
CREATE TRIGGER update_api_resources_updated_at
  BEFORE UPDATE ON api_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SCHEMA SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. In your project directory, run: npm run db:seed
-- 3. Start the application: npm run dev:all
-- ============================================================================
