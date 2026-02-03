# Volgende Stappen voor ComplianceCode.eu Vector Search Fix

## TL;DR - Wat je moet doen

1. Run de SQL hieronder in Supabase SQL Editor
2. Test met `npm run test-cte`
3. Als dat werkt, test de API met `npm run test-api`

## Status
De ComplianceEngine is al bijgewerkt om `match_compliance_cte` te gebruiken. Je hoeft alleen nog de SQL-functie aan te maken.

## Wat we ontdekt hebben

Het probleem was dat PostgREST (Supabase's REST API) vector queries niet correct uitvoert wanneer:
1. Een plpgsql variabele (`vec vector(1536)`) wordt gebruikt in een multi-row query
2. De query meerdere rijen retourneert via `RETURN QUERY` of `FOR LOOP`

Single-value queries werkten WEL, maar multi-row queries gaven altijd lege resultaten.

## Oplossing: CTE (Common Table Expression)

Een SQL-functie met CTE's werkt omdat:
- Geen plpgsql variabelen nodig
- Pure SQL die direct wordt uitgevoerd
- De vector wordt berekend in een CTE en dan gebruikt via CROSS JOIN

## Te Doen

### Stap 1: Run deze SQL in Supabase SQL Editor

```sql
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

NOTIFY pgrst, 'reload schema';
```

### Stap 2: Test de CTE-functie

```bash
npm run test-cte
```

Dit zou nu resultaten moeten geven.

### Stap 3: Test de volledige API

Start de server (als die niet draait):
```bash
npm run dev
```

In een andere terminal:
```bash
export API_KEY=your_api_key_here
npm run test-api
```

## Als CTE niet werkt

Alternatieve aanpak die bewezen werkt:
1. Embedding opslaan in `query_embeddings` tabel
2. Query uitvoeren met stored embedding ID
3. Temp record verwijderen

De tabellen en functies hiervoor zijn al aangemaakt. Zie `CREATE_QUERY_EMBEDDINGS_TABLE.sql`.
