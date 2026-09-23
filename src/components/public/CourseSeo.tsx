import { Helmet } from 'react-helmet-async';
import { SITE_URL, type Course } from '@/data/courses';

const SHARE_IMAGE = `${SITE_URL}/vivek-doba.png`;

export function CourseSeo({ title, description, path, schema }: { title: string; description: string; path: string; schema: object[] }) {
  const url = `${SITE_URL}${path}`;
  return <Helmet>
    <html lang="en" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content={SHARE_IMAGE} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={SHARE_IMAGE} />
    <script type="application/ld+json">{JSON.stringify(schema)}</script>
  </Helmet>;
}

export const providerSchema = { '@type': 'Organization', name: 'Vivek Doba Business Mastery', url: SITE_URL };

export function courseSchema(course: Course, faqs: { question: string; answer: string }[]) {
  const offer = typeof course.priceINR === 'number' ? { '@type': 'Offer', price: course.priceINR, priceCurrency: 'INR', description: course.gstApplies ? '18% GST is extra.' : 'Inclusive of all taxes.' } : undefined;
  return [
    { '@context': 'https://schema.org', '@type': 'Course', name: course.name, description: course.outcome, provider: providerSchema, hasCourseInstance: { '@type': 'CourseInstance', courseMode: course.mode, courseWorkload: course.duration }, ...(offer ? { offers: offer } : {}) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE_URL}/courses` },
      { '@type': 'ListItem', position: 3, name: course.name, item: `${SITE_URL}/courses/${course.slug}` },
    ] },
  ];
}