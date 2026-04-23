// Generates the lead-magnet PDF from src/playbook/content.md
// Usage: node scripts/build-playbook-pdf.mjs
// Output: public/downloads/enterprise-genai-reliability-checklist.pdf

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const mdPath = resolve(root, 'src/playbook/content.md');
const outDir = resolve(root, 'public/downloads');
const outPath = resolve(outDir, 'enterprise-genai-reliability-checklist.pdf');

const md = await readFile(mdPath, 'utf8');

// Render markdown with GFM task lists as styled squares
marked.use({
  renderer: {
    checkbox({ checked }) {
      return `<span class="chk ${checked ? 'on' : ''}" aria-hidden="true"></span>`;
    },
  },
});

const body = marked.parse(md);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Enterprise GenAI Reliability Checklist</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --paper: #f8f5ef;
    --paper-dim: #f0ece3;
    --ink: #0f0f0e;
    --ink-muted: #5c5a55;
    --ink-faded: #9a968d;
    --rule: #d9d3c5;
    --amber: #c8542c;
    --moss: #2c5c4a;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: 'Inter', sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
  }
  .page {
    padding: 40pt 48pt 44pt 48pt;
  }
  h1 {
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    font-size: 36pt;
    line-height: 1;
    letter-spacing: -0.01em;
    margin: 0 0 8pt 0;
  }
  h1 + p em {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 14pt;
    color: var(--ink-muted);
  }
  h2 {
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    font-size: 20pt;
    margin: 24pt 0 8pt 0;
    letter-spacing: -0.01em;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 6pt;
    page-break-after: avoid;
  }
  h2:first-of-type { page-break-before: auto; }
  p {
    margin: 0 0 10pt 0;
    color: var(--ink);
  }
  p em {
    color: var(--ink-muted);
  }
  hr {
    border: none;
    border-top: 1px solid var(--rule);
    margin: 16pt 0;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 10pt 0;
  }
  ul li {
    margin: 0 0 6pt 0;
    padding-left: 22pt;
    position: relative;
    line-height: 1.5;
  }
  .chk {
    display: inline-block;
    width: 12pt;
    height: 12pt;
    border: 1.25pt solid var(--ink);
    margin-right: 8pt;
    vertical-align: -2pt;
    background: var(--paper);
    border-radius: 1pt;
  }
  .chk.on {
    background: var(--amber);
    border-color: var(--amber);
  }
  strong { font-weight: 600; }
  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5pt;
    background: var(--paper-dim);
    padding: 1pt 4pt;
    border-radius: 2pt;
  }
  a { color: var(--amber); text-decoration: none; }
  .masthead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10pt;
    border-bottom: 1.5pt solid var(--ink);
    margin-bottom: 24pt;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--ink-muted);
  }
  .masthead .dot {
    display: inline-block;
    width: 7pt;
    height: 7pt;
    background: var(--amber);
    border-radius: 50%;
    vertical-align: middle;
    margin-right: 8pt;
  }
  .content > p:first-of-type em {
    display: block;
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 14pt;
    color: var(--ink-muted);
    margin-bottom: 18pt;
  }
  .content > hr:first-of-type + p,
  .content > hr + p {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
    color: var(--ink-muted);
    letter-spacing: 0.02em;
  }
  h2 ~ p:first-of-type em {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 12pt;
    color: var(--ink-muted);
  }
  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    .page { padding: 40pt 48pt 48pt 48pt; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="masthead">
      <div><span class="dot"></span>Semsudin.com · Issue 01 · Playbook</div>
      <div>For CTOs shipping AI to production</div>
    </div>
    <div class="content">${body}</div>
  </div>
</body>
</html>`;

await mkdir(outDir, { recursive: true });
const tmpHtml = resolve(root, 'src/playbook/.preview.html');
await writeFile(tmpHtml, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();

console.log(`✓ Generated ${outPath}`);
