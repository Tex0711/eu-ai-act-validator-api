# Server Herstarten - Belangrijk!

## Waarom Herstarten?

Na code changes moet je de server **altijd** herstarten zodat de nieuwe code wordt geladen.

## Stappen

### 1. Vind de Terminal waar de Server Draait

- Kijk naar alle open terminals
- Zoek de terminal waar `npm run dev` draait
- Je ziet daar iets als:
  ```
  ▲ Astro ready
  ┃ Local    http://localhost:3000/
  ```

### 2. Stop de Server

- Klik in die terminal
- Druk `Ctrl + C` (of `Cmd + C` op Mac)
- De server stopt

### 3. Start Opnieuw

In dezelfde terminal:
```bash
npm run dev
```

### 4. Wacht tot de Server Klaar Is

Je ziet:
```
▲ Astro 4.x.x ready in 500 ms
┃ Local    http://localhost:3000/
```

### 5. Test Nu de API

In een **andere terminal**:
```bash
export API_KEY=a7f3b9c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8
npm run test-api
```

## Check de Server Logs

Na het testen, kijk in de **server terminal** (waar `npm run dev` draait). Je zou moeten zien:

```
[VectorSearch] Calling RPC with threshold 0.3...
[VectorSearch] RPC returned: 3 results
[VectorSearch] Found 3 articles with threshold 0.3
[ComplianceEngine] Found 3 relevant articles
```

Als je deze logs **niet** ziet, betekent dat:
- De server is niet herstart
- Of de nieuwe code is niet geladen

## Snelle Checklist

- [ ] Server terminal gevonden
- [ ] Server gestopt (Ctrl+C)
- [ ] Server opnieuw gestart (`npm run dev`)
- [ ] Server is klaar (zie "Astro ready")
- [ ] Test uitgevoerd in andere terminal
- [ ] Server logs gecheckt voor `[VectorSearch]` berichten

## Als Je Geen Server Terminal Ziet

1. Open een nieuwe terminal
2. Ga naar je project:
   ```bash
   cd /Users/tacovanderpoel/Development/compliance-code
   ```
3. Start de server:
   ```bash
   npm run dev
   ```
