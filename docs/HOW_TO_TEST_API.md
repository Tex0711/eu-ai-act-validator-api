# Hoe Test Je de API? - Stap voor Stap

## Stap 1: Start de Server (Eerst!)

Open een terminal en start de development server:

```bash
npm run dev
```

Je ziet dan iets als:
```
  ▲ Astro 4.x.x ready in 500 ms

  ┃ Local    http://localhost:3000/
  ┃ Network  use --host to expose
```

**Laat deze terminal open staan!** De server moet blijven draaien.

## Stap 2: Open een NIEUWE Terminal

Open een **tweede terminal** (laat de eerste met `npm run dev` open staan).

## Stap 3: Haal je API_KEY uit .env

Open je `.env` bestand en zoek deze regel:
```bash
API_KEY=compliance_code_2024_secure_key_12345
```

Kopieer de waarde na `API_KEY=` (zonder de `API_KEY=` zelf).

Bijvoorbeeld, als je `.env` zegt:
```bash
API_KEY=mijn_secret_key_123
```

Dan is je API key: `mijn_secret_key_123`

## Stap 4: Zet de API_KEY in de Terminal

In je **tweede terminal** (niet de server terminal), typ:

```bash
export API_KEY=mijn_secret_key_123
```

**Vervang `mijn_secret_key_123` door je echte API_KEY uit je .env bestand!**

Bijvoorbeeld:
```bash
export API_KEY=compliance_code_2024_secure_key_12345
```

## Stap 5: Test de API

Nog steeds in de tweede terminal, typ:

```bash
npm run test-api
```

## Wat Gebeurt Er?

Het test script zal 5 test cases uitvoeren:
1. Harmless creative writing → Verwacht: ALLOW
2. Emotion recognition for HR → Verwacht: DENY
3. Biometric categorization → Verwacht: DENY
4. Predictive policing → Verwacht: DENY
5. High-risk CV screening → Verwacht: WARNING

Je ziet dan output zoals:
```
🧪 Testing ComplianceCode.eu API
==================================

[1/5] Test 1: Harmless Creative Writing
Expected: ALLOW
✅ PASSED (234ms)
   Decision: ALLOW
   Article: N/A
   Reason: ...
```

## Alternatief: Test Handmatig met cURL

Als je liever handmatig test, gebruik dan:

```bash
curl -X POST http://localhost:3000/api/v1/gatekeeper \
  -H "Content-Type: application/json" \
  -H "x-api-key: JE_API_KEY_HIER" \
  -d '{
    "prompt": "Write a creative story about a dragon",
    "context": {
      "user_id": "test_user",
      "department": "Marketing"
    }
  }'
```

**Vervang `JE_API_KEY_HIER` door je echte API_KEY!**

## Volledig Voorbeeld

Stel je `.env` heeft:
```bash
API_KEY=compliance_code_2024_secure_key_12345
```

Dan doe je in de terminal:

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test API
export API_KEY=compliance_code_2024_secure_key_12345
npm run test-api
```

## Troubleshooting

### "Invalid or missing API key"
- Check of je de juiste API_KEY hebt gebruikt
- Check of er geen extra spaties zijn
- Check of je `.env` bestand de juiste waarde heeft

### "Connection refused"
- Check of de server draait (`npm run dev`)
- Check of je op poort 3000 draait (niet 4321)

### "Cannot find module"
- Run eerst `npm install` als je dat nog niet hebt gedaan

## Na het Testen

Na het testen kun je de audit logs bekijken op:
```
http://localhost:3000/dashboard
```

Daar zie je alle API calls die je hebt gemaakt!
