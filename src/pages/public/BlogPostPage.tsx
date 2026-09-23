import { ArrowLeft, BookOpen, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBlogPost } from '@/hooks/usePublicContent';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useBlogPost(slug);
  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-20 text-muted-foreground">Loading article…</div>;
  if (isError || !data) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><BookOpen className="w-10 h-10 mx-auto text-primary mb-3" /><h1 className="text-2xl font-bold">Article not found</h1><Link to="/blog" className="text-primary mt-4 inline-block">Return to Blog</Link></div>;
  return <article><div className="gradient-hero text-primary-foreground py-14"><div className="max-w-3xl mx-auto px-4"><Link to="/blog" className="flex items-center gap-1 text-sm mb-8 opacity-90"><ArrowLeft className="w-4 h-4" />Back to Blog</Link><h1 className="text-3xl sm:text-5xl font-bold">{data.title}</h1><p className="mt-5 flex items-center gap-2 text-sm opacity-80"><CalendarDays className="w-4 h-4" />{new Date(data.published_at || data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>{data.cover_image_url && <img src={data.cover_image_url} alt="" className="w-full max-w-4xl mx-auto max-h-[520px] object-cover" />}<div className="max-w-3xl mx-auto px-4 py-12"><div className="whitespace-pre-wrap leading-8 text-foreground">{data.content}</div></div></article>;
}