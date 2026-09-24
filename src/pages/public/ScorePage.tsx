import { MessageCircle } from 'lucide-react';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';
import { Button } from '@/components/ui/button';
import FrameworkTriangle from '@/components/public/FrameworkTriangle';
import { framework } from '@/data/framework';

export default function ScorePage() {
  const title = 'Golden Triangle Score: Coming Soon | Vivek Doba';
  const description = 'The Golden Triangle Score for Dharma, Artha, Kama and Moksha is coming soon.';
  const whatsappUrl = `https://wa.me/919607050111?text=${encodeURIComponent('Namaste, please let me know when the Golden Triangle Score is available.')}`;
  return <>
    <PublicSeo title={title} description={description} path="/score" noindex schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Golden Triangle Score', path: '/score' }])]} />
    <section className="flex min-h-[62vh] items-center border-b border-border bg-muted/30 px-4 py-16 text-center"><div className="mx-auto max-w-2xl"><FrameworkTriangle /><p className="mt-8 text-sm font-semibold text-primary">{framework.line}</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Golden Triangle Score: coming soon</h1><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">The complete self-assessment is being prepared. Message us to be notified when it is ready.</p><Button asChild size="lg" className="mt-8"><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Message us on WhatsApp <MessageCircle /></a></Button></div></section>
  </>;
}