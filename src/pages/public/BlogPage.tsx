import { useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Clock3, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePosts } from '@/hooks/usePublicContent';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';

const categories = ['All', 'Business Growth', 'Leadership', 'Mindset', 'Health', 'Family', 'Sales'] as const;
const readingTime = (body: string) => Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 220));

export default function BlogPage() {
  const { data: posts = [], isLoading } = usePosts();
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const visible = category === 'All' ? posts : posts.filter(post => post.category === category);
  return <main className="bg-background"><PublicSeo title="Business, Health & Family Blog | Vivek Doba" description="Practical articles for Indian business owners on growth, leadership, sales, mindset, health and family balance by Vivek Doba." path="/blog" schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])]} />
    <section className="border-b bg-muted/30 py-14 sm:py-20"><div className="mx-auto max-w-6xl px-4"><p className="font-course-serif text-lg italic text-primary">Practical thinking for business owners</p><h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">Blog: Business, Health and Family, in Balance</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Ideas you can use to build a stronger business without ignoring the health and relationships that make success worth having.</p></div></section>
    <section className="mx-auto max-w-6xl px-4 py-12"><div className="mb-9 flex gap-2 overflow-x-auto pb-2" aria-label="Filter articles by category">{categories.map(item => <Button key={item} size="sm" variant={category === item ? 'default' : 'outline'} className="shrink-0" onClick={() => setCategory(item)}>{item}</Button>)}</div>
      {isLoading ? <p className="text-muted-foreground">Loading articles…</p> : visible.length === 0 ? <div className="border-y py-16 text-center"><BookOpen className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-2xl font-bold">Articles are being prepared</h2><p className="mx-auto mt-2 max-w-xl text-muted-foreground">Vivek Doba’s first articles are currently in draft and will appear here after review.</p></div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map(post => <article key={post.id} className="flex overflow-hidden rounded-md border bg-card"><div className="flex w-full flex-col">{post.cover_image ? <img src={post.cover_image} alt={post.title} width="960" height="540" loading="lazy" className="aspect-video object-cover" /> : <div className="flex aspect-video items-center justify-center bg-muted"><BookOpen className="h-10 w-10 text-primary" /></div>}<div className="flex flex-1 flex-col p-5"><span className="text-xs font-bold uppercase text-primary">{post.category}</span><h2 className="mt-2 text-xl font-bold leading-snug"><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.excerpt}</p><div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{post.author}</span><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{readingTime(post.body)} min</span>{post.published_at && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(post.published_at).toLocaleDateString('en-IN')}</span>}</div><Link to={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">Read article <ArrowRight className="h-4 w-4" /></Link></div></div></article>)}</div>}
    </section>
  </main>;
}