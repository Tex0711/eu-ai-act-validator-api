# ComplianceCode.eu — Sovereign Trust Style Guide

This document defines the visual identity for ComplianceCode.eu: **Sovereign Trust**. Use it for all marketing, docs, and UI to keep the brand consistent.

---

## 1. Color Palette

### Primary

| Name       | Hex       | Tailwind / Usage                                      |
|-----------|-----------|--------------------------------------------------------|
| **Dark Navy** | `#0A192F` | `bg-navy` — Page background, primary surfaces         |
| **Navy Light** | `#112240` | `bg-navy-light` — Cards, tables, elevated panels       |
| **Navy Lighter** | `#233554` | `bg-navy-lighter` — Optional subtle variation         |
| **Electric Blue** | `#00F0FF` | `text-electric`, `border-electric`, primary CTAs      |
| **Electric Dim** | `#00c4cc` | `hover:bg-electric-dim` — Hover states for buttons/links |

### Typography

| Name        | Hex       | Tailwind / Usage                          |
|-------------|-----------|-------------------------------------------|
| **Slate Light** | `#ccd6f6` | `text-slate-light` — Headings, emphasis   |
| **Slate**   | `#8892b0` | `text-slate` — Body text                  |
| **Slate Dark** | `#495670` | `text-slate-dark` — Muted, placeholders   |

### Semantic

- **Success / Allowed:** Prefer `text-electric` or green accent for “ALLOWED” states.
- **Rejected / Deny:** Use `text-red-400` (or equivalent) for “REJECTED” / DENY.
- **Warning / Beta:** Use `text-amber-200` on `bg-amber-900/30` with `border-amber-500/30` for beta disclaimers.

---

## 2. Typography

- **Font stack:** `system-ui, ui-sans-serif, sans-serif` (no custom font required).
- **Headings:** Bold, `text-slate-light`. Main hero: `text-4xl` / `text-5xl`.
- **Body:** `text-slate`, `text-sm` or base size. Keep line length readable (e.g. `max-w-2xl` for hero copy).
- **Code / Mono:** `font-mono`, `text-electric/90` or `text-slate` on `bg-navy` with `border border-electric/20`.

---

## 3. Sovereign Trust Design Principles

1. **Clean, professional, minimal**  
   No stock photos. Rely on structure, typography, and color.

2. **High-tech atmosphere**  
   Use border glows and subtle gradients:
   - `border-electric/20`, `border-electric/30` for panels and inputs.
   - `shadow-glow`: `0 0 20px rgba(0, 240, 255, 0.15)` for cards and CTAs.
   - Optional: `shadow-glow-strong` for emphasis.

3. **Instant transitions**  
   Reflect engine performance: use `transition-[duration:0ms]` (or Tailwind `duration-0`) for hover/focus so feedback feels immediate.

4. **EU-first, trust-first**  
   Copy and visuals should emphasize: EU hosting, statelessness, audit-ready logs, and legal clarity (e.g. Article references). Avoid generic “AI” imagery; prefer abstract tech (borders, grids, code).

5. **Accessibility**  
   Keep contrast sufficient: slate-light and electric on navy meet readability goals. Don’t rely on color alone for status (e.g. pair “REJECTED” with text + color).

---

## 4. Tailwind Quick Reference

```html
<!-- Page shell -->
<div class="bg-navy min-h-screen text-slate-light antialiased">

<!-- Card / panel -->
<div class="bg-navy-light border border-electric/20 rounded-xl p-6 shadow-glow">

<!-- Primary button -->
<button class="bg-electric text-navy hover:bg-electric-dim border border-electric transition-[duration:0ms]">

<!-- Link / nav -->
<a class="text-slate hover:text-electric transition-[duration:0ms]">

<!-- Code block -->
<pre class="bg-navy text-electric/90 p-4 rounded-lg border border-electric/20"><code>...</code></pre>

<!-- Beta disclaimer -->
<p class="text-amber-200 bg-amber-900/30 border border-amber-500/30 rounded px-3 py-2">
```

---

## 5. File References

- **Tailwind config:** `tailwind.config.mjs` — `colors.navy`, `colors.electric`, `colors.slate`, `boxShadow.glow`, `transitionDuration.0`.
- **Layout:** `src/layouts/Layout.astro` — Global nav, footer, and body classes.
- **Home:** `src/pages/index.astro` — Hero, three paths, value matrix, Article 5 playground.

Use this guide for any new page or component so the Sovereign Trust identity stays consistent.
