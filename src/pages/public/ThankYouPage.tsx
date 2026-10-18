import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicSeo from '@/components/public/PublicSeo';
import { PUBLIC_WHATSAPP_URL } from '@/lib/publicConversion';

export default function ThankYouPage() {
  return <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
    <PublicSeo title="Thank You | Vivek Doba" description="We have received your details. Vivek's team will WhatsApp you within 4 working hours." path="/thank-you" noindex />
    <h1 className="text-3xl font-bold sm:text-4xl">Thank you.</h1>
    <p className="mt-5 text-lg leading-8 text-muted-foreground">We have received your details. Vivek's team will WhatsApp you within 4 working hours.</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <Button asChild><a href={PUBLIC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
      <Button asChild variant="outline"><Link to="/courses">View courses<ArrowRight /></Link></Button>
    </div>
  </section>;
}