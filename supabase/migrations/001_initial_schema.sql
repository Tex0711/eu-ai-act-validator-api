-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Compliance Knowledge Base Table
-- Stores chunks of EU AI Act text with vector embeddings
CREATE TABLE IF NOT EXISTS compliance_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension (or adjust for your model)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS compliance_knowledge_embedding_idx 
ON compliance_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS compliance_knowledge_metadata_idx 
ON compliance_knowledge 
USING GIN (metadata);

-- Audit Logs Table
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

-- Index for querying audit logs by decision and date
CREATE INDEX IF NOT EXISTS audit_logs_decision_idx ON audit_logs(decision);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_article_ref_idx ON audit_logs(article_ref);

-- Function for semantic similarity search
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
DECLARE
  query_vec vector(1536);
BEGIN
  -- Explicitly cast to ensure proper type conversion from PostgREST
  -- PostgREST may pass arrays that need explicit casting
  query_vec := query_embedding::vector(1536);
  
  -- Als threshold <= 0, geef altijd de top N resultaten terug
  IF match_threshold <= 0 THEN
    RETURN QUERY
    SELECT
      compliance_knowledge.id,
      compliance_knowledge.content,
      compliance_knowledge.embedding,
      compliance_knowledge.metadata,
      1 - (compliance_knowledge.embedding <=> query_vec) as similarity
    FROM compliance_knowledge
    WHERE compliance_knowledge.embedding IS NOT NULL
    ORDER BY compliance_knowledge.embedding <=> query_vec
    LIMIT match_count;
  ELSE
    -- Normale threshold check
    RETURN QUERY
    SELECT
      compliance_knowledge.id,
      compliance_knowledge.content,
      compliance_knowledge.embedding,
      compliance_knowledge.metadata,
      1 - (compliance_knowledge.embedding <=> query_vec) as similarity
    FROM compliance_knowledge
    WHERE compliance_knowledge.embedding IS NOT NULL
      AND 1 - (compliance_knowledge.embedding <=> query_vec) > match_threshold
    ORDER BY compliance_knowledge.embedding <=> query_vec
    LIMIT match_count;
  END IF;
END;
$$;

-- CTE-based function for semantic similarity search
-- This version uses pure SQL with CTEs, which works correctly with PostgREST
-- (The plpgsql version above has issues with PostgREST and vector variables in multi-row queries)
CREATE OR REPLACE FUNCTION match_compliance_cte(
  query_embedding_json TEXT,
  match_count int DEFAULT 5
)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH query_vec AS (
    SELECT (ARRAY(SELECT jsonb_array_elements_text(query_embedding_json::jsonb)::float8))::vector(1536) as vec
  ),
  matches AS (
    SELECT
      ck.id,
      ck.content,
      ck.metadata,
      (1 - (ck.embedding <=> qv.vec))::float as similarity
    FROM compliance_knowledge ck
    CROSS JOIN query_vec qv
    WHERE ck.embedding IS NOT NULL
    ORDER BY ck.embedding <=> qv.vec
    LIMIT match_count
  )
  SELECT COALESCE(json_agg(row_to_json(matches)), '[]'::json) FROM matches;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_knowledge_updated_at
BEFORE UPDATE ON compliance_knowledge
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
