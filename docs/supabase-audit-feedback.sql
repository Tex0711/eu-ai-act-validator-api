-- Run this in Supabase SQL Editor to support the feedback loop.

-- 1. Add new columns to audit_logs (if not already present)
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS internal_analysis TEXT,
  ADD COLUMN IF NOT EXISTS risk_score NUMERIC;

-- 2. Create audit_feedback table (one row per human review)
CREATE TABLE IF NOT EXISTS audit_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audit_logs(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  corrected_decision TEXT,
  corrected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_feedback_audit_id ON audit_feedback(audit_id);

-- Optional: RLS (enable if you use Row Level Security)
-- ALTER TABLE audit_feedback ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role can manage feedback" ON audit_feedback
--   FOR ALL USING (auth.role() = 'service_role');
