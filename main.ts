// Hands in the make-your-own-bounty promo entry: reads POST.json (which names
// the published X post) from this repository and writes it to /output/POST.json,
// where the entry gate reads it. The entry is the post itself: a public quote
// of make.fun's make-your-own-bounty post, with a photo attached, make.fun /
// @makefunai and the entrant's play code in its text.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

let raw: string;
try {
  raw = readFileSync(join(botDir, 'POST.json'), 'utf8');
} catch {
  throw new Error(`POST.json not found in ${botDir} — the published X post has not been recorded yet`);
}
let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  throw new Error(`POST.json is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
}
if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  throw new Error('POST.json must be a JSON object with a url field');
}
const url = (parsed as { url?: unknown }).url;
if (url === undefined) {
  throw new Error('POST.json is missing the url field');
}
if (typeof url !== 'string') {
  throw new Error('POST.json url must be a string');
}
if (url.trim() !== url) {
  throw new Error('POST.json url must not have leading or trailing whitespace');
}
const match = /^https:\/\/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d+)$/.exec(url);
if (!match) {
  throw new Error('POST.json url must be a public X post address (https://x.com/<handle>/status/<id>), with a handle of 1-15 letters, digits or underscores and a numeric status id, and nothing after the id');
}
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'POST.json');
writeFileSync(outPath, JSON.stringify({ url }) + '\n');
const written: unknown = JSON.parse(readFileSync(outPath, 'utf8'));
if (typeof written !== 'object' || written === null || (written as { url?: unknown }).url !== url) {
  throw new Error(`failed to verify ${outPath} after writing`);
}
console.log('wrote', outPath, 'for', url);
