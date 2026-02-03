-- Add detected_pii_types to audit_logs (GDPR: only types, never raw PII)
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS detected_pii_types JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN audit_logs.detected_pii_types IS 'PII placeholder types found in masked prompt (e.g. ["EMAIL","ID"]). Never stores raw PII.';
