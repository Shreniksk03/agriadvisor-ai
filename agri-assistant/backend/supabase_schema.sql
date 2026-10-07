-- ============================================================================
-- AgriAdvisor AI: Supabase PostgreSQL Foundation Schema & RLS Policies
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'agronomist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fields table
CREATE TABLE IF NOT EXISTS fields (
    id VARCHAR(50) PRIMARY KEY,
    owner_name VARCHAR(150) NOT NULL,
    crop_type VARCHAR(50) NOT NULL,
    historical_yield_score NUMERIC(5,2) DEFAULT 85.00,
    coordinates_hash VARCHAR(128)
);

-- Advisories table
CREATE TABLE IF NOT EXISTS advisories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id VARCHAR(50) REFERENCES fields(id) ON DELETE CASCADE,
    issue_category VARCHAR(100) NOT NULL,
    farmer_statement TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'INTAKE',
    final_protocol TEXT,
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Execution Logs table
CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisory_id UUID REFERENCES advisories(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    execution_step INT NOT NULL,
    thought_process TEXT NOT NULL,
    agent_output JSONB NOT NULL,
    duration_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Policy Configurations table
CREATE TABLE IF NOT EXISTS policy_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name VARCHAR(100) NOT NULL,
    risk_threshold INT DEFAULT 65 NOT NULL,
    auto_intervention_limit NUMERIC(10,2) DEFAULT 500.00,
    escalation_threshold INT DEFAULT 80
);

-- 2. ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users read advisories" ON advisories;
DROP POLICY IF EXISTS "Authenticated users insert advisories" ON advisories;
DROP POLICY IF EXISTS "Authenticated users view agent logs" ON agent_execution_logs;
DROP POLICY IF EXISTS "Anon public insert users" ON users;
DROP POLICY IF EXISTS "Anon public select users" ON users;
DROP POLICY IF EXISTS "Public select fields" ON fields;
DROP POLICY IF EXISTS "Public insert fields" ON fields;
DROP POLICY IF EXISTS "Public select advisories" ON advisories;
DROP POLICY IF EXISTS "Public insert advisories" ON advisories;
DROP POLICY IF EXISTS "Public update advisories" ON advisories;
DROP POLICY IF EXISTS "Public select logs" ON agent_execution_logs;
DROP POLICY IF EXISTS "Public insert logs" ON agent_execution_logs;

-- Policies
CREATE POLICY "Users view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users read advisories" ON advisories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users insert advisories" ON advisories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users view agent logs" ON agent_execution_logs FOR SELECT TO authenticated USING (true);

-- Additional Permissive Policies for Backend Anon/JWT Client Operations
CREATE POLICY "Anon public select users" ON users FOR SELECT USING (true);
CREATE POLICY "Anon public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select fields" ON fields FOR SELECT USING (true);
CREATE POLICY "Public insert fields" ON fields FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select advisories" ON advisories FOR ALL USING (true);
CREATE POLICY "Public select logs" ON agent_execution_logs FOR ALL USING (true);
CREATE POLICY "Public select policies" ON policy_configurations FOR ALL USING (true);

-- 3. SEED INITIAL DATA
INSERT INTO fields (id, owner_name, crop_type, historical_yield_score, coordinates_hash)
VALUES 
  ('FLD-2026-001', 'Green Valley Farm', 'Wheat', 88.50, 'a1b2c3'),
  ('FLD-2026-002', 'Sunrise Acres', 'Corn', 76.20, 'd4e5f6'),
  ('FLD-2026-003', 'River Bend Ranch', 'Soybean', 91.00, 'g7h8i9'),
  ('FLD-2026-004', 'Prairie Wind Farm', 'Rice', 69.80, 'j0k1l2'),
  ('FLD-2026-005', 'Cotton Ridge Estate', 'Cotton', 82.30, 'm3n4o5')
ON CONFLICT (id) DO NOTHING;

INSERT INTO policy_configurations (policy_name, risk_threshold, auto_intervention_limit, escalation_threshold)
VALUES ('Default Yield Protection', 65, 500.00, 80)
ON CONFLICT DO NOTHING;
