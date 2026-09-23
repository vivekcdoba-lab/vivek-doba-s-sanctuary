import { Award, Compass, Star, User } from 'lucide-react';
import vivekDobaPhoto from '@/assets/vivek-doba.png';
import PageBanner from '@/components/public/PageBanner';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';

const milestones = [
  { value: '805+', label: 'Google & client reviews', icon: Star },
  { value: 'Since 1998', label: 'Coaching business owners', icon: Award },
];

export default function AboutPage() {
  return <>
    <PublicSeo title="About Vivek Doba | Business & Life Coach, Pune" description="Meet Vivek Doba, founder of Life’s Golden Triangle™. Coaching business owners in Pune and PCMC since 1998 to grow business, health and family together." path="/about" schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])]} />
    <PageBanner icon={User} eyebrow="About Us" title="Wisdom for a life of purpose" description="Vivek Doba Business Mastery brings ancient Indian wisdom into practical personal leadership, conscious business, and daily transformation." />
    <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid md:grid-cols-[320px_1fr] gap-10 items-center">
      <img src={vivekDobaPhoto} alt="Vivek Doba" width="500" height="331" loading="lazy" className="w-full max-w-xs mx-auto aspect-square object-cover rounded-lg border-4 border-primary/20 shadow-xl" />
      <div><p className="text-primary font-semibold mb-2">Meet Vivek Doba</p><h2 className="text-3xl font-bold mb-5">Coach, teacher and founder of Life's Golden Triangle</h2><p className="text-muted-foreground leading-7 mb-4">Vivek Doba guides entrepreneurs, professionals and purpose-seekers towards clarity, balance and sustainable achievement. His approach combines spiritual principles, mindset work and practical business discipline.</p><p className="text-muted-foreground leading-7">Our mission is to help every seeker align who they are, what they value and how they lead—so success feels meaningful as well as measurable.</p></div>
    </section>
    <section className="bg-muted/40 border-y border-border py-14"><div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-3 gap-5">{milestones.map(({ value, label, icon: Icon }) => <div key={label} className="bg-card border border-border rounded-lg p-6 text-center"><Icon className="w-7 h-7 mx-auto mb-3 text-primary" /><p className="text-3xl font-bold text-primary">{value}</p><p className="text-sm text-muted-foreground mt-1">{label}</p></div>)}</div></section>
    <section className="max-w-5xl mx-auto px-4 py-14 sm:py-20"><div className="flex gap-4 items-start mb-8"><Compass className="w-8 h-8 text-primary shrink-0" /><div><h2 className="text-3xl font-bold">Life's Golden Triangle</h2><p className="text-muted-foreground mt-2">A philosophy for creating harmony across the essential dimensions of a fulfilled life.</p></div></div><div className="grid md:grid-cols-3 gap-5">{['Purpose & Inner Growth','Relationships & Wellbeing','Prosperity & Contribution'].map((title, index) => <div key={title} className="border-t-4 border-primary bg-card shadow-sm p-6"><p className="text-xs font-bold text-primary mb-2">PILLAR {index + 1}</p><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-sm text-muted-foreground">A practical path of reflection, aligned action and accountable growth.</p></div>)}</div><p className="text-xs text-muted-foreground mt-8 border-l-2 border-primary pl-3">Each pillar is explored through reflection, practical action and regular review.</p></section>
  </>;
}