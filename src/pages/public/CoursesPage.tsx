import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ladder, sidePrograms, type Course, whatsappLink, WHATSAPP_NUMBER } from '@/data/courses';
import { openExternal } from '@/lib/openExternal';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const diagnosticLink = (course: Course) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`नमस्ते, मुझे ${course.name} के लिए Diagnostic call book करनी है`)}`;

function CourseAction({ course }: { course: Course }) {
  if (!course.ctaLabel || course.ctaType === 'none') return null;
  if (course.ctaType === 'read') return <Button asChild variant="outline"><Link to={`/${course.slug}`}>{course.ctaLabel}<ArrowRight /></Link></Button>;
  const href = course.ctaType === 'diagnostic' ? diagnosticLink(course) : whatsappLink(course.name);
  return <Button className="gradient-saffron border-0" onClick={(event) => { event.stopPropagation(); openExternal(href); }}>{course.ctaLabel}<ArrowRight /></Button>;
}

function LadderRow({ course, calm = false }: { course: Course; calm?: boolean }) {
  const navigate = useNavigate();
  return <div className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 md:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:gap-6">
    <div className="relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-xl md:text-2xl font-bold text-primary shadow-sm">{course.step}</div>
    <article onClick={() => navigate(`/${course.slug}`)} className={`col-start-2 md:col-span-2 grid cursor-pointer gap-5 rounded-lg border p-5 md:grid-cols-[minmax(0,1fr)_auto] md:p-7 transition-colors hover:border-primary/60 ${calm ? 'bg-muted/40 border-primary/10' : 'bg-card border-border shadow-sm'}`}>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-semibold text-primary/80">{course.stage}</p>
        <Link to={`/${course.slug}`} onClick={event => event.stopPropagation()} className="inline-flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-primary">{course.locked && <Lock className="h-5 w-5" />}{course.name}</Link>
        <p className="mt-2 text-sm md:text-base leading-7 text-muted-foreground font-devanagari">{course.meta}</p>
        <div className="mt-4 border-l-4 border-primary bg-primary/10 px-4 py-3 text-sm md:text-base leading-7 font-devanagari"><strong>{course.forLabel || 'किसके लिए'}:</strong> {course.forWhom}</div>
      </div>
      <div className="flex min-w-[9.5rem] flex-row flex-wrap items-center gap-3 md:flex-col md:items-end md:justify-center" onClick={event => event.stopPropagation()}>
        {!calm && (course.price || course.priceNote) && <p className="text-lg font-bold text-primary">{course.price || course.priceNote}</p>}
        {course.nextDate && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium"><CalendarDays className="h-3.5 w-3.5" />{course.nextDate}</span>}
        {course.locked ? <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"><Lock className="h-3.5 w-3.5" />Graduates</span> : <CourseAction course={course} />}
      </div>
    </article>
  </div>;
}

export default function PublicCoursesPage() {
  useDocumentMeta({ title: 'Courses — Vivek Doba | Business Coach, PCMC Pune', description: "नौ कार्यक्रम, एक सीढ़ी — Know Your Triangle से Life's Golden Triangle™ तक। अपनी जगह से शुरू कीजिए।", canonicalPath: '/courses' });
  return <div className="font-devanagari">
    <section className="border-b border-primary/20 bg-primary/5 px-4 py-12 text-center sm:py-16">
      <p className="mb-2 text-sm font-semibold text-primary">Courses</p>
      <h1 className="text-3xl sm:text-4xl font-bold">आप कहाँ से शुरू करें?</h1>
      <p className="mx-auto mt-3 max-w-2xl text-base sm:text-lg leading-8 text-muted-foreground">हर कार्यक्रम एक ही काम करता है। अपनी जगह से शुरू कीजिए।</p>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="relative space-y-7 before:absolute before:bottom-8 before:left-7 before:top-8 before:w-px before:bg-primary/40 md:before:left-8">
        {ladder.map((course, index) => <div key={course.slug} className="relative">
          <LadderRow course={course} calm={course.slug === 'ram-nirvana'} />
          {index < ladder.length - 1 && <span aria-hidden="true" className="absolute left-[1.38rem] md:left-[1.63rem] -bottom-6 z-10 bg-background px-1 text-primary">▼</span>}
        </div>)}
      </div>
    </section>
    <section className="border-t border-border bg-muted/30 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl"><h2 className="mb-7 text-2xl sm:text-3xl font-bold">और भी</h2>
        <div className="space-y-3">{sidePrograms.map(course => <article key={course.slug} className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
          <div><Link to={`/${course.slug}`} className="text-lg font-bold hover:text-primary">{course.name}</Link><p className="mt-1 text-sm leading-6 text-muted-foreground">{course.meta}</p></div>
          {course.price && <p className="font-bold text-primary">{course.price}</p>}<CourseAction course={course} />
        </article>)}</div>
      </div>
    </section>
  </div>;
}