import { useState } from 'react';
import { Image as ImageIcon, Play, X } from 'lucide-react';
import PageBanner from '@/components/public/PageBanner';
import { useGallery, type GalleryItem } from '@/hooks/usePublicContent';
import { Button } from '@/components/ui/button';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';

const categories = ['All', 'Events', 'Seminars', 'Workshops', 'Testimonials'] as const;

export default function GalleryPage() {
  const { data = [], isLoading } = useGallery();
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const items = category === 'All' ? data : data.filter(item => item.category === category);
  return <><PublicSeo title="Gallery | Workshops & Events in Pune | Vivek Doba" description="Photos and videos from Vivek Doba’s workshops, seminars and coaching programs in Pune and across India." path="/gallery" schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }])]} /><PageBanner icon={ImageIcon} eyebrow="Gallery" title="Moments of transformation" description="Explore experiences from our events, seminars, workshops and seeker stories." />
    <section className="max-w-7xl mx-auto px-4 py-14"><div className="flex gap-2 overflow-x-auto pb-4 mb-6">{categories.map(item => <Button key={item} size="sm" variant={category === item ? 'default' : 'outline'} onClick={() => setCategory(item)}>{item}</Button>)}</div>{isLoading ? <p className="text-muted-foreground">Loading gallery…</p> : items.length === 0 ? <div className="border border-dashed border-primary/40 p-10 text-center"><ImageIcon className="w-10 h-10 mx-auto text-primary mb-3" /><h2 className="font-bold text-xl">Gallery moments coming soon</h2><p className="text-sm text-muted-foreground mt-2">Published workshop and event moments will appear here.</p></div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{items.map(item => <Button variant="ghost" key={item.id} onClick={() => setSelected(item)} className="group relative h-auto overflow-hidden rounded-lg bg-muted p-0 aspect-[4/3] text-left"><img src={item.thumbnail_url || item.media_url} alt={item.title} width="800" height="600" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent text-background font-semibold">{item.media_type === 'video' && <Play className="inline w-4 h-4 mr-1" />}{item.title}</span></Button>)}</div>}</section>
    {selected && <div className="fixed inset-0 z-[70] bg-foreground/90 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={selected.title}><Button size="icon" variant="secondary" aria-label="Close gallery item" className="absolute top-5 right-5" onClick={() => setSelected(null)}><X /></Button><div className="max-w-5xl w-full">{selected.media_type === 'video' ? <video src={selected.media_url} controls autoPlay className="w-full max-h-[75vh] bg-foreground" /> : <img src={selected.media_url} alt={selected.title} width="1200" height="900" className="w-full max-h-[75vh] object-contain" />}<h2 className="text-background text-xl font-bold mt-4">{selected.title}</h2>{selected.description && <p className="text-background/70 mt-1">{selected.description}</p>}</div></div>}
  </>;
}