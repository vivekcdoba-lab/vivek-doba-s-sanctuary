import { Helmet } from 'react-helmet-async';

export const SITE_URL = 'https://vivekdoba.com';
export const BUSINESS_NAME = 'Vivek Doba Business Mastery LLP';
export const BUSINESS_ADDRESS = 'Office Number 228,229, Tower B, second floor, Gera Imperium Gateway, Near Nashik Phata metro station, Mumbai Pune highway, Pune-411034';
export const BUSINESS_PHONE = '9607050111';
export const BUSINESS_EMAIL = 'info@vivekdoba.com';
export const BUSINESS_HOURS = '';
export const SHARE_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/zrsITRprJqddVA1fAGWy6EZ8rD62/social-images/social-1776562975511-LGT.webp';
export const SOCIAL_URLS = [
  'https://www.youtube.com/@VIVEKDOBA',
  'https://www.instagram.com/vivekdoba/',
  'https://www.facebook.com/askVivekDoba/',
  'https://www.linkedin.com/in/vivekdoba/',
];

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'Office Number 228, 229, Tower B, Second Floor, Gera Imperium Gateway, Near Nashik Phata Metro Station, Mumbai Pune Highway',
  addressLocality: 'Pimpri-Chinchwad', addressRegion: 'Maharashtra', postalCode: '411034', addressCountry: 'IN',
};

export const organizationSchema = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE_URL}/#organization`,
  name: BUSINESS_NAME, url: SITE_URL,
  logo: `${SITE_URL}/pwa-icon-192.png`, sameAs: SOCIAL_URLS,
};
export const personSchema = {
  '@context': 'https://schema.org', '@type': 'Person', '@id': `${SITE_URL}/#vivek-doba`,
  name: 'Vivek Doba', url: SITE_URL, image: SHARE_IMAGE,
  jobTitle: 'Business Coach, Founder of Life’s Golden Triangle™',
  worksFor: { '@id': `${SITE_URL}/#organization` }, sameAs: SOCIAL_URLS,
};
export const professionalServiceSchema = {
  '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${SITE_URL}/#business`,
  name: BUSINESS_NAME, url: SITE_URL, telephone: BUSINESS_PHONE, email: BUSINESS_EMAIL,
  image: SHARE_IMAGE, address: { '@type': 'PostalAddress', streetAddress: BUSINESS_ADDRESS, addressCountry: 'IN' }, areaServed: ['Pimpri-Chinchwad', 'Pune', 'India'], priceRange: '₹₹',
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}` })) };
}

type PublicSeoProps = { title: string; description: string; path: string; image?: string; noindex?: boolean; schemas?: object[]; type?: 'website' | 'article' };

export default function PublicSeo({ title, description, path, image = SHARE_IMAGE, noindex = false, schemas = [], type = 'website' }: PublicSeoProps) {
  const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  const canonical = `${SITE_URL}${normalizedPath}`;
  const structuredData = [organizationSchema, personSchema, ...schemas].filter((schema, index, all) => {
    const identity = JSON.stringify(schema);
    return all.findIndex(candidate => JSON.stringify(candidate) === identity) === index;
  });
  return <Helmet htmlAttributes={{ lang: 'en' }}>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1'} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content={type} /><meta property="og:url" content={canonical} />
    <meta property="og:title" content={title} /><meta property="og:description" content={description} />
    <meta property="og:image" content={image} /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_IN" /><meta property="og:site_name" content="Vivek Doba Business Mastery" />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} /><meta name="twitter:image" content={image} />
    {structuredData.map((schema, index) => <script key={index} type="application/ld+json">{JSON.stringify(schema)}</script>)}
  </Helmet>;
}