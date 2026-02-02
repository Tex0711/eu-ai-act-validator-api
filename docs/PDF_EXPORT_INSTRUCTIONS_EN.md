# PDF Export Instructions for i-DEPOT Submission

The technical specification document is now ready for PDF export. Here are 3 methods from simple to professional:

---

## METHOD 1: Pandoc (Most Professional - RECOMMENDED)

### Step 1: Install Pandoc
```bash
# macOS (Homebrew)
brew install pandoc

# Or download from: https://pandoc.org/installing.html
```

### Step 2: Install LaTeX (for beautiful PDFs)
```bash
# macOS - BasicTeX (smaller, faster)
brew install --cask basictex

# Or full MacTeX (large, 4GB):
# brew install --cask mactex
```

### Step 3: Generate PDF with Annex
```bash
cd /Users/tacovanderpoel/Development/compliance-code

# Professional version with LaTeX
pandoc TECHNICAL_SPECIFICATION_IDEPOSIT_EN.md \
  -o ComplianceCode_EU-AI-Act-Guardrail_Technical-Specification_v1.0_EN.pdf \
  --pdf-engine=pdflatex \
  --toc \
  --number-sections \
  -V colorlinks=true \
  -V linkcolor=blue \
  -V geometry:margin=2.5cm \
  -V fontsize=11pt

# The CSV file will be referenced in the PDF
# Include it separately in i-DEPOT submission
```

**Advantages:**
- Professional typography
- Automatic Table of Contents
- Numbered sections
- Perfect for i-DEPOT submission

---

## METHOD 2: Markdown PDF Extension (Fastest)

### Step 1: Install VS Code extension
1. Open Extensions (Cmd+Shift+X)
2. Search for "Markdown PDF" (by yzane)
3. Click "Install"

### Step 2: Export to PDF
1. Open `TECHNICAL_SPECIFICATION_IDEPOSIT_EN.md`
2. Right-click on the file
3. Choose "Markdown PDF: Export (pdf)"
4. PDF will be created in the same folder

**Note:** This method may not perfectly support the LaTeX cover page. If issues occur, use the simplified version without LaTeX formatting.

---

## METHOD 3: Online Tool (No Installation Required)

### Option A: Dillinger.io
1. Go to https://dillinger.io
2. Paste content of `TECHNICAL_SPECIFICATION_IDEPOSIT_EN.md`
3. Click "Export as" → "PDF"
4. Download the PDF

**Note:** Remove the LaTeX cover block (between `\begin{center}` and `\end{center}`) if using this method.

### Option B: StackEdit
1. Go to https://stackedit.io
2. New document → Paste content
3. Menu → Export to Disk → PDF

### Option C: Markdown to PDF (online)
1. Go to https://www.markdowntopdf.com
2. Upload `TECHNICAL_SPECIFICATION_IDEPOSIT_EN.md`
3. Click "Convert"
4. Download PDF

---

## RECOMMENDED WORKFLOW

**For the most professional i-DEPOT submission:**

1. **Use Pandoc** (Method 1)
2. **Check the PDF** for:
   - ✓ Cover page visible
   - ✓ Table of Contents complete
   - ✓ All sections numbered
   - ✓ Code blocks well formatted
   - ✓ Flowcharts readable

3. **Include CSV Annex:**
   - Attach `audit-report-2026-02-01.csv` separately
   - Reference in main PDF as "Annex A"

4. **Recommended filename for i-DEPOT:**
   ```
   ComplianceCode_EU-AI-Act-Guardrail_Technical-Specification_v1.0_EN_2026-01-31.pdf
   ```

---

## TROUBLESHOOTING

### Pandoc gives "pdflatex not found"
```bash
# Install BasicTeX
brew install --cask basictex

# Update PATH
export PATH="/Library/TeX/texbin:$PATH"

# Try again
pandoc TECHNICAL_SPECIFICATION_IDEPOSIT_EN.md -o output.pdf
```

### Code blocks too wide in PDF
Add this to pandoc command:
```bash
--variable monofont="Monaco"
--variable fontsize=10pt
```

### LaTeX errors
Use simple version without LaTeX engine:
```bash
pandoc TECHNICAL_SPECIFICATION_IDEPOSIT_EN.md \
  -o output.pdf \
  --from markdown \
  --to pdf
```

---

## FINAL CHECKLIST FOR i-DEPOT

- [ ] PDF has professional cover page
- [ ] Executive Summary present (page 2)
- [ ] Table of Contents complete
- [ ] All sections numbered (1, 1.1, 1.2, etc.)
- [ ] Code blocks and flowcharts readable
- [ ] Date correct (January 31, 2026)
- [ ] Version number visible (v1.0)
- [ ] Copyright notice present
- [ ] Filename descriptive and dated
- [ ] PDF size < 10MB
- [ ] CSV annex included separately

---

## NEXT STEPS AFTER PDF EXPORT

1. **Review the PDF** thoroughly
2. **Save backup** of Markdown source file
3. **i-DEPOT submission** via https://www.boip.int/en/ideposit
4. **Save certificate** after submission

**Estimated i-DEPOT cost:** €25-30 for 5 years protection

---

## SUBMISSION PACKAGE

Your i-DEPOT submission should include:

1. **Main PDF:** Technical Specification (30-40 pages)
2. **Annex A:** `audit-report-2026-02-01.csv` (audit logs sample)
3. **Metadata:** 
   - Title: "EU AI Act Compliance Guardrail - Article-Specific Filtering Method"
   - Type: Technical Specification / Software Innovation
   - Date: January 31, 2026
   - Version: 1.0

---

*Document generated on: January 31, 2026*  
*For questions: info@compliancecode.eu*
