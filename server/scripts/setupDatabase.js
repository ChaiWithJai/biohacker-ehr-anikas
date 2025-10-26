import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Setup Database Tables
 * Run this script to create all necessary tables
 */
async function setupDatabase() {
  console.log('🔧 Setting up Violet Rails FHIR database...\n');

  const sql = `
-- Create api_namespaces table
CREATE TABLE IF NOT EXISTS api_namespaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  version text DEFAULT '1',
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create api_resources table
CREATE TABLE IF NOT EXISTS api_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_namespace_id uuid NOT NULL REFERENCES api_namespaces(id) ON DELETE CASCADE,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_resources_properties ON api_resources USING gin (properties);
CREATE INDEX IF NOT EXISTS idx_api_resources_namespace ON api_resources(api_namespace_id);
CREATE INDEX IF NOT EXISTS idx_api_namespaces_name ON api_namespaces(name);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'patient',
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_events table
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  action text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_user ON audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_api_namespaces_updated_at ON api_namespaces;
CREATE TRIGGER update_api_namespaces_updated_at BEFORE UPDATE ON api_namespaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_resources_updated_at ON api_resources;
CREATE TRIGGER update_api_resources_updated_at BEFORE UPDATE ON api_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    console.log('⚠️  NOTE: This script requires direct database access.');
    console.log('Please run these SQL commands in your Supabase SQL Editor:\n');
    console.log('Dashboard → SQL Editor → New Query → Paste the following:\n');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));
    console.log('\n✅ Copy the SQL above and run it in Supabase SQL Editor');
    console.log('\nAfter running the SQL, execute: npm run seed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
