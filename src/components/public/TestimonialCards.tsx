import { Quote, Star } from 'lucide-react';
import type { Testimonial } from '@/hooks/usePublicContent';

export function VideoTestimonialCard({ item }: { item: Testimonial }) {
  if (!item.youtube_id) return null;
  return <article className="overflow-hidden rounded-md border bg-card shadow-sm"><iframe className="aspect-video w-full" loading="lazy" src={`https://www.youtube-nocookie.com/embed/${item.youtube_id}`} title={`${item.name} shares their coaching experience`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><div className="p-5"><h3 className="font-bold">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">{[item.business, item.city].filter(Boolean).join(' · ')}</p>{item.quote && <p className="mt-4 leading-7 text-muted-foreground">“{item.quote}”</p>}</div></article>;
}

export function WrittenTestimonialCard({ item }: { item: Testimonial }) {
  if (!item.quote) return null;
  return <article className="flex flex-col rounded-md border bg-card p-6 shadow-sm"><Quote className="h-8 w-8 text-primary" /><blockquote className="mt-5 flex-1 text-lg leading-8">“{item.quote}”</blockquote>{item.rating && <div className="mt-5 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>{Array.from({ length: item.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-primary text-primary" />)}</div>}<footer className="mt-6 flex items-center gap-3">{item.photo ? <img src={item.photo} alt={`${item.name}, ${item.business || 'business owner'}`} width="64" height="64" loading="lazy" className="h-14 w-14 rounded-full object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-bold text-primary" aria-hidden="true">{item.name.charAt(0)}</div>}<div><p className="font-bold">{item.name}</p><p className="text-sm text-muted-foreground">{[item.business, item.city].filter(Boolean).join(' · ')}</p></div></footer></article>;
}