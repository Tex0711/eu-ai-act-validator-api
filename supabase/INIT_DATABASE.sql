-- ============================================
-- ComplianceCode.eu Database Initialization
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This creates all necessary tables, indexes, and functions

-- Step 1: Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create compliance_knowledge table
-- Stores chunks of EU AI Act text with vector embeddings
CREATE TABLE IF NOT EXISTS compliance_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes for compliance_knowledge
-- Vector similarity search index (IVFFlat for fast approximate search)
CREATE INDEX IF NOT EXISTS compliance_knowledge_embedding_idx 
ON compliance_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS compliance_knowledge_metadata_idx 
ON compliance_knowledge 
USING GIN (metadata);

-- Step 4: Create audit_logs table
-- Stores every request/response for compliance auditing
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  prompt TEXT NOT NULL,
  context JSONB,
  decision VARCHAR(10) NOT NULL CHECK (decision IN ('ALLOW', 'DENY', 'WARNING')),
  reason TEXT NOT NULL,
  article_ref VARCHAR(50),
  response_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS audit_logs_decision_idx ON audit_logs(decision);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_article_ref_idx ON audit_logs(article_ref);

-- Step 6: Create semantic search function
-- This function performs cosine similarity search on embeddings
CREATE OR REPLACE FUNCTION match_compliance_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  embedding vector(1536),
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    compliance_knowledge.id,
    compliance_knowledge.content,
    compliance_knowledge.embedding,
    compliance_knowledge.metadata,
    1 - (compliance_knowledge.embedding <=> query_embedding) as similarity
  FROM compliance_knowledge
  WHERE 1 - (compliance_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY compliance_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Step 7: Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger on compliance_knowledge
CREATE TRIGGER update_compliance_knowledge_updated_at
BEFORE UPDATE ON compliance_knowledge
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification Queries (Optional)
-- ============================================
-- Run these to verify everything was created correctly:

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('compliance_knowledge', 'audit_logs');

-- Check if pgvector extension is enabled
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if function exists
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name = 'match_compliance_knowledge';
