import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock3, MapPin, MessageCircle, Star, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { CourseCta, CoursePrice } from '@/components/public/CourseElements';
import { CourseSeo, providerSchema } from '@/components/public/CourseSeo';
import { SITE_URL, whatsappLink, type Course } from '@/data/courses';
import { usePublicCourses } from '@/hooks/useDbCourses';
import { openExternal } from '@/lib/openExternal';
import vivekDobaCoursesBanner from '@/assets/vivek-doba-courses-banner.jpg';

const faqs = [
  { question: 'Which program should I start with?', answer: 'If you are unsure, start with Know Your Triangle. It is free, takes 2 hours and shows you your Golden Triangle Score. Or book a diagnostic call and we will guide you.' },
  { question: 'Are the fees inclusive of GST?', answer: 'No. All program fees are exclusive of 18% GST, which is added at payment. The book is priced inclusive of all taxes.' },
  { question: 'Are programs available online?', answer: 'LOA through Ramayana is available offline and online. Udyog Sanjivani combines 7 offline and 5 online sessions. Life’s Golden Triangle is face to face.' },
  { question: 'Where are the offline programs held?', answer: 'In Pimpri-Chinchwad (PCMC), Pune.' },
  { question: 'How do I enroll?', answer: 'Tap the button on any program. It opens WhatsApp with your message ready, and our team will guide you.' },
];
const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .15 }, transition: { duration: .55 } };

function Facts({ course }: { course: Course }) {
  const facts = [{ icon: Clock3, text: course.duration }, { icon: MapPin, text: course.mode }, ...(course.seats ? [{ icon: Users, text: course.seats }] : []), ...(course.nextDate ? [{ icon: CalendarDays, text: course.nextDate }] : [])];
  return <div className="flex flex-wrap gap-2">{facts.map(({ icon: Icon, text }) => <span key={text} className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground"><Icon className="h-3.5 w-3.5 text-course-saffron" />{text}</span>)}</div>;
}

function LadderCard({ course, index, highlighted }: { course: Course; index: number; highlighted: boolean }) {
  const summit = course.slug === 'ram-nirvana';
  return <motion.article id={`step-${course.slug}`} {...reveal} className="relative scroll-mt-36 pl-14 md:pl-24">
    <div className={`absolute left-0 top-8 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 font-bold md:h-14 md:w-14 ${summit ? 'border-primary bg-course-maroon text-primary-foreground shadow-lg' : 'border-course-saffron bg-course-ivory text-course-saffron'}`}>{course.step}</div>
    <div role="link" tabIndex={0} aria-label={`View ${course.name}`} onClick={() => { window.location.href = `/courses/${course.slug}`; }} onKeyDown={event => { if (event.key === 'Enter') window.location.href = `/courses/${course.slug}`; }} className={`cursor-pointer rounded-[18px] border p-5 shadow-course transition-transform hover:-translate-y-1 md:p-8 ${highlighted ? 'course-glow' : ''} ${summit ? 'border-primary/30 bg-course-maroon text-primary-foreground' : 'border-primary/15 bg-card'}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className={`text-xs font-semibold uppercase ${summit ? 'text-primary-foreground/70' : 'text-course-saffron'}`}>Step {course.step} · {course.stage}</p>
          <h3 className="font-course-serif mt-2 text-3xl font-semibold italic md:text-4xl">{course.name}</h3>
          <p className={`mt-3 max-w-3xl text-base font-medium leading-7 md:text-lg ${summit ? 'text-primary-foreground/90' : 'text-foreground'}`}>{course.outcome}</p>
          <div className="mt-5"><Facts course={course} /></div>
          {!summit && <p className="mt-5 border-l-4 border-course-saffron bg-course-ivory px-4 py-3 text-sm leading-6 text-foreground"><strong>Who it’s for:</strong> {course.forWhom}</p>}
        </div>
        <div className="flex min-w-48 flex-col items-start gap-3 lg:items-end" onClick={event => event.stopPropagation()}>
          {!summit && <CoursePrice course={course} align="right" />}
          {course.locked ? <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"><Users className="h-4 w-4" />Graduates only</span> : !summit && <CourseCta course={course} />}
          <Link to={`/courses/${course.slug}`} className={`inline-flex min-h-12 items-center gap-2 text-sm font-semibold underline underline-offset-4 ${summit ? 'text-primary-foreground' : 'text-course-saffron'}`}>{summit ? 'Read the vision' : 'See the full journey'}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  </motion.article>;
}

export default function PublicCoursesPage() {
  const { data: allCourses = [] } = usePublicCourses();
  const ladder = allCourses.filter(course => !course.isSideProgram);
  const sidePrograms = allCourses.filter(course => course.isSideProgram);
  const [highlighted, setHighlighted] = useState('');
  const ladderRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ladderRef, offset: ['start center', 'end center'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  useEffect(() => { if (!highlighted) return; const timer = window.setTimeout(() => setHighlighted(''), 1700); return () => window.clearTimeout(timer); }, [highlighted]);
  const jump = (slug: string) => { setHighlighted(slug); document.getElementById(`step-${slug}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); };
  const schema = [
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: allCourses.map((course, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'Course', name: course.name, description: course.outcome, url: `${SITE_URL}/courses/${course.slug}`, provider: providerSchema } })) },
    { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Vivek Doba Business Mastery', telephone: '+91-9607050111', url: SITE_URL, address: { '@type': 'PostalAddress', addressLocality: 'Pimpri-Chinchwad', addressRegion: 'Maharashtra', addressCountry: 'IN' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE_URL}/courses` }] },
  ];
  return <div className="bg-course-ivory">
    <CourseSeo title="Business Coaching Programs in Pune & PCMC | Vivek Doba" description="Nine business coaching programs, one path. From a free 2-hour session to Life’s Golden Triangle one-to-one coaching. Business coach in Pimpri-Chinchwad, Pune. 840+ reviews, coaching since 1998." path="/courses" schema={schema} />
    <section className="relative min-h-[560px] overflow-hidden border-b border-primary/15 sm:min-h-[620px]">
      <img src={vivekDobaCoursesBanner} alt="Vivek Doba standing against a warm sunrise mountain landscape" className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center" fetchPriority="high" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/75 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-16 sm:min-h-[620px] sm:px-8">
        <div className="max-w-2xl text-primary-foreground">
          <p className="mb-4 text-sm font-semibold uppercase text-accent">Vivek Doba Business Mastery</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Business Coaching Programs in Pune for Owners Who Want Growth, Health and Family in Balance</h1>
          <p className="font-course-serif mt-7 text-4xl italic text-accent sm:text-5xl">Where are you today?</p>
          <p className="mt-4 max-w-xl text-base leading-8 text-primary-foreground/85 sm:text-lg">Every program does the same work at a different depth. Find the sentence that sounds like you, and start there.</p>
          <div className="mt-7 flex flex-wrap gap-4 text-sm font-semibold"><span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-accent" />840+ reviews</span><span>· Coaching since 1998</span><span>· PCMC, Pune</span></div>
        </div>
      </div>
    </section>
    <motion.section {...reveal} className="mx-auto max-w-7xl px-4 py-14"><h2 className="sr-only">Find the program that sounds like you</h2><div className="scrollbar-none flex snap-x gap-4 overflow-x-auto pb-4">{ladder.slice(0,5).map(course => <Button variant="outline" key={course.slug} onClick={() => jump(course.slug)} className="h-auto min-h-44 min-w-[82vw] snap-start items-start whitespace-normal overflow-hidden rounded-[18px] border-primary/15 bg-card p-0 text-left shadow-course hover:border-course-saffron hover:bg-card sm:min-w-[23rem]"><span className="flex h-full w-full flex-col"><img src={course.cardImageUrl} alt={`${course.name}: ${course.outcome}`} className="aspect-[4/3] w-full object-cover" loading="lazy" /><span className="p-6"><span className="text-xs font-semibold uppercase text-course-saffron">Step {course.step} · {course.stage}</span><q className="font-course-serif mt-3 block text-2xl italic leading-8 text-course-maroon">{course.hook}</q></span></span></Button>)}</div></motion.section>
    <section className="mx-auto max-w-6xl px-4 pb-16"><h2 className="text-center text-3xl font-bold sm:text-4xl">The Golden Triangle Ladder: Nine Programs, One Path</h2><div ref={ladderRef} className="relative mt-12 space-y-8"><div className="absolute bottom-8 left-[1.35rem] top-8 w-1 rounded-full bg-primary/15 md:left-[1.65rem]" /><motion.div style={{ scaleY, transformOrigin: 'top' }} className="absolute bottom-8 left-[1.35rem] top-8 w-1 rounded-full bg-course-saffron md:left-[1.65rem]" />{ladder.map((course,index) => <LadderCard key={course.slug} course={course} index={index} highlighted={highlighted === course.slug} />)}</div><p className="mt-10 text-center text-sm leading-6 text-muted-foreground">All program fees shown are exclusive of 18% GST, which is added at the time of payment. A GST invoice is issued for every enrollment.</p></section>
    <motion.section {...reveal} className="border-y border-primary/15 bg-background px-4 py-16"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-bold sm:text-4xl">For Sales Teams, Organisations and Readers</h2><div className="mt-8 grid gap-5 lg:grid-cols-3">{sidePrograms.map(course => <article key={course.slug} className="flex flex-col overflow-hidden rounded-[18px] border border-primary/15 bg-card shadow-course"><img src={course.cardImageUrl} alt={`${course.name}: ${course.outcome}`} className="aspect-[4/3] w-full object-cover" loading="lazy" /><div className="flex flex-1 flex-col p-6"><p className="text-xs font-semibold uppercase text-course-saffron">{course.stage}</p><h3 className="font-course-serif mt-2 text-3xl font-semibold italic">{course.name}</h3><p className="mt-3 leading-7 text-muted-foreground">{course.outcome}</p>{course.invitationNote && <p className="mt-4 border-l-4 border-course-saffron bg-course-ivory px-4 py-3 text-sm font-semibold leading-6">{course.invitationNote}</p>}<p className="mt-5 text-sm font-semibold">{course.duration}</p><div className="mt-5"><CoursePrice course={course} /></div><div className="mt-5 flex flex-wrap gap-3"><CourseCta course={course} /><Button asChild variant="link" className="min-h-12"><Link to={`/courses/${course.slug}`}>See details<ArrowRight /></Link></Button></div></div></article>)}</div></div></motion.section>
    <motion.section {...reveal} className="mx-auto max-w-4xl px-4 py-16"><h2 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8 rounded-[18px] border border-primary/15 bg-card px-5 shadow-course">{faqs.map((item,index) => <AccordionItem key={item.question} value={`faq-${index}`}><AccordionTrigger className="min-h-14 text-left">{item.question}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{item.answer}</AccordionContent></AccordionItem>)}</Accordion></motion.section>
    <section className="bg-course-maroon px-4 py-14 text-primary-foreground"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row md:items-center"><div><h2 className="text-3xl font-bold">Not sure which step is yours?</h2><p className="mt-3 max-w-2xl text-primary-foreground/80">Book a diagnostic call. We will understand your business and tell you honestly where to begin.</p></div><div className="flex flex-wrap gap-3"><Button className="min-h-12 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openExternal(whatsappLink('the right coaching program', true))}>Book a diagnostic</Button><Button variant="outline" className="min-h-12 border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => openExternal(whatsappLink('your coaching programs'))}><MessageCircle />Ask on WhatsApp</Button></div></div></section>
  </div>;
}
