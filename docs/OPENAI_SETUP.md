# OpenAI API Key Setup - Stap voor Stap

## Stap 1: API Key Aanmaken

1. **Ga naar OpenAI Platform**
   - Open: https://platform.openai.com
   - Log in met je account

2. **Navigeer naar API Keys**
   - Klik op je profiel (rechtsboven)
   - Klik op "API keys" of ga direct naar: https://platform.openai.com/api-keys

3. **Maak een nieuwe key aan**
   - Klik op "Create new secret key"
   - Geef het een naam (bijv. "ComplianceCode" of "EU AI Act Compliance")
   - Klik op "Create secret key"
   - **BELANGRIJK:** Kopieer de key direct! Je ziet hem maar één keer.
   - De key ziet er zo uit: `sk-proj-abc123def456ghi789jkl012mno345pqr`

## Stap 2: API Key in .env Bestand Zetten

1. **Open je .env bestand** (in je project root)

2. **Zoek deze regel:**
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Vervang `your_openai_api_key` door je echte key:**
   ```bash
   OPENAI_API_KEY=sk-proj-je-echte-key-hier
   ```

4. **Belangrijk:**
   - Geen quotes (`"` of `'`) rondom de key
   - Geen spaties voor of na de `=`
   - De hele key op één regel

## Stap 3: Credits Controleren

1. **Ga naar Billing**
   - In OpenAI Platform: https://platform.openai.com/account/billing
   - Check of je credits hebt
   - Voor embeddings heb je credits nodig (niet gratis)

2. **Als je geen credits hebt:**
   - Ga naar "Payment methods"
   - Voeg een betaalmethode toe
   - Er is meestal een kleine start credit ($5-10)

## Stap 4: Test of het Werkt

Na het invullen van je API key:

```bash
npm run seed
```

Je zou nu moeten zien:
```
Starting database seeding...
Processing Article 5(1)(a)...
Generated embedding (1536 dimensions)
✓ Successfully inserted Article 5(1)(a)
...
```

## Troubleshooting

### "Unauthorized" error blijft
- Check of de key correct gekopieerd is (geen extra spaties)
- Check of je credits hebt op je account
- Check of de key niet verlopen is

### "Insufficient credits" error
- Je hebt credits nodig voor embeddings
- Ga naar billing en voeg een betaalmethode toe

### Key werkt niet
- Maak een nieuwe key aan
- Zorg dat je de juiste key gebruikt (niet de organization key)

## Voorbeeld .env Bestand

Na het invullen zou je .env er zo uit moeten zien:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API (for compliance evaluation)
GEMINI_API_KEY=your_gemini_api_key

# OpenAI API (for embeddings - recommended for MVP)
OPENAI_API_KEY=your_openai_api_key

# API Security
API_KEY=your_api_key_here

# Environment
NODE_ENV=development
```

## Volgende Stappen

Na het succesvol seeden:
1. ✅ Database is gevuld met EU AI Act content
2. ⏳ Start de dev server: `npm run dev`
3. ⏳ Test de API: `npm run test-api`
4. ⏳ Bekijk de dashboard: http://localhost:3000/dashboard
