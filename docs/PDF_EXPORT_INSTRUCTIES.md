# PDF Export Instructies voor i-DEPOT Indiening

Het technische specificatie document is nu klaar voor export naar PDF. Hier zijn 3 methoden van eenvoudig naar professioneel:

---

## METHODE 1: Markdown PDF Extension (Snelst)

### Stap 1: Installeer VS Code extensie
1. Open Extensions (Cmd+Shift+X)
2. Zoek naar "Markdown PDF" (van yzane)
3. Klik "Install"

### Stap 2: Exporteer naar PDF
1. Open `TECHNICAL_SPECIFICATION_IDEPOSIT.md`
2. Rechtermuisknop op het bestand
3. Kies "Markdown PDF: Export (pdf)"
4. PDF wordt aangemaakt in dezelfde folder

**Let op:** Deze methode ondersteunt LaTeX voorblad niet perfect. Verwijder eventueel de `\newpage` en `\begin{center}` blokken als je deze methode gebruikt.

---

## METHODE 2: Pandoc (Meest Professioneel - AANBEVOLEN)

### Stap 1: Installeer Pandoc
```bash
# macOS (Homebrew)
brew install pandoc

# Of download van: https://pandoc.org/installing.html
```

### Stap 2: Installeer LaTeX (voor mooie PDF's)
```bash
# macOS - BasicTeX (kleiner, sneller)
brew install --cask basictex

# Of volledige MacTeX (groot, 4GB):
# brew install --cask mactex
```

### Stap 3: Genereer PDF
```bash
cd /Users/tacovanderpoel/Development/compliance-code

# Simpele versie (zonder LaTeX)
pandoc TECHNICAL_SPECIFICATION_IDEPOSIT.md -o ComplianceCode_iDEPOT_v1.0.pdf

# Professionele versie (met LaTeX, mooiere opmaak)
pandoc TECHNICAL_SPECIFICATION_IDEPOSIT.md \
  -o ComplianceCode_iDEPOT_v1.0.pdf \
  --pdf-engine=pdflatex \
  --toc \
  --number-sections \
  -V colorlinks=true \
  -V linkcolor=blue \
  -V geometry:margin=2.5cm
```

**Voordeel:** 
- Professionele typografie
- Automatische Table of Contents
- Genummerde secties
- Perfect voor i-DEPOT indiening

---

## METHODE 3: Online Tool (Geen installatie nodig)

### Optie A: Dillinger.io
1. Ga naar https://dillinger.io
2. Plak de inhoud van `TECHNICAL_SPECIFICATION_IDEPOSIT.md`
3. Klik op "Export as" → "PDF"
4. Download de PDF

**Let op:** Verwijder het LaTeX voorblad blok (tussen `\begin{center}` en `\end{center}`) als je deze methode gebruikt.

### Optie B: StackEdit
1. Ga naar https://stackedit.io
2. Nieuwe document → Plak content
3. Menu → Export to Disk → PDF

### Optie C: Markdown to PDF (online)
1. Ga naar https://www.markdowntopdf.com
2. Upload `TECHNICAL_SPECIFICATION_IDEPOSIT.md`
3. Klik "Convert"
4. Download PDF

---

## AANBEVOLEN WORKFLOW

**Voor de meest professionele i-DEPOT indiening:**

1. **Gebruik Pandoc** (Methode 2)
2. **Controleer de PDF** op:
   - ✓ Voorblad zichtbaar
   - ✓ Table of Contents compleet
   - ✓ Alle secties genummerd
   - ✓ Code blocks goed geformatteerd
   - ✓ Stroomschema's leesbaar

3. **Optioneel: Voeg logo toe**
   - Plaats een `logo.png` in de project folder
   - Het voorblad zal het logo automatisch invoegen

4. **Bestandsnaam voor i-DEPOT:**
   ```
   ComplianceCode_EU-AI-Act-Guardrail_Technical-Specification_v1.0_2026-01-31.pdf
   ```

---

## TROUBLESHOOTING

### Pandoc geeft "pdflatex not found"
```bash
# Installeer BasicTeX
brew install --cask basictex

# Update PATH
export PATH="/Library/TeX/texbin:$PATH"

# Probeer opnieuw
pandoc TECHNICAL_SPECIFICATION_IDEPOSIT.md -o output.pdf
```

### Code blocks te breed in PDF
Voeg dit toe aan pandoc command:
```bash
--variable monofont="Monaco"
--variable fontsize=10pt
```

### LaTeX errors
Gebruik simpele versie zonder LaTeX engine:
```bash
pandoc TECHNICAL_SPECIFICATION_IDEPOSIT.md \
  -o output.pdf \
  --from markdown \
  --to pdf
```

---

## FINALE CHECKLIST VOOR i-DEPOT

- [ ] PDF heeft professioneel voorblad
- [ ] Executive Summary aanwezig (pagina 2)
- [ ] Table of Contents compleet
- [ ] Alle secties genummerd (1, 1.1, 1.2, etc.)
- [ ] Code blocks en stroomschema's leesbaar
- [ ] Datum correct (31 januari 2026)
- [ ] Versienummer zichtbaar (v1.0)
- [ ] Copyright notice aanwezig
- [ ] Bestandsnaam beschrijvend en gedateerd
- [ ] PDF grootte < 10MB

---

## VOLGENDE STAPPEN NA PDF EXPORT

1. **Review de PDF** grondig
2. **Bewaar backup** van Markdown bronbestand
3. **i-DEPOT indiening** via https://www.boip.int/nl/ideposit
4. **Bewaar certificaat** na indiening

**Geschatte kosten i-DEPOT:** €25-30 voor 5 jaar bescherming

---

*Document gegenereerd op: 31 januari 2026*  
*Voor vragen: info@compliancecode.eu*
