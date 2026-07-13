#!/usr/bin/env node
// Regenerates the Research Index data from the committed extraction.
//
//   Source of truth : scripts/research-index/extracted.json
//                     (array of { slug, sources: [...] }, one object per blog post,
//                      produced by deep-reading each post's source dossier at
//                      john-content-engine/pipeline/outlines/<slug>-sources.md)
//   Generated       : data/research.json      (Hugo reads this as site.Data.research)
//                     static/research.json     (served publicly at /research.json; the Dataset distribution)
//
// To add a post to the index: append its { slug, sources } object to extracted.json,
// then run `node scripts/research-index/build.mjs` and commit the regenerated files.
// Do NOT hand-edit data/research.json or static/research.json — they are derived.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SRC = join(HERE, 'extracted.json');
const UPDATED = '2026-07-13'; // bump when regenerating with new sources

const PILLARS = [
  { id: 1, name: 'Task Design & Decomposition', blurb: 'Scoping, decomposing, and speccing work so an agent finishes it on the first try.' },
  { id: 2, name: 'Agent Runtime', blurb: 'The machinery around the model — the context it sees, the harness it acts through, the loop it runs in.' },
  { id: 3, name: 'Evals & Verification', blurb: 'Knowing an agent’s output is actually correct, beyond a green build.' },
  { id: 4, name: 'Production Operations', blurb: 'Running agents in production: cost, permissions, failure modes, guardrails.' },
  { id: 5, name: 'Team & Process', blurb: 'Reviewing AI diffs, reviewer capacity, and how teams absorb agent output.' },
  { id: 6, name: 'Architecture Decisions', blurb: 'When agents help vs. hurt; single vs. multi-agent; build vs. buy.' },
];

function unesc(s) {
  if (s == null) return s;
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
function canonUrl(u) {
  const url = (u || '').trim();
  const am = url.match(/arxiv\.org\/(?:abs|html|pdf)\/(\d{4}\.\d{4,5})/i);
  if (am) return { display: `https://arxiv.org/abs/${am[1]}`, key: `arxiv:${am[1]}` };
  const key = url.replace(/^https?:\/\//i, '').replace(/#.*$/, '').replace(/\?.*$/, '').replace(/\/+$/, '').toLowerCase();
  return { display: url.replace(/#.*$/, '').replace(/\/+$/, ''), key };
}
function stripAuthorFromTitle(title, author) {
  const t = (title || '').trim();
  const i = t.indexOf(': ');
  if (i > 3) {
    const prefix = t.slice(0, i).trim(), a = (author || '').trim();
    const lp = prefix.toLowerCase(), la = a.toLowerCase();
    if (prefix.length > 3 && (la.includes(lp) || lp.includes(la))) return t.slice(i + 2).trim();
  }
  return t;
}
function contained(a, b) {
  const x = (a || '').toLowerCase().trim(), y = (b || '').toLowerCase().trim();
  if (Math.min(x.length, y.length) < 25) return false;
  return x.includes(y) || y.includes(x);
}

const vrank = { confirmed: 2, partial: 1, unreachable: 0 };
const vname = { 2: 'confirmed', 1: 'partial', 0: 'unreachable' };

const extracted = JSON.parse(readFileSync(SRC, 'utf8'));
const raw = [];
for (const r of extracted) for (const s of (r.sources || [])) raw.push({ ...s, _slug: r.slug });

const groups = new Map();
for (const s of raw) {
  const { display, key } = canonUrl(s.url);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ ...s, _display: display });
}
function uniqPush(arr, val, seen) {
  const k = (val || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!k || seen.has(k)) return;
  seen.add(k); arr.push(val);
}

const merged = [];
for (const group of groups.values()) {
  group.sort((a, b) => (vrank[b.verification] - vrank[a.verification]) || ((b.stat || '').length - (a.stat || '').length));
  const primary = group[0];
  const isData = group.some(g => g.class === 'research-data');
  const bestV = Math.max(...group.map(g => vrank[g.verification] ?? 1));
  const primaryPicks = group.map(g => (g.pillars && g.pillars.length ? g.pillars[0] : null)).filter(x => x != null);
  const freq = {};
  for (const p of primaryPicks) freq[p] = (freq[p] || 0) + 1;
  let home = null, best = -1;
  for (const p of Object.keys(freq).map(Number).sort((a, b) => a - b)) if (freq[p] > best) { best = freq[p]; home = p; }
  const pillars = [home != null ? home : ([...new Set(group.flatMap(g => g.pillars || []))].sort((x, y) => x - y)[0] || 1)];
  const powers = []; { const seen = new Set(); for (const g of group) uniqPush(powers, g._slug, seen); }
  const stat = unesc(primary.stat);
  const secondary = []; const seen = new Set([stat.toLowerCase()]);
  for (const g of group) if (g !== primary) uniqPush(secondary, unesc(g.stat), seen);
  for (const g of group) for (const sec of (g.secondary || [])) uniqPush(secondary, unesc(sec), seen);
  const sec2 = [];
  for (const s of secondary) { if (contained(stat, s)) continue; if (sec2.some(x => contained(x, s))) continue; sec2.push(s); }
  const author = unesc(primary.author);
  const date = (group.map(g => g.date).find(d => d && d !== 'undated')) || primary.date || '';
  merged.push({
    title: stripAuthorFromTitle(unesc(primary.title), author),
    author, url: primary._display, date,
    class: isData ? 'research-data' : 'practitioner',
    pillars, stat, proves: unesc(primary.proves), verification: vname[bestV], powers,
    secondary: sec2.slice(0, 4),
  });
}
merged.sort((a, b) => {
  const ca = a.class === 'research-data' ? 0 : 1, cb = b.class === 'research-data' ? 0 : 1;
  return (ca - cb) || a.author.localeCompare(b.author);
});

const data = { updated: UPDATED, pillars: PILLARS, sources: merged };
const json = JSON.stringify(data, null, 2) + '\n';
mkdirSync(join(ROOT, 'data'), { recursive: true });
mkdirSync(join(ROOT, 'static'), { recursive: true });
writeFileSync(join(ROOT, 'data', 'research.json'), json);
writeFileSync(join(ROOT, 'static', 'research.json'), json);

const byPillar = PILLARS.map(p => `${p.id}:${merged.filter(s => s.pillars.includes(p.id)).length}`).join(' ');
console.log(`research-index: ${raw.length} raw -> ${merged.length} unique sources  [${byPillar}]`);
console.log('wrote data/research.json + static/research.json');
