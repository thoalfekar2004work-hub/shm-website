/**
 * Origin-claim sweep (spec §0.1 / §16).
 *
 * The rule has been narrowed twice by the owner, so it now works as an
 * allow-list rather than a blanket ban:
 *
 *   • "Rostfrei" — German for "stainless"/"rust-free", engraved on the
 *     instruments. Kept in copy by owner decision (2026-07-27).
 *   • "German stainless steel" / "ستانلس ستيل ألماني" — the owner states the
 *     STEEL is German-sourced while the instruments are made elsewhere
 *     (confirmed 2026-08-03). This exact phrasing is allowed.
 *
 * Everything else stays banned — in particular "Made in Germany" and
 * "صناعة ألمانية", which claim the instruments themselves are German-made.
 * That is a stronger, separately-regulated claim the owner has NOT made.
 *
 *   node scripts/check-banned-words.mjs [...dirs]
 *
 * Defaults to src, functions, public and dist when they exist. Exits non-zero
 * on any match, so it can gate a deploy.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/** Exact approved wordings, removed from a line before it is judged. */
const ALLOWED = [
  /German stainless steel/gi,
  /ستانلس ستيل ألماني/g,
];

const PATTERN = /german|germany|ألمان|صناعة ألمانية/i;

/** Strips the approved phrases so only unapproved origin claims are caught. */
const withoutAllowed = (text) =>
  ALLOWED.reduce((acc, re) => acc.replace(re, ''), text);

const TEXT_EXT = new Set([
  '.astro', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.css', '.html',
  '.md', '.txt', '.xml', '.svg', '.webmanifest',
]);

const SKIP_DIRS = new Set(['node_modules', '.git', '.astro', '.wrangler']);

const targets = process.argv.slice(2);
const dirs = (targets.length ? targets : ['src', 'functions', 'public', 'dist']).filter((d) =>
  existsSync(d),
);

const hits = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full);
      continue;
    }
    // Filenames count too — an image called "german-steel.jpg" would ship.
    if (PATTERN.test(entry.name)) {
      hits.push({ file: full, line: 0, text: '(filename)' });
    }
    if (!TEXT_EXT.has(path.extname(entry.name).toLowerCase())) continue;
    if ((await stat(full)).size > 3_000_000) continue;

    const content = await readFile(full, 'utf8').catch(() => '');
    content.split('\n').forEach((text, i) => {
      if (PATTERN.test(withoutAllowed(text))) {
        hits.push({ file: full, line: i + 1, text: text.trim().slice(0, 160) });
      }
    });
  }
}

for (const d of dirs) await walk(d);

if (hits.length) {
  console.error(`\n✗ origin-claim sweep FAILED — ${hits.length} match(es):\n`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  ${h.text}`);
  console.error('\nInstruments are Natra brand. Approved trust language only:');
  console.error('  Natra · CE marking · German stainless steel (Rostfrei) · QC before shipping · exchange guarantee');
  console.error('\nNote: "German stainless steel" is allowed (the steel is German-sourced).');
  console.error('"Made in Germany" / "صناعة ألمانية" is NOT — the instruments are made elsewhere.\n');
  process.exit(1);
}

console.log(`✓ origin-claim sweep passed (scanned: ${dirs.join(', ')})`);
