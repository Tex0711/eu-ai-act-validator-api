# Troubleshooting Guide

## Probleem: "tsx: command not found"

### Oorzaak
De dependencies zijn nog niet geïnstalleerd. De `node_modules` directory bestaat niet.

### Oplossing

**Stap 1: Installeer dependencies**
```bash
npm install
```

Als dit niet werkt vanwege network restrictions, probeer dan:

```bash
# Met yarn (als je dat hebt)
yarn install

# Of met pnpm
pnpm install

# Of forceer installatie
npm install --force
```

**Stap 2: Controleer of tsx geïnstalleerd is**
```bash
npx tsx --version
```

**Stap 3: Als tsx nog steeds niet werkt, gebruik npx**
In plaats van `npm run seed`, gebruik:
```bash
npx tsx scripts/seed-db.ts
```

## Alternatieve Oplossingen

### Optie 1: Gebruik npx direct
```bash
npx tsx scripts/seed-db.ts
npx tsx tests/compliance-test.ts
```

### Optie 2: Installeer tsx globaal
```bash
npm install -g tsx
```

### Optie 3: Gebruik ts-node (alternatief)
```bash
npm install --save-dev ts-node
```

En update `package.json` scripts:
```json
"seed": "ts-node scripts/seed-db.ts"
```

## Veelvoorkomende Problemen

### 1. Network Timeout tijdens npm install
```bash
# Verhoog timeout
npm install --timeout=60000

# Of gebruik een andere registry
npm install --registry https://registry.npmjs.org/
```

### 2. Permission Errors
```bash
# Op macOS/Linux
sudo npm install

# Of gebruik een node version manager (aanbevolen)
# nvm (Node Version Manager)
nvm install 18
nvm use 18
npm install
```

### 3. Cache Problemen
```bash
# Clear npm cache
npm cache clean --force

# Dan opnieuw installeren
npm install
```

## Checklist Voordat Je Start

- [ ] Node.js is geïnstalleerd (`node --version`)
- [ ] npm is geïnstalleerd (`npm --version`)
- [ ] `.env` bestand bestaat met alle vereiste variabelen
- [ ] `npm install` is succesvol uitgevoerd
- [ ] `node_modules` directory bestaat
- [ ] Supabase database is opgezet
- [ ] Database migrations zijn uitgevoerd

## Test of Alles Werkt

```bash
# Test 1: Check Node.js
node --version

# Test 2: Check npm
npm --version

# Test 3: Check of dependencies geïnstalleerd zijn
ls node_modules | head -5

# Test 4: Test tsx
npx tsx --version

# Test 5: Test de seed script (zonder uit te voeren)
npx tsx scripts/seed-db.ts --help || echo "Script bestaat"
```

## Als Niets Werkt

1. **Verwijder node_modules en package-lock.json**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js versie**
   - Vereist: Node.js 18 of hoger
   ```bash
   node --version
   ```

3. **Update npm**
   ```bash
   npm install -g npm@latest
   ```

4. **Probeer een andere package manager**
   - Yarn: `yarn install`
   - pnpm: `pnpm install`
