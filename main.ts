// Hands in the make-your-own-bounty promo entry: reads POST.json (which names
// the published X post) from this repository and writes it to /output/POST.json,
// where the entry gate reads it. The entry is the post itself: a public quote
// of make.fun's make-your-own-bounty post, with a photo attached, make.fun /
// @makefunai and the entrant's play code in its text.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const parsed: unknown = JSON.parse(readFileSync(join(botDir, 'POST.json'), 'utf8'));
if (typeof parsed !== 'object' || parsed === null) {
  throw new Error('POST.json must be a JSON object with a url field');
}
const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string') {
  throw new Error('POST.json url must be a string');
}
if (!/^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+/.test(url)) {
  throw new Error('POST.json url must be a public X post address (https://x.com/<handle>/status/<id>)');
}
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'POST.json'), JSON.stringify({ url }) + '\n');
console.log('wrote', join(outDir, 'POST.json'), 'for', url);
