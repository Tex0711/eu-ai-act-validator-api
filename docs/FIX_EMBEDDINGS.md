# Fix: Embeddings Probleem

## Probleem Gevonden!

De `test-vector` output laat zien:
- ✅ Embeddings worden correct gegenereerd (1536 dimensies)
- ✅ Artikelen zijn in de database (3 gevonden)
- ❌ RPC functie geeft 0 resultaten, zelfs met threshold 0.1

Dit betekent dat **de embeddings waarschijnlijk NULL zijn in de database**.

## Oplossing: Her-seed de Database

De embeddings zijn mogelijk niet correct opgeslagen. We moeten de database opnieuw seeden.

### Stap 1: Verwijder Oude Data (Optioneel)

In Supabase SQL Editor:
```sql
-- Verwijder alle oude artikelen
DELETE FROM compliance_knowledge;
```

### Stap 2: Her-seed de Database

```bash
npm run seed
```

Dit zou nu de embeddings correct moeten opslaan.

## Check of Embeddings Zijn Opgeslagen

Na het seeden, run deze query in Supabase SQL Editor:

```sql
-- Check of embeddings aanwezig zijn
SELECT 
  id,
  metadata->>'article_ref' as article_ref,
  CASE 
    WHEN embedding IS NULL THEN 'NULL - PROBLEM!'
    ELSE 'HAS VALUE ✓'
  END as embedding_status
FROM compliance_knowledge
LIMIT 5;
```

Als je "NULL - PROBLEM!" ziet, dan zijn de embeddings niet opgeslagen.

## Test de RPC Functie Direct

Na het seeden, test de RPC functie:

```sql
-- Test met een opgeslagen embedding
SELECT * FROM match_compliance_knowledge(
  (SELECT embedding FROM compliance_knowledge WHERE embedding IS NOT NULL LIMIT 1)::vector(1536),
  0.1,
  3
);
```

Als dit resultaten geeft, werkt alles!

## Als Embeddings Nog Steeds NULL Zijn

Mogelijk moet Supabase de embeddings in een speciaal formaat hebben. Probeer dan:

1. Check Supabase logs voor errors tijdens insert
2. Probeer een embedding handmatig in te voegen via SQL
3. Check of pgvector extension correct is geïnstalleerd

## Volgende Stappen

1. **Her-seed de database**: `npm run seed`
2. **Check embeddings**: Run de SQL query hierboven
3. **Test RPC functie**: Run de test query
4. **Test API opnieuw**: `npm run test-api`
