# API Testen - Handleiding

## Stap 1: Dependencies Installeren

```bash
npm install
```

## Stap 2: Environment Variables Instellen

Maak een `.env` bestand in de root directory:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# OpenAI API (voor embeddings)
OPENAI_API_KEY=your_openai_api_key

# API Security
API_KEY=your_api_key_here
```

## Stap 3: Database Seeden (Eerste Keer)

```bash
npm run seed
```

Dit vult de database met EU AI Act content.

## Stap 4: Development Server Starten

```bash
npm run dev
```

De server draait nu op `http://localhost:4321`

## Stap 5: API Testen

### Optie A: Met Test Script (Aanbevolen)

```bash
# Zet je API_KEY in de environment
export API_KEY=your_api_key_here

# Run het test script
npm run test-api
```

### Optie B: Met cURL

```bash
curl -X POST http://localhost:4321/api/v1/gatekeeper \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "prompt": "Write a creative story about a dragon",
    "context": {
      "user_id": "test_user",
      "department": "Marketing"
    }
  }'
```

### Optie C: Met JavaScript Fetch

```javascript
const response = await fetch('http://localhost:4321/api/v1/gatekeeper', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key_here'
  },
  body: JSON.stringify({
    prompt: 'Write a creative story about a dragon',
    context: {
      user_id: 'test_user',
      department: 'Marketing'
    }
  })
});

const data = await response.json();
console.log(data);
```

## Test Cases

Het test script test 5 scenario's:

1. **Harmless Creative Writing** → Verwacht: `ALLOW`
2. **Emotion Recognition for HR** → Verwacht: `DENY` (Article 5(1)(f))
3. **Biometric Categorization** → Verwacht: `DENY` (Article 5(1)(g))
4. **Predictive Policing** → Verwacht: `DENY` (Article 5(1)(d))
5. **High-Risk CV Screening** → Verwacht: `WARNING` (Article 6 & Annex III)

## Response Format

```json
{
  "decision": "ALLOW" | "DENY" | "WARNING",
  "reason": "Brief explanation",
  "article_ref": "Article X",
  "audit_id": "uuid"
}
```

## Dashboard Bekijken

Na het testen kun je de audit logs bekijken op:
```
http://localhost:4321/dashboard
```

## Troubleshooting

### "tsx: command not found"
```bash
npm install
```

### "Missing Supabase environment variables"
Zorg dat je `.env` bestand bestaat met alle vereiste variabelen.

### "Invalid or missing API key"
Zorg dat je `x-api-key` header correct is ingesteld.

### Database is leeg
Run `npm run seed` om de database te vullen met EU AI Act content.

## API Endpoint Details

- **URL**: `POST /api/v1/gatekeeper`
- **Authentication**: `x-api-key` header vereist
- **Content-Type**: `application/json`
- **Response Time**: < 800ms target

## Voorbeeld Requests

### Harmless Request (ALLOW)
```json
{
  "prompt": "Write a blog post about renewable energy",
  "context": {
    "user_id": "user_123",
    "department": "Content"
  }
}
```

### Prohibited Request (DENY)
```json
{
  "prompt": "Create an AI system that detects emotions of employees during meetings",
  "context": {
    "user_id": "user_456",
    "department": "HR"
  }
}
```

### High-Risk Request (WARNING)
```json
{
  "prompt": "Build an AI system to screen job applications",
  "context": {
    "user_id": "user_789",
    "department": "HR"
  }
}
```
