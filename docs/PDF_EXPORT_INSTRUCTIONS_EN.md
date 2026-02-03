# PDF Export Instructions for Technical Documentation

Export your internal technical specification (Markdown) to PDF. Here are 3 methods from simple to professional:

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
cd /path/to/your/project

# Professional version with LaTeX (replace YOUR_SPEC.md with your Markdown file)
pandoc YOUR_SPEC.md \
  -o Technical-Specification_v1.0.pdf \
  --pdf-engine=pdflatex \
  --toc \
  --number-sections \
  -V colorlinks=true \
  -V linkcolor=blue \
  -V geometry:margin=2.5cm \
  -V fontsize=11pt

# Reference annexes (e.g. CSV) in your submission package as needed
```

**Advantages:**
- Professional typography
- Automatic Table of Contents
- Numbered sections
- Suitable for formal documentation or IP registration

---

## METHOD 2: Markdown PDF Extension (Fastest)

### Step 1: Install VS Code extension
1. Open Extensions (Cmd+Shift+X)
2. Search for "Markdown PDF" (by yzane)
3. Click "Install"

### Step 2: Export to PDF
1. Open your technical specification Markdown file
2. Right-click on the file
3. Choose "Markdown PDF: Export (pdf)"
4. PDF will be created in the same folder

**Note:** This method may not perfectly support the LaTeX cover page. If issues occur, use the simplified version without LaTeX formatting.

---

## METHOD 3: Online Tool (No Installation Required)

### Option A: Dillinger.io
1. Go to https://dillinger.io
2. Paste content of your technical specification Markdown file
3. Click "Export as" → "PDF"
4. Download the PDF

**Note:** Remove the LaTeX cover block (between `\begin{center}` and `\end{center}`) if using this method.

### Option B: StackEdit
1. Go to https://stackedit.io
2. New document → Paste content
3. Menu → Export to Disk → PDF

### Option C: Markdown to PDF (online)
1. Go to https://www.markdowntopdf.com
2. Upload your technical specification Markdown file
3. Click "Convert"
4. Download PDF

---

## RECOMMENDED WORKFLOW

**For a professional submission package:**

1. **Use Pandoc** (Method 1)
2. **Check the PDF** for:
   - ✓ Cover page visible
   - ✓ Table of Contents complete
   - ✓ All sections numbered
   - ✓ Code blocks well formatted
   - ✓ Flowcharts readable

3. **Include annexes as needed:**
   - Attach CSV or other annexes separately
   - Reference in main PDF (e.g. "Annex A")

4. **Recommended filename:**
   ```
   Technical-Specification_v1.0_YYYY-MM-DD.pdf
   ```

---

## TROUBLESHOOTING

### Pandoc gives "pdflatex not found"
```bash
# Install BasicTeX
brew install --cask basictex

# Update PATH
export PATH="/Library/TeX/texbin:$PATH"

# Try again (replace YOUR_SPEC.md with your Markdown file)
pandoc YOUR_SPEC.md -o output.pdf
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
pandoc YOUR_SPEC.md -o output.pdf --from markdown --to pdf
```

---

## FINAL CHECKLIST

- [ ] PDF has professional cover page
- [ ] Executive Summary present (page 2)
- [ ] Table of Contents complete
- [ ] All sections numbered (1, 1.1, 1.2, etc.)
- [ ] Code blocks and flowcharts readable
- [ ] Date and version number visible
- [ ] Copyright notice present
- [ ] Filename descriptive and dated
- [ ] PDF size < 10MB
- [ ] Annexes included separately if required

---

## NEXT STEPS AFTER PDF EXPORT

1. **Review the PDF** thoroughly
2. **Save backup** of your Markdown source file
3. For formal IP registration (e.g. deposit schemes), follow your jurisdiction’s process
4. **Save any certificate** after submission

---

## SUBMISSION PACKAGE (EXAMPLE)

A typical submission package may include:

1. **Main PDF:** Technical specification (e.g. 30-40 pages)
2. **Annexes:** CSV, diagrams, or other supporting documents as needed
3. **Metadata:** Title, type (e.g. Technical Specification / Software), date, version

---

*Document generated on: January 31, 2026*  
*For questions: info@compliancecode.eu*
