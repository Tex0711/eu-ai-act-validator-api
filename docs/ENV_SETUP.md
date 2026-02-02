# Environment Variables Setup

## Probleem
Het `.env` bestand ontbreekt, waardoor de seed script geen toegang heeft tot Supabase en API keys.

## Oplossing

### Stap 1: Kopieer .env.example naar .env
```bash
cp .env.example .env
```

### Stap 2: Vul je echte credentials in

Open het `.env` bestand en vervang de placeholder waarden:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# Gemini API (for compliance evaluation)
GEMINI_API_KEY=your_actual_gemini_key

# OpenAI API (for embeddings - recommended for MVP)
OPENAI_API_KEY=your_actual_openai_key

# API Security
API_KEY=your_custom_api_key_here

# Environment
NODE_ENV=development
```

## Waar krijg je deze keys vandaan?

### Supabase
1. Ga naar [supabase.com](https://supabase.com)
2. Maak een account/project aan
3. Ga naar Project Settings → API
4. Kopieer:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (niet de anon key!) → `SUPABASE_SERVICE_ROLE_KEY`

### Gemini API
1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Maak een nieuwe API key aan
3. Kopieer de key → `GEMINI_API_KEY`

### OpenAI API
1. Ga naar [platform.openai.com](https://platform.openai.com)
2. Ga naar API Keys
3. Maak een nieuwe key aan
4. Kopieer de key → `OPENAI_API_KEY`

### API Key (Custom)
Dit is je eigen API key voor authenticatie. Kies een willekeurige, veilige string:
```bash
API_KEY=compliance_code_2024_secure_key_12345
```

## Belangrijk!

- ✅ Het `.env` bestand staat al in `.gitignore` (niet committen!)
- ✅ Gebruik de **service_role** key voor Supabase (niet anon key)
- ✅ Zorg dat alle keys correct zijn voordat je `npm run seed` uitvoert

## Test of het werkt

Na het invullen van je `.env` bestand:

```bash
# Test of de variabelen geladen worden
node -e "require('dotenv').config(); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✓' : 'Missing ✗')"
```

Of probeer gewoon:
```bash
npm run seed
```

Als alles goed is ingesteld, zou je moeten zien:
```
Starting database seeding...
Processing Article 5(1)(a)...
Generated embedding (1536 dimensions)
✓ Successfully inserted Article 5(1)(a)
...
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check of `.env` bestand bestaat
- Check of `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` zijn ingevuld
- Check of er geen extra spaties zijn

### "Failed to generate embedding"
- Check of `OPENAI_API_KEY` correct is
- Check of je OpenAI account credits heeft

### "Vector search failed"
- Check of je Supabase database de migration heeft uitgevoerd
- Check of `pgvector` extension is geïnstalleerd
- Check of de `compliance_knowledge` tabel bestaat
