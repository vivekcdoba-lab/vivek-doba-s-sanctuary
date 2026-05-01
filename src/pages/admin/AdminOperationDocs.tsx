import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import mermaid from 'mermaid';
import Fuse from 'fuse.js';
import { Search, BookOpen, Download, Printer } from 'lucide-react';

// Static sections
import overview from '@/docs/operation/00-overview.md?raw';
import architecture from '@/docs/operation/01-architecture.md?raw';
import roles from '@/docs/operation/02-roles-auth.md?raw';
import rules from '@/docs/operation/03-business-rules.md?raw';
import workflows from '@/docs/operation/04-workflows.md?raw';
import features from '@/docs/operation/05-features.md?raw';
import integrations from '@/docs/operation/06-integrations.md?raw';
import glossary from '@/docs/operation/99-glossary.md?raw';

// Generated sections (regenerated on every build/dev start by vite plugin)
import routesMd from '@/docs/operation/_generated/routes.md?raw';
import navigationMd from '@/docs/operation/_generated/navigation.md?raw';
import schemaMd from '@/docs/operation/_generated/database-schema.md?raw';
import dbFnsMd from '@/docs/operation/_generated/database-functions.md?raw';
import edgeFnsMd from '@/docs/operation/_generated/edge-functions.md?raw';
import storageMd from '@/docs/operation/_generated/storage-buckets.md?raw';
import changelogMd from '@/docs/operation/_generated/changelog.md?raw';

type Section = { id: string; title: string; emoji: string; body: string; generated?: boolean };

const SECTIONS: Section[] = [
  { id: 'overview', title: 'Overview', emoji: '🌅', body: overview },
  { id: 'architecture', title: 'Architecture Map', emoji: '🗺️', body: architecture },
  { id: 'roles', title: 'Roles & Auth', emoji: '🔐', body: roles },
  { id: 'rules', title: 'Business Rules', emoji: '📐', body: rules },
  { id: 'workflows', title: 'Workflows', emoji: '🔄', body: workflows },
  { id: 'features', title: 'Feature Catalog', emoji: '🧩', body: features },
  { id: 'integrations', title: 'Integrations', emoji: '🔌', body: integrations },
  { id: 'routes', title: 'Routes & Pages', emoji: '🧭', body: routesMd, generated: true },
  { id: 'navigation', title: 'Sidebar Navigation', emoji: '📑', body: navigationMd, generated: true },
  { id: 'schema', title: 'Database Schema', emoji: '🗄️', body: schemaMd, generated: true },
  { id: 'db-fns', title: 'Database Functions', emoji: 'ƒ', body: dbFnsMd, generated: true },
  { id: 'edge-fns', title: 'Edge Functions', emoji: '⚡', body: edgeFnsMd, generated: true },
  { id: 'storage', title: 'Storage Buckets', emoji: '🪣', body: storageMd, generated: true },
  { id: 'glossary', title: 'Glossary', emoji: '📖', body: glossary },
  { id: 'changelog', title: 'Build Changelog', emoji: '📝', body: changelogMd, generated: true },
];

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const id = 'm-' + Math.random().toString(36).slice(2);
    mermaid.render(id, code).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(err => {
      if (ref.current) ref.current.innerHTML = `<pre class="text-xs text-destructive">${String(err)}</pre>`;
    });
  }, [code]);
  return <div ref={ref} className="my-4 overflow-x-auto" />;
}

export default function AdminOperationDocs() {
  const [activeId, setActiveId] = useState<string>('overview');
  const [query, setQuery] = useState('');

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  }, []);

  const fuse = useMemo(() => new Fuse(SECTIONS, { keys: ['title', 'body'], threshold: 0.4, ignoreLocation: true }), []);
  const visible = query.trim() ? fuse.search(query).map(r => r.item) : SECTIONS;
  const active = SECTIONS.find(s => s.id === activeId) ?? SECTIONS[0];

  const exportAll = () => {
    const all = SECTIONS.map(s => `# ${s.title}\n\n${s.body}`).join('\n\n---\n\n');
    const blob = new Blob([all], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vdts-operation-docs-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Operation Docs</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-3 h-3 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-border bg-background"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {visible.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                activeId === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
              }`}
            >
              <span>{s.emoji}</span>
              <span className="truncate">{s.title}</span>
              {s.generated && <span className="ml-auto text-[9px] px-1 rounded bg-muted text-muted-foreground">auto</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">📖 Read-only documentation. To change app behavior, ask in chat — docs refresh on every build.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportAll} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-foreground text-xs hover:bg-muted/80">
              <Download className="w-3 h-3" /> Markdown
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-foreground text-xs hover:bg-muted/80">
              <Printer className="w-3 h-3" /> Print
            </button>
          </div>
        </div>

        <article className="prose prose-sm dark:prose-invert max-w-3xl mx-auto px-6 py-8 prose-headings:scroll-mt-20 prose-pre:bg-muted prose-pre:text-foreground prose-code:text-primary prose-code:before:content-[''] prose-code:after:content-['']">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
            components={{
              code({ inline, className, children, ...props }: any) {
                const match = /language-mermaid/.exec(className || '');
                if (!inline && match) {
                  return <MermaidBlock code={String(children).trim()} />;
                }
                return <code className={className} {...props}>{children}</code>;
              },
              table: (p: any) => <div className="overflow-x-auto"><table {...p} /></div>,
            }}
          >
            {active.body}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
