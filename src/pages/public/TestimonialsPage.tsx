import { useMemo, useState } from 'react';
import { ExternalLink, Quote } from 'lucide-react';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';
import { Button } from '@/components/ui/button';
import { usePublicCourses } from '@/hooks/useDbCourses';
import { useTestimonials } from '@/hooks/usePublicContent';
import { VideoTestimonialCard, WrittenTestimonialCard } from '@/components/public/TestimonialCards';

const GOOGLE_REVIEW_LINK = 'https://www.google.com/search?q=Vivek+Doba+Business+Mastery&stick=H4sIAAAAAAAA_-NgU1I1qDBOSjZKSrM0M0w0T0oDAiuDChNL47SUFDNDU2NzQ3OjNMtFrNJhmWWp2Qou-UmJCk6lxZl5qcXFCr6JxSWpRZUARCKbTkcAAAA&hl=en-GB&mat=Cb6XIapqqfI_ElcBzAmVZig4NQKCcjhZJqhWHsORRPvzRT5bJMnRd2XZaI5rwkWlOfj8fAy5cu3RMhMJpEBp_yVI-rntalsJaDOmxCEysQTPw8mJ0BypI7rclU7DdiLwzX8&authuser=0&ved=1t:350944';

export default function TestimonialsPage() {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const { data: courses = [] } = usePublicCourses();
  const [program, setProgram] = useState('all');
  const filtered = useMemo(() => program === 'all' ? testimonials : testimonials.filter(item => item.program_slug === program), [program, testimonials]);
  const videos = filtered.filter(item => item.youtube_id);
  const written = filtered.filter(item => item.quote);
  const availablePrograms = courses.filter(course => testimonials.some(item => item.program_slug === course.slug));
  const title = 'Business Owner Stories | Vivek Doba';
  const description = 'Read client stories from Vivek Doba’s business, leadership and Life’s Golden Triangle coaching programs in Pune and across India.';
  return <>
    <PublicSeo title={title} description={description} path="/testimonials" schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Testimonials', path: '/testimonials' }])]} />
    <section className="border-b border-border bg-muted/30 px-4 py-16 text-center"><Quote className="mx-auto h-10 w-10 text-primary" /><h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold sm:text-5xl">Stories from Business Owners Coached by Vivek Doba</h1><p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Only real client experiences shared with permission are published here.</p></section>
    <section className="mx-auto max-w-7xl px-4 py-12"><div className="flex gap-2 overflow-x-auto pb-3" aria-label="Filter testimonials by program"><Button size="sm" variant={program === 'all' ? 'default' : 'outline'} onClick={() => setProgram('all')}>All</Button>{availablePrograms.map(course => <Button key={course.slug} size="sm" className="shrink-0" variant={program === course.slug ? 'default' : 'outline'} onClick={() => setProgram(course.slug)}>{course.name}</Button>)}</div>
      {isLoading ? <p className="py-12 text-center text-muted-foreground">Loading stories…</p> : filtered.length === 0 ? <div className="my-10 border border-dashed border-primary/40 p-10 text-center"><Quote className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-2xl font-bold">Client stories are being prepared</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Only genuine testimonials with clear permission will appear here.</p></div> : <><div><h2 className="text-3xl font-bold">Video testimonials</h2>{videos.length > 0 ? <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{videos.map(item => <VideoTestimonialCard key={item.id} item={item} />)}</div> : <p className="mt-5 text-muted-foreground">No video testimonials are published for this selection.</p>}</div><div className="mt-16"><h2 className="text-3xl font-bold">Written stories</h2>{written.length > 0 ? <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{written.map(item => <WrittenTestimonialCard key={item.id} item={item} />)}</div> : <p className="mt-5 text-muted-foreground">No written testimonials are published for this selection.</p>}</div></>}
      <div className="mt-14 border-t pt-8 text-center"><Button asChild><a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noopener noreferrer">Read our 805+ Google reviews <ExternalLink /></a></Button></div>
    </section>
  </>;
}