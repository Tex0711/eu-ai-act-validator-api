# Troubleshooting: Vector Search Probleem

## Probleem
De API geeft altijd "Unable to retrieve relevant EU AI Act articles" terug, ook al zijn er 11 artikelen in de database en werkt de vector search functie.

## Debug Output Analyse

Uit `npm run debug-db`:
- ✅ 11 artikelen in database
- ❌ Embeddings zijn NULL wanneer gelezen via `select()`
- ✅ Vector search functie werkt WEL (geeft 3 resultaten met 100%, 80%, 74.8% similarity)

## Conclusie

De embeddings zijn WEL opgeslagen (anders zou de search niet werken), maar:
1. Ze worden niet correct gelezen door TypeScript via normale `select()`
2. De RPC functie `match_compliance_knowledge` werkt wel correct
3. Het probleem zit in hoe de ComplianceEngine de resultaten verwerkt

## Oplossing

De ComplianceEngine gebruikt al de RPC functie, dus het probleem moet zijn:
1. De threshold is te hoog (0.7) → Verlaagd naar 0.5 met fallback 0.3 ✅
2. De resultaten worden niet correct getransformeerd → Toegevoegd mapping ✅
3. Mogelijk een probleem met hoe Supabase de embeddings teruggeeft

## Test Stappen

1. **Herstart de server** (belangrijk na code changes):
   ```bash
   # Stop de server (Ctrl+C)
   npm run dev
   ```

2. **Test opnieuw**:
   ```bash
   export API_KEY=je_api_key
   npm run test-api
   ```

3. **Check de server logs** voor error messages

## Als het nog steeds niet werkt

Check de Supabase logs:
- Ga naar Supabase Dashboard → Logs
- Kijk naar de RPC functie calls
- Check of er errors zijn

## Mogelijke Oorzaken

1. **Threshold te hoog**: ✅ Opgelost (verlaagd naar 0.5)
2. **Embedding formaat**: Mogelijk geeft Supabase embeddings terug als string
3. **Type mismatch**: TypeScript verwacht number[] maar krijgt iets anders
4. **RPC functie probleem**: Mogelijk geeft de functie geen data terug in het juiste formaat

## Debug Queries voor Supabase

Run deze in Supabase SQL Editor:

```sql
-- Test de RPC functie direct
SELECT * FROM match_compliance_knowledge(
  (SELECT embedding FROM compliance_knowledge WHERE embedding IS NOT NULL LIMIT 1)::vector(1536),
  0.3,
  3
);

-- Check embedding formaat
SELECT 
  id,
  metadata->>'article_ref' as article,
  pg_typeof(embedding) as embedding_type,
  CASE 
    WHEN embedding IS NULL THEN 'NULL'
    ELSE 'HAS VALUE'
  END as status
FROM compliance_knowledge
LIMIT 5;
```
