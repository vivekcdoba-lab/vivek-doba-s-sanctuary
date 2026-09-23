import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  HeartPulse,
  Home,
  Landmark,
  MessageCircle,
  Triangle,
  Users,
} from 'lucide-react';
import vivekDobaPhoto from '@/assets/vivek-doba.png';
import vivekDobaBanner from '@/assets/vivek-doba-courses-banner.jpg';
import vivekDobaTeaching from '@/assets/courses/leadership-vivek-hero.webp';
import { Button } from '@/components/ui/button';
import PublicSeo, { breadcrumbSchema, personSchema } from '@/components/public/PublicSeo';

const diagnosticUrl = `https://wa.me/919607050111?text=${encodeURIComponent('Namaste, I would like to book a diagnostic call.')}`;

const storyChapters = [
  {
    label: 'Where I started',
    text: 'I began coaching business owners in 1998. [ADD WHERE AND HOW VIVEK STARTED]',
    image: vivekDobaPhoto,
    alt: 'Portrait of business coach Vivek Doba',
    width: 500,
    height: 331,
  },
  {
    label: 'The turning point',
    text: '[ADD THE TURNING POINT THAT LED VIVEK TO CREATE LIFE’S GOLDEN TRIANGLE™]',
    image: vivekDobaBanner,
    alt: 'Vivek Doba standing against a warm sunrise landscape',
    width: 1376,
    height: 768,
  },
  {
    label: 'What I believe',
    text: 'I believe business growth should not cost an owner their health or their family. Lasting success needs Business, Health and Family to support each other.',
    image: vivekDobaTeaching,
    alt: 'Vivek Doba leading a business coaching session',
    width: 1376,
    height: 768,
  },
];

const workingPrinciples = [
  {
    title: 'Indian wisdom, practical business',
    text: 'Ramayana, Srikrishna and Panchatattva applied to real businesses.',
    Icon: Landmark,
  },
  {
    title: 'Small groups and one-to-one',
    text: 'Focused coaching in small groups, with one-to-one guidance available for leaders.',
    Icon: Users,
  },
  {
    title: 'Measured by real change, not promises',
    text: 'The work is judged by meaningful change across Business, Health and Family.',
    Icon: CheckCircle2,
  },
];

const timeline = [
  { year: '1998', title: 'The coaching journey begins', detail: 'Vivek Doba begins coaching business owners.' },
  { year: '[ADD YEAR]', title: '[ADD KEY PROGRAM LAUNCH]', detail: '[ADD THE MILESTONE AND WHY IT MATTERED]' },
  { year: '[ADD YEAR]', title: 'Life’s Golden Triangle™ begins', detail: '[ADD THE PROGRAM LAUNCH MILESTONE]' },
  { year: 'Dussehra 2026', title: 'Book launch', detail: 'Life’s Golden Triangle: Book + Workbook set launches.' },
];

const mediaItems: { image: string; alt: string; title: string }[] = [];

const aboutPersonSchema = {
  ...personSchema,
  url: 'https://vivekdoba.com/about',
  description: 'Vivek Doba is a business coach and founder of Life’s Golden Triangle™, helping business owners grow their business without losing their health or family since 1998.',
  knowsAbout: ['Business coaching', 'Life’s Golden Triangle™', 'Business', 'Health', 'Family'],
};

export default function AboutPage() {
  return <div className="bg-background">
    <PublicSeo
      title="About Vivek Doba | Business Coach in Pune"
      description="Meet Vivek Doba, founder of Life’s Golden Triangle™, helping business owners grow business, health and family together since 1998."
      path="/about"
      schemas={[
        aboutPersonSchema,
        breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About Vivek Doba', path: '/about' }]),
      ]}
    />

    <section className="gradient-hero relative overflow-hidden text-primary-foreground">
      <div className="homepage-hero-pattern absolute inset-0 pointer-events-none" />
      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="max-w-3xl">
          <p className="font-course-serif mb-4 text-xl italic sm:text-2xl">Success is a Triangle. Complete it.</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">About Vivek Doba: Business Coach and Founder of Life’s Golden Triangle™</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/90">Helping business owners in Pune and across India grow their business without losing their health or their family, since 1998.</p>
        </div>
        <div className="homepage-photo-frame mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-primary-foreground/30">
          <img src={vivekDobaBanner} alt="Vivek Doba, business coach and founder of Life’s Golden Triangle" width="1376" height="768" fetchPriority="high" className="aspect-[4/3] w-full object-cover object-center" />
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-2xl"><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">His story</p><h2 className="text-3xl font-bold sm:text-4xl">In Vivek’s own words</h2></div>
        <div className="space-y-10 sm:space-y-14">
          {storyChapters.map((chapter, index) => <article key={chapter.label} className="grid items-center gap-7 md:grid-cols-2 md:gap-12">
            <img src={chapter.image} alt={chapter.alt} width={chapter.width} height={chapter.height} loading="lazy" className={`aspect-[4/3] w-full rounded-lg object-cover shadow-course ${index % 2 === 1 ? 'md:order-2' : ''}`} />
            <div className={index % 2 === 1 ? 'md:order-1' : ''}>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">{chapter.label}</p>
              <p className="font-course-serif text-2xl leading-9 text-foreground sm:text-3xl">“{chapter.text}”</p>
            </div>
          </article>)}
        </div>
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
        <div><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">The philosophy</p><h2 className="text-3xl font-bold sm:text-4xl">The Golden Triangle</h2><p className="font-course-serif mt-5 text-3xl font-semibold text-course-maroon">Success is a Triangle. Complete it.</p><p className="mt-5 text-lg leading-8 text-muted-foreground">Business, Health and Family are not separate victories. Each side must support the other two.</p></div>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center"><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">The approach</p><h2 className="text-3xl font-bold sm:text-4xl">How he works</h2></div>
        <div className="grid gap-6 md:grid-cols-3">
          {workingPrinciples.map(({ title, text, Icon }) => <article key={title} className="border-t-4 border-primary bg-card p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
            <h3 className="text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{text}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-y border-border bg-course-ivory py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12"><p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Journey timeline</p><h2 className="text-3xl font-bold sm:text-4xl">The work, year by year</h2></div>
        <ol className="relative border-l-2 border-primary/30 pl-7 sm:pl-10">
          {timeline.map(item => <li key={`${item.year}-${item.title}`} className="relative mb-10 last:mb-0">
            <span className="absolute -left-[2.15rem] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-course-ivory sm:-left-[2.78rem]" />
            <p className="text-sm font-bold uppercase tracking-widest text-primary">{item.year}</p><h3 className="mt-1 text-xl font-bold">{item.title}</h3><p className="mt-2 text-muted-foreground">{item.detail}</p>
          </li>)}
        </ol>
      </div>
    </section>

    {mediaItems.length > 0 && <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4"><h2 className="text-3xl font-bold sm:text-4xl">In the media and talks</h2><div className="mt-8 grid gap-6 md:grid-cols-3">{mediaItems.map(item => <article key={item.title}><img src={item.image} alt={item.alt} loading="lazy" className="aspect-video w-full rounded-lg object-cover" /><h3 className="mt-3 font-bold">{item.title}</h3></article>)}</div></div>
    </section>}

    <section className="bg-course-maroon py-14 text-secondary-foreground sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 lg:flex-row lg:items-center">
        <div><p className="font-course-serif text-xl italic text-secondary-foreground/80">A practical first step</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Build a business without losing what matters.</h2></div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Button asChild size="lg" className="bg-course-saffron text-primary-foreground hover:bg-course-saffron/90"><a href={diagnosticUrl} target="_blank" rel="noopener noreferrer">Book a diagnostic <MessageCircle /></a></Button><Button asChild size="lg" variant="outline" className="border-secondary-foreground/50 bg-transparent text-secondary-foreground hover:bg-secondary-foreground hover:text-course-maroon"><Link to="/courses">See the programs <ArrowRight /></Link></Button></div>
      </div>
    </section>
  </div>;
}