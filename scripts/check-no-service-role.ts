/**
 * Build-time guard: ensure the client bundle never references the
 * service-role key or service-role string literal. Service-role keys
 * bypass RLS and must NEVER ship to the browser.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const FORBIDDEN = ['SUPABASE_SERVICE_ROLE_KEY', 'SERVICE_ROLE_KEY'];
const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir: string, hits: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      walk(p, hits);
    } else if (exts.has(extname(name))) {
      const src = readFileSync(p, 'utf-8');
      for (const needle of FORBIDDEN) {
        if (src.includes(needle)) hits.push(`${p}: contains "${needle}"`);
      }
    }
  }
  return hits;
}

const hits = walk(SRC);
if (hits.length) {
  console.error('\n❌ SECURITY: service-role references found in client code:');
  for (const h of hits) console.error('   ' + h);
  console.error('\nThe service-role key bypasses RLS and must never ship to the browser.\n');
  process.exit(1);
}
console.log('[security-guard] OK — no service-role references in client code.');
