/**
 * Export knowledge + prompt embeddings for the Rust engine benchmark.
 * Writes engine-rust/data/knowledge.json and engine-rust/data/prompt_embeddings.json.
 *
 * Requires: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (for knowledge).
 * Usage: node scripts/export-for-rust-engine.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ENGINE_DATA = path.join(__dirname, '..', 'engine-rust', 'data');
const SCENARIOS_CSV = path.join(ENGINE_DATA, 'scenarios_36.csv');

async function embedOne(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Format: "prompt",ALLOW  (decision has no quotes)
    const match = line.match(/^"(.*)",(ALLOW|DENY|WARNING)\s*$/);
    if (match) {
      rows.push({ prompt: match[1].replace(/""/g, '"'), expected_decision: match[2] });
    }
  }
  return rows;
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('Set OPENAI_API_KEY to generate prompt embeddings.');
    process.exit(1);
  }

  if (!fs.existsSync(SCENARIOS_CSV)) {
    console.error('Scenarios file not found:', SCENARIOS_CSV);
    process.exit(1);
  }
  const scenariosContent = fs.readFileSync(SCENARIOS_CSV, 'utf8');
  const scenarios = parseCsv(scenariosContent);
  if (scenarios.length === 0) {
    console.error('No scenarios parsed from', SCENARIOS_CSV, '(check CSV format: "prompt",expected_decision)');
    process.exit(1);
  }
  console.log('Scenarios:', scenarios.length);

  const promptEmbeddings = [];
  for (let i = 0; i < scenarios.length; i++) {
    process.stdout.write(`Embedding prompt ${i + 1}/${scenarios.length}... `);
    const embedding = await embedOne(scenarios[i].prompt);
    promptEmbeddings.push({ prompt: scenarios[i].prompt, embedding });
    console.log('ok');
    await new Promise((r) => setTimeout(r, 100));
  }

  fs.mkdirSync(ENGINE_DATA, { recursive: true });
  fs.writeFileSync(
    path.join(ENGINE_DATA, 'prompt_embeddings.json'),
    JSON.stringify(promptEmbeddings, null, 0)
  );
  console.log('Wrote engine-rust/data/prompt_embeddings.json');

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: rows, error } = await supabase
      .from('compliance_knowledge')
      .select('id, content, metadata, embedding')
      .not('embedding', 'is', null);
    if (error) {
      console.error('Supabase error:', error.message);
    } else if (rows && rows.length > 0) {
      const chunks = rows.map((r) => ({
        id: r.id,
        content: r.content,
        metadata: r.metadata,
        embedding: typeof r.embedding === 'string' ? JSON.parse(r.embedding) : r.embedding,
      }));
      fs.writeFileSync(
        path.join(ENGINE_DATA, 'knowledge.json'),
        JSON.stringify(chunks, null, 2)
      );
      console.log('Wrote engine-rust/data/knowledge.json (' + chunks.length + ' chunks)');
    }
  } else {
    console.log('Supabase not configured; skipping knowledge.json (use existing fixture).');
  }

  console.log('Done. Run: cd engine-rust && cargo run --release -- benchmark');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
