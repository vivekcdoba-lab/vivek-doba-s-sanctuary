/**
 * Operation Docs Generator
 * Runs as `prebuild` — regenerates dynamic docs sections from source of truth.
 * Outputs markdown files into src/docs/operation/_generated/
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'src/docs/operation/_generated');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const now = new Date().toISOString();
const stamp = `_Generated: ${now}_\n\n`;

// ───────────────────────────── ROUTES ─────────────────────────────
function generateRoutes() {
  const appPath = join(ROOT, 'src/App.tsx');
  if (!existsSync(appPath)) return;
  const src = readFileSync(appPath, 'utf-8');
  const re = /<Route\s+path="([^"]+)"\s+element=\{<([A-Za-z0-9_]+)/g;
  const rows: { path: string; component: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) rows.push({ path: m[1], component: m[2] });

  const groupOf = (p: string) => {
    if (p.startsWith('/admin')) return 'Admin';
    if (p.startsWith('/seeker')) return 'Seeker';
    if (p.startsWith('/coach')) return 'Coach';
    if (p.startsWith('/coaching')) return 'Coaching';
    if (['/login', '/register', '/forgot-password', '/'].some(x => p === x || p.startsWith(x + '/'))) return 'Public / Auth';
    return 'Other';
  };

  const groups: Record<string, typeof rows> = {};
  for (const r of rows) {
    const g = groupOf(r.path);
    (groups[g] ||= []).push(r);
  }
  for (const g of Object.values(groups)) g.sort((a, b) => a.path.localeCompare(b.path));

  let md = `# Routes & Pages\n\n${stamp}Total routes: **${rows.length}**\n\n`;
  for (const g of ['Admin', 'Coach', 'Coaching', 'Seeker', 'Public / Auth', 'Other']) {
    if (!groups[g]) continue;
    md += `## ${g} (${groups[g].length})\n\n| Path | Component |\n|---|---|\n`;
    for (const r of groups[g]) md += `| \`${r.path}\` | ${r.component} |\n`;
    md += '\n';
  }
  writeFileSync(join(OUT_DIR, 'routes.md'), md);
}

// ───────────────────────────── EDGE FUNCTIONS ─────────────────────────────
function generateEdgeFunctions() {
  const dir = join(ROOT, 'supabase/functions');
  if (!existsSync(dir)) return;
  const fns = readdirSync(dir).filter(d => {
    if (d.startsWith('_')) return false;
    return statSync(join(dir, d)).isDirectory();
  }).sort();

  let md = `# Edge Functions\n\n${stamp}Total: **${fns.length}** serverless functions deployed via Lovable Cloud.\n\n`;
  md += `| Function | Purpose (from header) | Secrets used |\n|---|---|---|\n`;
  for (const fn of fns) {
    const idx = join(dir, fn, 'index.ts');
    let purpose = '—';
    let secrets: string[] = [];
    if (existsSync(idx)) {
      const src = readFileSync(idx, 'utf-8');
      const headerMatch = src.match(/\/\*\*?([\s\S]{0,400}?)\*\//);
      if (headerMatch) {
        purpose = headerMatch[1].replace(/\n\s*\*\s?/g, ' ').trim().slice(0, 140) || '—';
      } else {
        const firstLine = src.split('\n').find(l => l.startsWith('//'));
        if (firstLine) purpose = firstLine.replace(/^\/\/\s*/, '').slice(0, 140);
      }
      const secretRe = /Deno\.env\.get\(['"]([A-Z0-9_]+)['"]\)/g;
      const set = new Set<string>();
      let s: RegExpExecArray | null;
      while ((s = secretRe.exec(src))) set.add(s[1]);
      secrets = [...set].filter(x => !['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].includes(x));
    }
    md += `| \`${fn}\` | ${purpose.replace(/\|/g, '\\|')} | ${secrets.join(', ') || '—'} |\n`;
  }
  writeFileSync(join(OUT_DIR, 'edge-functions.md'), md);
}

// ───────────────────────────── DATABASE SCHEMA ─────────────────────────────
function generateDatabaseSchema() {
  const migDir = join(ROOT, 'supabase/migrations');
  if (!existsSync(migDir)) return;
  const files = readdirSync(migDir).filter(f => f.endsWith('.sql')).sort();

  const tables = new Map<string, { columns: string[]; createdIn: string }>();
  const fnNames = new Set<string>();
  const policyByTable = new Map<string, string[]>();

  for (const f of files) {
    const sql = readFileSync(join(migDir, f), 'utf-8');

    const tblRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-z_]+)\s*\(([\s\S]*?)\);/gi;
    let tm: RegExpExecArray | null;
    while ((tm = tblRe.exec(sql))) {
      const name = tm[1];
      const body = tm[2];
      const cols = body
        .split(/,(?![^()]*\))/ )
        .map(c => c.trim())
        .filter(c => c && !/^(CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY)/i.test(c))
        .map(c => c.split(/\s+/)[0])
        .filter(c => c && /^[a-z_]/i.test(c));
      tables.set(name, { columns: cols, createdIn: f });
    }

    const altRe = /ALTER\s+TABLE\s+(?:public\.)?([a-z_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_]+)/gi;
    let am: RegExpExecArray | null;
    while ((am = altRe.exec(sql))) {
      const t = tables.get(am[1]);
      if (t && !t.columns.includes(am[2])) t.columns.push(am[2]);
    }

    const fnRe = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-z_][a-z0-9_]*)\s*\(/gi;
    let fm: RegExpExecArray | null;
    while ((fm = fnRe.exec(sql))) fnNames.add(fm[1]);

    const polRe = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(?:public\.)?([a-z_]+)/gi;
    let pm: RegExpExecArray | null;
    while ((pm = polRe.exec(sql))) {
      const arr = policyByTable.get(pm[2]) ?? [];
      if (!arr.includes(pm[1])) arr.push(pm[1]);
      policyByTable.set(pm[2], arr);
    }
  }

  const domains: Record<string, string[]> = {
    'Identity & Access': ['profiles', 'user_sessions', 'otp_codes', 'app_settings', 'system_settings', 'encryption_keys', 'key_rotation_log', 'seeker_links'],
    'Programs & Enrollment': ['courses', 'program_trainers', 'enrollments', 'batches', 'coach_seekers', 'course_session_rules'],
    'Sessions': ['sessions', 'session_topics', 'session_notes', 'session_audit_log', 'session_signatures', 'session_attendees', 'session_participants', 'session_private_notes', 'session_comments', 'session_notifications', 'session_templates', 'topics'],
    'Assessments': ['assessments', 'assessment_actions', 'assessment_config', 'lgt_assessments', 'wheel_of_life_assessments', 'firo_b_assessments', 'happiness_assessments', 'mooch_assessments', 'purusharthas_assessments', 'personal_swot_assessments', 'seeker_assessments', 'coach_assessment_feedback', 'lgt_applications'],
    'Daily Practice': ['daily_worksheets', 'daily_lgt_checkins', 'daily_logs', 'daily_priorities', 'daily_time_slots', 'daily_non_negotiable_log', 'seeker_non_negotiables', 'time_sheets', 'japa_log', 'streaks'],
    'Assignments & Submissions': ['assignments', 'submissions', 'weekly_reviews', 'weekly_challenges', 'weekly_challenge_progress', 'coach_weekly_challenges'],
    'Gamification': ['badge_definitions', 'seeker_badges', 'seeker_badge_progress', 'points_ledger', 'daily_affirmations', 'favorite_affirmations'],
    'Financial': ['payments', 'accounting_records', 'cashflow_records', 'daily_financial_log'],
    'Artha (Business)': ['business_profiles', 'business_competitors', 'business_mission_vision', 'business_swot_items', 'business_values', 'branding_strategy', 'marketing_strategy', 'sales_strategy', 'department_health', 'rnd_projects', 'team_members', 'swot_competitors', 'swot_entries'],
    'Communication': ['messages', 'notifications', 'announcements', 'announcement_reads', 'support_tickets', 'email_log', 'email_send_log', 'email_send_state', 'email_unsubscribe_tokens', 'suppressed_emails', 'worksheet_notifications', 'daily_progress_email_log', 'daily_report_settings'],
    'Documents & Agreements': ['documents', 'document_signatures', 'agreements', 'agreement_signatures', 'signature_requests'],
    'CRM (Leads & Clients)': ['leads', 'clients', 'client_feedback', 'follow_ups'],
    'Learning Center': ['learning_content', 'resources', 'user_content_progress', 'user_bookmarks'],
    'Calendar': ['calendar_events'],
  };

  let md = `# Database Schema\n\n${stamp}Tables: **${tables.size}** • Functions: **${fnNames.size}**\n\n`;
  md += `> Schema is reconstructed from migration files in \`supabase/migrations/\`. Source of truth is the running database; migrations are the authoritative change log.\n\n`;

  const placed = new Set<string>();
  for (const [domain, names] of Object.entries(domains)) {
    md += `## ${domain}\n\n`;
    for (const n of names) {
      const t = tables.get(n);
      if (!t) continue;
      placed.add(n);
      const policies = policyByTable.get(n) ?? [];
      md += `### \`${n}\`\n\n`;
      md += `**Columns** (${t.columns.length}): ${t.columns.map(c => `\`${c}\``).join(', ')}\n\n`;
      if (policies.length) md += `**RLS policies** (${policies.length}): ${policies.map(p => `_${p}_`).join('; ')}\n\n`;
      else md += `**RLS policies**: _none defined in migrations (may be set elsewhere)_\n\n`;
    }
  }

  const others = [...tables.keys()].filter(n => !placed.has(n)).sort();
  if (others.length) {
    md += `## Other / Uncategorized\n\n`;
    for (const n of others) {
      const t = tables.get(n)!;
      md += `### \`${n}\`\n\n**Columns** (${t.columns.length}): ${t.columns.map(c => `\`${c}\``).join(', ')}\n\n`;
    }
  }

  writeFileSync(join(OUT_DIR, 'database-schema.md'), md);

  let fmd = `# Database Functions\n\n${stamp}Total: **${fnNames.size}** functions in \`public\` schema (from migrations).\n\n`;
  fmd += [...fnNames].sort().map(n => `- \`${n}()\``).join('\n') + '\n\n';
  fmd += `> Full bodies (purpose, params, return type, SECURITY DEFINER status) are visible in the **Lovable Cloud → Database → Functions** view.\n`;
  writeFileSync(join(OUT_DIR, 'database-functions.md'), fmd);
}

// ───────────────────────────── STORAGE ─────────────────────────────
function generateStorage() {
  const md = `# Storage Buckets\n\n${stamp}| Bucket | Public | Purpose |\n|---|---|---|\n| \`avatars\` | ✅ | Seeker / coach profile pictures |\n| \`signatures\` | 🔒 | E-signature image uploads for agreements & sessions |\n| \`resources\` | 🔒 | Audio, PDF, video learning materials |\n| \`documents\` | 🔒 | Coaching agreements, intake forms, generated reports |\n\n## Folder conventions\n\n- \`avatars/{user_id}/avatar.{ext}\` — one current avatar per user\n- \`signatures/{session_id}/{signer_role}-{timestamp}.png\`\n- \`resources/{type}/{slug}.{ext}\` (type ∈ audio | pdf | video)\n- \`documents/{seeker_id}/{doc_kind}/{filename}\`\n\n## Access pattern\n\nSigned URLs (1h) are minted on demand for private buckets via \`supabase.storage.from(...).createSignedUrl(...)\`. Avatars are read directly from the public bucket.\n`;
  writeFileSync(join(OUT_DIR, 'storage-buckets.md'), md);
}

// ───────────────────────────── NAVIGATION ─────────────────────────────
function generateNavigation() {
  const layouts = [
    { role: 'Admin', file: 'src/components/AdminLayout.tsx' },
    { role: 'Coach', file: 'src/components/CoachLayout.tsx' },
    { role: 'Coaching', file: 'src/components/CoachingLayout.tsx' },
    { role: 'Seeker', file: 'src/components/SeekerLayout.tsx' },
  ];
  let md = `# Sidebar Navigation\n\n${stamp}`;
  for (const { role, file } of layouts) {
    const p = join(ROOT, file);
    if (!existsSync(p)) continue;
    const src = readFileSync(p, 'utf-8');
    md += `## ${role} (\`${file}\`)\n\n`;
    const itemRe = /label:\s*['"]([^'"]+)['"][^}]*?path:\s*['"]([^'"]+)['"]/g;
    const groupRe = /label:\s*['"]([A-Z][A-Z _-]+)['"]/g;
    const groups: { label: string; idx: number }[] = [];
    let gm: RegExpExecArray | null;
    while ((gm = groupRe.exec(src))) groups.push({ label: gm[1], idx: gm.index });
    const items: { label: string; path: string; idx: number }[] = [];
    let im: RegExpExecArray | null;
    while ((im = itemRe.exec(src))) items.push({ label: im[1], path: im[2], idx: im.index });

    if (groups.length === 0) {
      md += items.map(i => `- **${i.label}** → \`${i.path}\``).join('\n') + '\n\n';
      continue;
    }
    for (let g = 0; g < groups.length; g++) {
      const start = groups[g].idx;
      const end = groups[g + 1]?.idx ?? Infinity;
      const sectionItems = items.filter(i => i.idx > start && i.idx < end);
      if (!sectionItems.length) continue;
      md += `### ${groups[g].label}\n\n`;
      md += sectionItems.map(i => `- ${i.label} → \`${i.path}\``).join('\n') + '\n\n';
    }
  }
  writeFileSync(join(OUT_DIR, 'navigation.md'), md);
}

// ───────────────────────────── CHANGELOG ─────────────────────────────
function appendChangelog() {
  const path = join(OUT_DIR, 'changelog.md');
  let body = '';
  if (existsSync(path)) body = readFileSync(path, 'utf-8');
  if (!body) body = `# Build Changelog\n\nEvery production build appends an entry below. The newest entry is at the top.\n\n`;

  const migDir = join(ROOT, 'supabase/migrations');
  const migs = existsSync(migDir) ? readdirSync(migDir).filter(f => f.endsWith('.sql')).length : 0;
  const fnDir = join(ROOT, 'supabase/functions');
  const fns = existsSync(fnDir) ? readdirSync(fnDir).filter(d => !d.startsWith('_') && statSync(join(fnDir, d)).isDirectory()).length : 0;

  const header = body.split('\n').slice(0, 3).join('\n');
  const rest = body.split('\n').slice(3).join('\n');
  const entry = `\n## ${now}\n\n- Migrations on disk: ${migs}\n- Edge functions: ${fns}\n- Docs regenerated automatically.\n`;
  writeFileSync(path, header + '\n' + entry + rest);
}

// ───────────────────────────── INDEX ─────────────────────────────
function generateIndex() {
  const md = `# Operation Docs Index\n\n${stamp}This bundle is the single source of truth for "what the app does". Sections:\n\n1. Overview\n2. Architecture Map\n3. Roles & Auth\n4. Business Rules\n5. Workflows\n6. Feature Catalog\n7. Integrations\n8. Routes & Pages _(generated)_\n9. Sidebar Navigation _(generated)_\n10. Database Schema _(generated)_\n11. Database Functions _(generated)_\n12. Edge Functions _(generated)_\n13. Storage Buckets _(generated)_\n14. Glossary\n15. Build Changelog _(generated)_\n`;
  writeFileSync(join(OUT_DIR, '_index.md'), md);
}

console.log('[operation-docs] generating...');
generateRoutes();
generateEdgeFunctions();
generateDatabaseSchema();
generateStorage();
generateNavigation();
appendChangelog();
generateIndex();
console.log('[operation-docs] done.');
