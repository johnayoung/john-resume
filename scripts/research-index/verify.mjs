#!/usr/bin/env node
// Re-verify the Research Index: every source URL still resolves, and (best-effort)
// the page still contains the verbatim stat cited.
//   Run: node scripts/research-index/verify.mjs
// Exit 1 if any source is DEAD (404/410/DNS) so a scheduled run turns red.
// 403/429/timeout are BLOCKED (bot-block, expected); a missing stat is DRIFT — both warn only.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const sources = JSON.parse(readFileSync(join(ROOT, 'data', 'research.json'), 'utf8')).sources;

const UA = 'Mozilla/5.0 (compatible; jyoung.dev-linkcheck/1.0; +https://jyoung.dev/research/)';
const CONCURRENCY = 6;
const TIMEOUT = 20000;

const norm = s => (s || '').toLowerCase()
  .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ')
  .replace(/[^a-z0-9%.$ ]/g, ' ').replace(/\s+/g, ' ').trim();

function claimProbe(stat) {
  const numbers = (stat.match(/\d[\d,.]*%?/g) || []).filter(n => n.length >= 2);
  const phrase = norm(stat).split(' ').filter(Boolean).slice(0, 6).join(' ');
  return { numbers, phrase };
}

async function check(src) {
  const r = { url: src.url, author: src.author };
  let res;
  try {
    res = await fetch(src.url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
      redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch (e) {
    r.state = /(ENOTFOUND|EAI_AGAIN|ECONNREFUSED|certificate)/i.test(String(e)) ? 'DEAD' : 'BLOCKED';
    r.note = String(e.name || e).slice(0, 40);
    return r;
  }
  r.status = res.status;
  if (res.status === 404 || res.status === 410) { r.state = 'DEAD'; return r; }
  if (res.status === 403 || res.status === 429 || res.status >= 500 || !res.ok) { r.state = 'BLOCKED'; return r; }
  // arXiv abstract pages don't contain body quotes; a 200 is enough (skip claim-match).
  if (/arxiv\.org\/abs\//i.test(src.url)) { r.state = 'OK'; return r; }
  let html = '';
  try { html = await res.text(); } catch { r.state = 'BLOCKED'; return r; }
  const text = norm(html);
  const { numbers, phrase } = claimProbe(src.stat);
  const numHit = numbers.length ? numbers.some(n => text.includes(n.toLowerCase())) : null;
  const phraseHit = phrase.length > 8 ? text.includes(phrase) : null;
  r.state = (numHit || phraseHit) ? 'OK' : 'DRIFT';
  return r;
}

const results = [];
let cursor = 0;
async function worker() { while (cursor < sources.length) { const i = cursor++; results[i] = await check(sources[i]); } }
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const by = s => results.filter(r => r.state === s);
const dead = by('DEAD'), drift = by('DRIFT'), blocked = by('BLOCKED'), ok = by('OK');
console.log(`Research index link check — ${results.length} sources`);
console.log(`  OK ${ok.length}  DRIFT ${drift.length}  BLOCKED ${blocked.length}  DEAD ${dead.length}`);
if (dead.length) { console.log('\nDEAD (hard — fix or remove):'); dead.forEach(r => console.log(`  x [${r.status || r.note}] ${r.author} — ${r.url}`)); }
if (drift.length) { console.log('\nDRIFT (cited stat not found — may be paraphrase/JS/paywall, review):'); drift.forEach(r => console.log(`  ~ ${r.author} — ${r.url}`)); }
if (blocked.length) { console.log('\nBLOCKED (bot-block/timeout — expected, informational):'); blocked.forEach(r => console.log(`  . [${r.status || r.note}] ${r.author} — ${r.url}`)); }
process.exit(dead.length ? 1 : 0);
