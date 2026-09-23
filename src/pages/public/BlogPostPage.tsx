import { ArrowLeft, BookOpen, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBlogPost } from '@/hooks/usePublicContent';
import PublicSeo, { breadcrumbSchema, personSchema, SITE_URL } from '@/components/public/PublicSeo';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useBlogPost(slug);
  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-20 text-muted-foreground">Loading article…</div>;
  if (isError || !data) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><PublicSeo title="Article Not Found | Vivek Doba" description="The requested article could not be found." path={`/blog/${slug || 'article'}`} noindex /><BookOpen className="w-10 h-10 mx-auto text-primary mb-3" /><h1 className="text-2xl font-bold">Article not found</h1><Link to="/blog" className="text-primary mt-4 inline-block">Return to Blog</Link></div>;
  const description = (data.excerpt || data.content).replace(/\s+/g, ' ').slice(0, 155);
  const path = `/blog/${data.slug}`;
  const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: data.title, description, datePublished: data.published_at || data.created_at, dateModified: data.published_at || data.created_at, mainEntityOfPage: `${SITE_URL}${path}`, author: { '@id': `${SITE_URL}/#vivek-doba` }, publisher: { '@id': `${SITE_URL}/#organization` }, ...(data.cover_image_url ? { image: data.cover_image_url } : {}) };
  return <article><PublicSeo title={`${data.title} | Vivek Doba`} description={description} path={path} image={data.cover_image_url} type="article" schemas={[personSchema, articleSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: data.title, path }])]} /><div className="gradient-hero text-primary-foreground py-14"><div className="max-w-3xl mx-auto px-4"><Link to="/blog" className="flex items-center gap-1 text-sm mb-8 opacity-90"><ArrowLeft className="w-4 h-4" />Back to Blog</Link><h1 className="text-3xl sm:text-5xl font-bold">{data.title}</h1><p className="mt-5 flex items-center gap-2 text-sm opacity-80"><CalendarDays className="w-4 h-4" />{new Date(data.published_at || data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>{data.cover_image_url && <img src={data.cover_image_url} alt={data.title} width="1200" height="675" fetchPriority="high" className="w-full max-w-4xl mx-auto max-h-[520px] object-cover" />}<div className="max-w-3xl mx-auto px-4 py-12"><div className="whitespace-pre-wrap leading-8 text-foreground">{data.content}</div></div></article>;
}