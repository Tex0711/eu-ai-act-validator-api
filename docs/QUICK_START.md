# Quick Start Guide

## ✅ Dependencies Geïnstalleerd!

De dependencies zijn nu geïnstalleerd. Je kunt nu verder gaan met de volgende stappen.

## Volgende Stappen

### 1. Environment Variables Instellen

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

### 2. Database Seeden (Eerste Keer)

```bash
npm run seed
```

Dit vult je Supabase database met EU AI Act content.

**Let op:** Zorg dat je:
- Supabase database hebt opgezet
- De migration hebt uitgevoerd (`supabase/migrations/001_initial_schema.sql`)
- Je `.env` bestand correct hebt ingevuld

### 3. Development Server Starten

```bash
npm run dev
```

De server start op `http://localhost:3000`

### 4. API Testen

**Optie A: Met test script**
```bash
export API_KEY=your_api_key_here
npm run test-api
```

**Optie B: Met cURL**
```bash
curl -X POST http://localhost:3000/api/v1/gatekeeper \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "prompt": "Write a creative story about a dragon",
    "context": {"user_id": "test", "department": "Marketing"}
  }'
```

### 5. Dashboard Bekijken

Na het testen van de API, bekijk de audit logs op:
```
http://localhost:3000/dashboard
```

## Troubleshooting

### Als `npm run seed` faalt:

1. **Check je .env bestand**
   ```bash
   cat .env
   ```

2. **Check Supabase connectie**
   - Zorg dat SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY correct zijn
   - Test de connectie in Supabase dashboard

3. **Check database schema**
   - Zorg dat je de migration hebt uitgevoerd
   - Check of `compliance_knowledge` tabel bestaat

### Als de API niet werkt:

1. **Check of server draait**
   ```bash
   curl http://localhost:3000
   ```

2. **Check API key**
   - Zorg dat je `x-api-key` header correct is
   - Check of API_KEY in .env overeenkomt

3. **Check logs**
   - Kijk naar de terminal output voor errors
   - Check browser console voor client-side errors

## Belangrijke Bestanden

- `.env` - Environment variables (niet in git!)
- `package.json` - Dependencies en scripts
- `scripts/seed-db.ts` - Database seeding script
- `scripts/test-api.js` - API test script
- `src/pages/dashboard/index.astro` - Dashboard pagina

## Handige Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build voor productie
npm run preview          # Preview production build

# Database
npm run seed             # Seed database met EU AI Act content

# Testing
npm run test             # Run compliance tests
npm run test-api         # Test API endpoint
```

## Volgende Stappen Na Setup

1. ✅ Dependencies geïnstalleerd
2. ⏳ Environment variables instellen
3. ⏳ Database seeden
4. ⏳ Server starten
5. ⏳ API testen
6. ⏳ Dashboard bekijken

Veel succes! 🚀
