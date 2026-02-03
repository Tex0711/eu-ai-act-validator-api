# PDF Export Instructies voor Technische Documentatie

Exporteer je interne technische specificatie (Markdown) naar PDF. Hier zijn 3 methoden van eenvoudig naar professioneel:

---

## METHODE 1: Markdown PDF Extension (Snelst)

### Stap 1: Installeer VS Code extensie
1. Open Extensions (Cmd+Shift+X)
2. Zoek naar "Markdown PDF" (van yzane)
3. Klik "Install"

### Stap 2: Exporteer naar PDF
1. Open je technische specificatiedocument (Markdown)
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
cd /pad/naar/jouw/project

# Simpele versie (zonder LaTeX; vervang JOUW_SPEC.md door je Markdown-bestand)
pandoc JOUW_SPEC.md -o Technical-Specification_v1.0.pdf

# Professionele versie (met LaTeX, mooiere opmaak)
pandoc JOUW_SPEC.md \
  -o Technical-Specification_v1.0.pdf \
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
- Geschikt voor formele documentatie of IP-registratie

---

## METHODE 3: Online Tool (Geen installatie nodig)

### Optie A: Dillinger.io
1. Ga naar https://dillinger.io
2. Plak de inhoud van je technische specificatiedocument (Markdown)
3. Klik op "Export as" → "PDF"
4. Download de PDF

**Let op:** Verwijder het LaTeX voorblad blok (tussen `\begin{center}` en `\end{center}`) als je deze methode gebruikt.

### Optie B: StackEdit
1. Ga naar https://stackedit.io
2. Nieuwe document → Plak content
3. Menu → Export to Disk → PDF

### Optie C: Markdown to PDF (online)
1. Ga naar https://www.markdowntopdf.com
2. Upload je technische specificatiedocument (Markdown)
3. Klik "Convert"
4. Download PDF

---

## AANBEVOLEN WORKFLOW

**Voor een professioneel indieningspakket:**

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

4. **Aanbevolen bestandsnaam:**
   ```
   Technical-Specification_v1.0_JJJJ-MM-DD.pdf
   ```

---

## TROUBLESHOOTING

### Pandoc geeft "pdflatex not found"
```bash
# Installeer BasicTeX
brew install --cask basictex

# Update PATH
export PATH="/Library/TeX/texbin:$PATH"

# Probeer opnieuw (vervang JOUW_SPEC.md door je Markdown-bestand)
pandoc JOUW_SPEC.md -o output.pdf
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
pandoc JOUW_SPEC.md -o output.pdf --from markdown --to pdf
```

---

## FINALE CHECKLIST

- [ ] PDF heeft professioneel voorblad
- [ ] Executive Summary aanwezig (pagina 2)
- [ ] Table of Contents compleet
- [ ] Alle secties genummerd (1, 1.1, 1.2, etc.)
- [ ] Code blocks en stroomschema's leesbaar
- [ ] Datum en versienummer zichtbaar
- [ ] Copyright notice aanwezig
- [ ] Bestandsnaam beschrijvend en gedateerd
- [ ] PDF grootte < 10MB

---

## VOLGENDE STAPPEN NA PDF EXPORT

1. **Review de PDF** grondig
2. **Bewaar backup** van je Markdown bronbestand
3. Voor formele IP-registratie: volg het proces van je rechtsgebied
4. **Bewaar certificaat** na indiening indien van toepassing

---

*Document gegenereerd op: 31 januari 2026*  
*Voor vragen: info@compliancecode.eu*
