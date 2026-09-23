import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';
import { Button } from '@/components/ui/button';

export default function TestimonialsPage() {
  const title = 'Client Stories & Reviews | Vivek Doba';
  const description = 'Read client stories from Vivek Doba’s business, leadership and Life’s Golden Triangle coaching programs in Pune and across India.';
  return <>
    <PublicSeo title={title} description={description} path="/testimonials" schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Testimonials', path: '/testimonials' }])]} />
    <section className="border-b border-border bg-muted/30 px-4 py-16 text-center"><Quote className="mx-auto h-10 w-10 text-primary" /><h1 className="mt-4 text-4xl font-bold sm:text-5xl">Client Stories</h1><p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Real experiences from people building stronger businesses, healthier lives and closer families.</p></section>
    <section className="mx-auto max-w-4xl px-4 py-16 text-center"><h2 className="text-3xl font-bold">Stories are being prepared for publication</h2><p className="mx-auto mt-4 max-w-2xl text-muted-foreground">We publish a client story only with clear permission. Speak with us to learn which program fits your goals.</p><Button asChild className="mt-7"><Link to="/contact">Talk to our team<ArrowRight /></Link></Button></section>
  </>;
}