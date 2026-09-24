import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Course, formatINR, whatsappLink } from '@/data/courses';
import { openExternal } from '@/lib/openExternal';
import { DIAGNOSTIC_NOTE } from '@/data/framework';

export function CoursePrice({ course, align = 'left' }: { course: Course; align?: 'left' | 'right' }) {
  if (course.priceINR === null) return <div className={align === 'right' ? 'text-right' : ''}><p className="font-semibold text-course-maroon">{course.priceNote}</p></div>;
  if (course.priceINR === 0) return <p className={`text-xl font-bold text-foreground ${align === 'right' ? 'text-right' : ''}`}>Free</p>;
  return <div className={align === 'right' ? 'text-right' : ''}>
    <p className="text-xl font-bold text-foreground">{course.priceFrom ? 'From ' : ''}{formatINR(course.priceINR)}</p>
    <p className="mt-1 text-xs font-medium text-muted-foreground">{course.gstApplies ? '+ 18% GST' : 'Inclusive of all taxes'}</p>
  </div>;
}

export function CourseCta({ course, className = '' }: { course: Course; className?: string }) {
  if (course.ctaType === 'none') return null;
  if (course.ctaType === 'read') return <Button asChild className={`min-h-12 bg-course-saffron text-primary-foreground hover:bg-course-saffron/90 ${className}`}><a href={`/courses/${course.slug}`}>{course.cta}<ArrowRight /></a></Button>;
  const href = whatsappLink(course.name, course.ctaType === 'diagnostic');
  if (course.ctaType === 'diagnostic') return <div className="max-w-md"><Button className={`min-h-12 bg-course-saffron text-primary-foreground hover:bg-course-saffron/90 ${className}`} onClick={() => openExternal(href)}>{course.cta}<ArrowRight /></Button><p className="mt-2 text-xs leading-5 text-muted-foreground">{DIAGNOSTIC_NOTE}</p></div>;
  return <Button className={`min-h-12 bg-course-saffron text-primary-foreground hover:bg-course-saffron/90 ${className}`} onClick={() => openExternal(href)}>{course.cta}<ArrowRight /></Button>;
}