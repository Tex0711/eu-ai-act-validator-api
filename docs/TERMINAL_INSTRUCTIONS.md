# Terminal Instructies - Stap voor Stap

## Terminal 1: Development Server

### Als de server al draait:
1. **Stop de server** door `Ctrl + C` te drukken in Terminal 1
2. **Start opnieuw**:
   ```bash
   npm run dev
   ```

### Als de server niet draait:
1. **Start de server**:
   ```bash
   npm run dev
   ```

2. **Laat deze terminal open staan!** De server moet blijven draaien.

3. Je ziet dan iets als:
   ```
   ▲ Astro 4.x.x ready in 500 ms
   ┃ Local    http://localhost:3000/
   ```

## Terminal 2: API Testen

### Stap 1: Open een NIEUWE terminal
- Laat Terminal 1 open staan (met `npm run dev`)
- Open een tweede terminal venster

### Stap 2: Zet je API_KEY
```bash
export API_KEY=a7f3b9c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8
```

**Druk op Enter**

### Stap 3: Test de API
```bash
npm run test-api
```

## Wat Je Ziet

### Terminal 1 (Server):
```
▲ Astro ready
┃ Local    http://localhost:3000/
```

En tijdens API calls zie je logs zoals:
```
[VectorSearch] Calling RPC with threshold 0.5...
[ComplianceEngine] Found 3 relevant articles
```

### Terminal 2 (Test):
```
🧪 Testing ComplianceCode.eu API
[1/5] Test 1: Harmless Creative Writing
✅ PASSED
   Decision: ALLOW
...
```

## Samenvatting

**Terminal 1:**
```bash
npm run dev
# Laat dit open staan!
```

**Terminal 2:**
```bash
export API_KEY=a7f3b9c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8
npm run test-api
```

## Troubleshooting

### "Port 3000 already in use"
- Stop de andere server die op poort 3000 draait
- Of gebruik een andere poort

### "Connection refused"
- Check of Terminal 1 nog draait (`npm run dev`)
- Check of je op poort 3000 draait (niet 4321)

### "Invalid API key"
- Check of je de juiste API_KEY hebt gebruikt
- Check of er geen extra spaties zijn
