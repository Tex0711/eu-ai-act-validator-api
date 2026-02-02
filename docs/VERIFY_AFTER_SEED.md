# Verificatie Na Seeding

## Stap 1: Test Vector Search Direct

Run dit om te zien of embeddings nu werken:

```bash
npm run test-vector
```

Je zou nu moeten zien dat de RPC functie resultaten geeft!

## Stap 2: Check Embeddings in Supabase

Run deze query in Supabase SQL Editor:

```sql
-- Check of embeddings aanwezig zijn
SELECT 
  metadata->>'article_ref' as article,
  CASE 
    WHEN embedding IS NULL THEN 'NULL ❌'
    ELSE 'HAS EMBEDDING ✓'
  END as status
FROM compliance_knowledge
ORDER BY created_at DESC
LIMIT 11;
```

Als je "HAS EMBEDDING ✓" ziet voor alle artikelen, zijn ze correct opgeslagen!

## Stap 3: Test de RPC Functie Direct

Run deze query in Supabase SQL Editor:

```sql
-- Test met een opgeslagen embedding
SELECT 
  metadata->>'article_ref' as article,
  similarity
FROM match_compliance_knowledge(
  (SELECT embedding FROM compliance_knowledge WHERE embedding IS NOT NULL LIMIT 1)::vector(1536),
  0.1,
  3
);
```

Als dit 3 resultaten geeft met similarity percentages, werkt alles!

## Stap 4: Test de API

```bash
export API_KEY=a7f3b9c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8
npm run test-api
```

Nu zou je moeten zien dat de API artikelen vindt en correcte beslissingen maakt!
