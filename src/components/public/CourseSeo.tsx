import PublicSeo, { SITE_URL, breadcrumbSchema, organizationSchema } from '@/components/public/PublicSeo';
import { type Course } from '@/data/courses';

export function CourseSeo({ title, description, path, schema, image }: { title: string; description: string; path: string; schema: object[]; image?: string }) {
  const label = path === '/courses' ? 'Courses' : title.split('|')[0]?.trim() || 'Course';
  return <PublicSeo title={title} description={description} path={path} image={image} schemas={[organizationSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, ...(path === '/courses' ? [] : [{ name: 'Courses', path: '/courses' }]), { name: label, path }]), ...schema]} />;
}

export const providerSchema = { '@type': 'Organization', name: 'Vivek Doba Business Mastery', url: SITE_URL };

export function courseSchema(course: Course, faqs: { question: string; answer: string }[]) {
  const offer = typeof course.priceINR === 'number' ? { '@type': 'Offer', price: course.priceINR, priceCurrency: 'INR', description: course.gstApplies ? '18% GST is extra.' : 'Inclusive of all taxes.' } : undefined;
  return [
    { '@context': 'https://schema.org', '@type': 'Course', name: course.name, description: course.outcome, ...(course.heroImageUrl ? { image: course.heroImageUrl } : {}), provider: providerSchema, hasCourseInstance: { '@type': 'CourseInstance', courseMode: course.mode, courseWorkload: course.duration }, ...(offer ? { offers: offer } : {}) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE_URL}/courses` },
      { '@type': 'ListItem', position: 3, name: course.name, item: `${SITE_URL}/courses/${course.slug}` },
    ] },
  ];
}