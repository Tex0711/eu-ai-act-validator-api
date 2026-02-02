# Check Embeddings in Database

## Belangrijk: Check of Embeddings Zijn Opgeslagen

Run deze query in **Supabase SQL Editor**:

```sql
-- Check of embeddings aanwezig zijn
SELECT 
  id,
  metadata->>'article_ref' as article,
  CASE 
    WHEN embedding IS NULL THEN 'NULL ❌ - PROBLEEM!'
    ELSE 'HAS VALUE ✓'
  END as embedding_status,
  pg_typeof(embedding) as embedding_type
FROM compliance_knowledge
ORDER BY created_at DESC
LIMIT 11;
```

## Als Embeddings NULL Zijn

Dan moeten we een andere manier vinden om ze op te slaan. Mogelijk moet je:

1. **Check Supabase Logs** voor errors tijdens insert
2. **Probeer handmatig inserten** via SQL om te zien welk formaat werkt

## Test Handmatige Insert

Run dit in Supabase SQL Editor om te testen welk formaat werkt:

```sql
-- Test 1: Insert met array string formaat
INSERT INTO compliance_knowledge (content, embedding, metadata)
VALUES (
  'Test article',
  '[0.1, 0.2, 0.3]'::vector(1536),  -- Dit werkt niet - te kort
  '{"article_ref": "TEST"}'::jsonb
);

-- Test 2: Check of het werkt
SELECT embedding IS NOT NULL as has_embedding 
FROM compliance_knowledge 
WHERE metadata->>'article_ref' = 'TEST';
```

## Mogelijke Oplossing

Als embeddings NULL blijven, kunnen we proberen:
1. Embeddings opslaan via raw SQL in plaats van via Supabase client
2. Een andere manier vinden om embeddings door te geven
3. Checken of er een Supabase configuratie probleem is

**Run eerst de check query hierboven en laat me weten wat je ziet!**
