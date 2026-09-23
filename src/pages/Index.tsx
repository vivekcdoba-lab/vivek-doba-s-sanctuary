import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Clock3,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Sparkles,
  Triangle,
} from 'lucide-react';
import vivekDobaPhoto from '@/assets/vivek-doba.png';
import businessOwnerBusiness from '@/assets/home/business-owner-business.jpg';
import businessOwnerHealth from '@/assets/home/business-owner-health.jpg';
import businessOwnerFamily from '@/assets/home/business-owner-family.jpg';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatINR, type Course } from '@/data/courses';
import { usePublicCourses } from '@/hooks/useDbCourses';
import PublicSeo, { breadcrumbSchema, organizationSchema, personSchema, professionalServiceSchema } from '@/components/public/PublicSeo';

const diagnosticUrl = `https://wa.me/919607050111?text=${encodeURIComponent('Namaste, I would like to book a diagnostic call.')}`;
const privateSessionUrl = `https://wa.me/919607050111?text=${encodeURIComponent('Namaste, I would like to book a 45-minute session with Vivek Doba for ₹4,999.')}`;

const mirrorCards = [
  { title: 'Business', text: 'The business grows, but only when you are in the room.', image: businessOwnerBusiness, Icon: BriefcaseBusiness, alt: 'Indian business owner managing every decision in his Pune workshop' },
  { title: 'Health', text: 'Your body is paying for your success.', image: businessOwnerHealth, Icon: HeartPulse, alt: 'Indian business owner feeling the physical strain of a long workday' },
  { title: 'Family', text: 'You are building everything for your family, and missing them.', image: businessOwnerFamily, Icon: Home, alt: 'Indian business owner arriving home after his family has started dinner' },
];

const faqItems = [
  { q: 'Who is Vivek Doba’s coaching for?', a: 'It is for business owners and leaders who want sustainable growth without sacrificing their health or family life.' },
  { q: 'Where are the programs held?', a: 'Programs are held in Pune and Pimpri-Chinchwad, with the location shared for each scheduled batch.' },
  { q: 'Which program should I start with?', a: 'Start with the ₹999 Know Your Triangle session. It helps you see which side—business, health or family—needs attention first.' },
  { q: 'Are programs available online?', a: 'Selected programs are available online. Each program page clearly shows whether it is offline, online or offered in both formats.' },
  { q: 'Are fees inclusive of GST?', a: 'No. 18% GST is added to program fees. The Life’s Golden Triangle Book + Workbook set is inclusive of all taxes.' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const testimonials: { youtubeId: string; name: string; business: string }[] = [];

function ProgramPrice({ course }: { course: Course }) {
  if (course.priceINR === null) {
    return <p className="text-sm font-semibold text-course-maroon">{course.priceNote}</p>;
  }
  if (course.priceINR === 0) return <p className="text-lg font-bold text-course-maroon">Free</p>;
  return <div>
    <p className="text-lg font-bold text-course-maroon">{course.priceFrom ? 'From ' : ''}{formatINR(course.priceINR)}</p>
    {course.gstApplies && <p className="text-xs text-muted-foreground">+ 18% GST</p>}
  </div>;
}

function TestimonialsSection() {
  if (testimonials.length === 0) return null;
  return <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
    <div className="mx-auto max-w-6xl px-4">
      <div className="mb-9 flex items-center gap-3">
        <Quote className="h-7 w-7 text-primary" />
        <h2 className="text-3xl font-bold">Stories from business owners</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map(story => <article key={story.youtubeId} className="overflow-hidden rounded-lg border border-border bg-card">
          <iframe className="aspect-video w-full" loading="lazy" src={`https://www.youtube-nocookie.com/embed/${story.youtubeId}`} title={`${story.name} testimonial`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          <div className="p-4"><p className="font-semibold">{story.name}</p><p className="text-sm text-muted-foreground">{story.business}</p></div>
        </article>)}
      </div>
      <Button asChild variant="outline" className="mt-8"><Link to="/testimonials">More stories <ArrowRight /></Link></Button>
    </div>
  </section>;
}

export default function Index() {
  const { data: courses = [] } = usePublicCourses();
  const featuredSlugs = ['know-your-triangle', 'loa', 'udyog-sanjivani', 'lgt'];
  const featuredCourses = featuredSlugs.map(slug => courses.find(course => course.slug === slug)).filter((course): course is Course => Boolean(course));
  const book = courses.find(course => course.slug === 'book');

  return <div className="bg-background">
    <PublicSeo title="Vivek Doba | Business Coach in Pune & PCMC | Life’s Golden Triangle™" description="Business coach in Pimpri-Chinchwad, Pune for business owners who want growth without losing health and family. Life’s Golden Triangle™ by Vivek Doba. 840+ Google and client reviews, coaching business owners since 1998." path="/" schemas={[organizationSchema, personSchema, professionalServiceSchema, faqSchema, breadcrumbSchema([{ name: 'Home', path: '/' }])]} />

    <section className="gradient-hero relative overflow-hidden text-primary-foreground">
      <div className="homepage-hero-pattern absolute inset-0 pointer-events-none" />
      <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
        <div className="max-w-3xl">
          <p className="font-course-serif mb-4 text-xl italic sm:text-2xl">Success is a Triangle. Complete it.</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Business Coach in Pune for Owners Who Want to Win at Work and at Home</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/90"><strong>Ghar bhi jeeto. Bazaar bhi.</strong> Life’s Golden Triangle™ helps you grow your business without losing your health or your family.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-12 bg-course-maroon text-secondary-foreground hover:bg-course-maroon/90"><a href={diagnosticUrl} target="_blank" rel="noopener noreferrer">Book a diagnostic <MessageCircle /></a></Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 border-primary-foreground/60 bg-background/10 text-primary-foreground hover:bg-background hover:text-foreground"><Link to="/courses/know-your-triangle">Know Your Triangle · ₹999 <ArrowRight /></Link></Button>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-primary-foreground">
            <div className="border-l border-primary-foreground/40 pl-4"><p className="text-2xl font-bold">840+</p><p className="text-sm text-primary-foreground/90">Google &amp; client reviews</p></div>
            <div className="border-l border-primary-foreground/40 pl-4"><p className="text-2xl font-bold">Since 1998</p><p className="text-sm text-primary-foreground/90">Coaching business owners</p></div>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg self-end">
          <div className="homepage-photo-frame overflow-hidden rounded-lg border border-primary-foreground/30">
            <img src={vivekDobaPhoto} alt="Business coach Vivek Doba in Pune" width="500" height="331" fetchPriority="high" className="aspect-[4/5] w-full object-cover object-top" />
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-md border border-primary-foreground/20 bg-course-maroon/90 px-4 py-3 text-center backdrop-blur-sm">
            <p className="font-semibold">Vivek Doba</p><p className="text-sm text-secondary-foreground/80">Business Coach · Founder, Life’s Golden Triangle™</p>
          </div>
        </div>
      </div>
    </section>

    <section className="border-y border-border bg-background py-10"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 sm:flex-row sm:items-center"><div><p className="font-bold text-course-maroon">Private guidance with Vivek Doba</p><h2 className="mt-1 text-2xl font-bold">Book your 45-minute session with Vivek · ₹4,999</h2></div><Button asChild size="lg"><a href={privateSessionUrl} target="_blank" rel="noopener noreferrer">Book your session <MessageCircle /></a></Button></div></section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center"><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">The mirror</p><h2 className="text-3xl font-bold sm:text-4xl">Which one is you?</h2></div>
        <div className="grid gap-6 md:grid-cols-3">
          {mirrorCards.map(({ title, text, image, Icon, alt }) => <article key={title} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="relative overflow-hidden"><img src={image} alt={alt} width="1200" height="800" loading="lazy" className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /><div className="absolute bottom-0 left-0 flex h-12 w-12 items-center justify-center bg-course-maroon text-secondary-foreground"><Icon className="h-5 w-5" /></div></div>
            <div className="p-6"><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">{title}</p><h3 className="text-xl font-semibold leading-8">{text}</h3></div>
          </article>)}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center font-course-serif text-2xl font-semibold text-course-maroon">When one side breaks, the other two follow. That is the Golden Triangle.</p>
      </div>
    </section>

    <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        <div className="homepage-triangle mx-auto" aria-label="Golden Triangle with Business, Health and Family at its corners">
          <div className="homepage-triangle-shape" />
          <span className="homepage-triangle-point homepage-triangle-business"><BriefcaseBusiness />Business</span>
          <span className="homepage-triangle-point homepage-triangle-health"><HeartPulse />Health</span>
          <span className="homepage-triangle-point homepage-triangle-family"><Home />Family</span>
          <Triangle className="homepage-triangle-mark" />
        </div>
        <div><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">The framework</p><h2 className="text-3xl font-bold sm:text-4xl">The Golden Triangle, explained</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Most owners work on one corner. Lasting success needs all three to support each other.</p><Button asChild className="mt-7 bg-course-saffron text-primary-foreground hover:bg-course-saffron/90"><Link to="/score">Take the 3-minute Golden Triangle Score <ArrowRight /></Link></Button></div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">A clear next step</p><h2 className="text-3xl font-bold sm:text-4xl">The ladder, in brief</h2></div><Button asChild variant="outline"><Link to="/courses">See all programs <ArrowRight /></Link></Button></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.map(course => <article key={course.slug} className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-lg sm:flex-col">
            {course.cardImageUrl ? <img src={course.cardImageUrl} alt={`${course.name} program`} width="800" height="600" loading="lazy" className="h-40 w-36 shrink-0 object-cover sm:aspect-[4/3] sm:h-auto sm:w-full" /> : <div className="flex h-40 w-36 shrink-0 items-center justify-center bg-muted sm:aspect-[4/3] sm:h-auto sm:w-full"><Sparkles className="h-10 w-10 text-primary" /></div>}
            <div className="flex flex-1 flex-col p-5"><p className="text-xs font-bold uppercase tracking-widest text-primary">{course.stage}</p><h3 className="mt-1 text-lg font-bold">{course.name}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{course.outcome}</p><div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">{course.duration}</p><ProgramPrice course={course} /></div><Button asChild size="icon" variant="outline" aria-label={`View ${course.name}`}><Link to={`/courses/${course.slug}`}><ArrowRight /></Link></Button></div></div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-y border-border bg-course-ivory py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-[0.8fr_1.2fr]">
        <img src={vivekDobaPhoto} alt="Vivek Doba, business and life coach" width="500" height="331" loading="lazy" className="mx-auto aspect-square w-full max-w-sm rounded-lg object-cover object-top shadow-course" />
        <div><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Meet Vivek Doba</p><h2 className="text-3xl font-bold sm:text-4xl">Business discipline. Inner clarity. A life that stays whole.</h2><div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground"><p className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-primary" />He guides entrepreneurs and professionals towards clarity, balance and sustainable achievement.</p><p className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-primary" />His approach combines spiritual principles, mindset work and practical business discipline.</p><p className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-primary" />He founded Life’s Golden Triangle™ to make success meaningful as well as measurable.</p></div><Button asChild variant="outline" className="mt-7"><Link to="/about">Read his story <ArrowRight /></Link></Button></div>
      </div>
    </section>

    <TestimonialsSection />

    {book && <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-border bg-muted">
          {book.cardImageUrl ? <img src={book.cardImageUrl} alt="Life’s Golden Triangle Book and Workbook set" width="800" height="600" loading="lazy" className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center"><BookOpen className="h-24 w-24 text-primary/60" /></div>}
        </div>
        <div><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Read. Reflect. Apply.</p><h2 className="text-3xl font-bold sm:text-4xl">Life’s Golden Triangle: Book + Workbook set</h2><p className="mt-5 text-lg text-muted-foreground">Founder’s Edition for the first 200 · Launching on Dussehra</p><p className="mt-5 text-3xl font-bold text-course-maroon">₹999</p><p className="text-xs text-muted-foreground">Inclusive of all taxes</p><Button asChild size="lg" className="mt-7 bg-course-saffron text-primary-foreground hover:bg-course-saffron/90"><a href={`https://wa.me/919607050111?text=${encodeURIComponent('Namaste, I would like to pre-book the Life’s Golden Triangle Book + Workbook set.')}`} target="_blank" rel="noopener noreferrer">Pre-book <BookOpen /></a></Button></div>
      </div>
    </section>}

    <section className="border-t border-border bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[0.7fr_1.3fr]">
        <div><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><MessageCircle className="h-5 w-5" /></div><h2 className="text-3xl font-bold sm:text-4xl">Frequently asked questions</h2><p className="mt-4 text-muted-foreground">Clear answers before you choose your first step.</p></div>
        <Accordion type="single" collapsible className="border-t border-border">
          {faqItems.map((item, index) => <AccordionItem key={item.q} value={`faq-${index}`}><AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger><AccordionContent className="pr-8 text-muted-foreground leading-6">{item.a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </div>
    </section>

    <section className="bg-course-maroon py-14 text-secondary-foreground sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 lg:flex-row lg:items-center">
        <div><h2 className="text-3xl font-bold sm:text-4xl">Not sure where to begin?</h2><p className="mt-3 max-w-2xl text-secondary-foreground/80">Book a diagnostic call. We will understand your business and tell you honestly which step fits you.</p></div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Button asChild size="lg" className="bg-course-saffron text-primary-foreground hover:bg-course-saffron/90"><a href={diagnosticUrl} target="_blank" rel="noopener noreferrer">Book a diagnostic <MessageCircle /></a></Button><Button asChild size="lg" variant="outline" className="border-secondary-foreground/50 bg-transparent text-secondary-foreground hover:bg-secondary-foreground hover:text-course-maroon"><a href="tel:9607050111">Call 9607050111 <Phone /></a></Button></div>
      </div>
    </section>
  </div>;
}