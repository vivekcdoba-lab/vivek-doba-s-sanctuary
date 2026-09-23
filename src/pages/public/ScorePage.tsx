import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicSeo, { breadcrumbSchema } from '@/components/public/PublicSeo';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const areas = ['Business', 'Health', 'Family'] as const;
export default function ScorePage() {
  const [scores, setScores] = useState<Record<string, number>>({ Business: 5, Health: 5, Family: 5 });
  const total = useMemo(() => Math.round((scores.Business + scores.Health + scores.Family) / 3 * 10), [scores]);
  const title = 'Golden Triangle Score | Business, Health & Family';
  const description = 'Check your balance across business, health and family with the Golden Triangle Score, then identify the area that needs your attention first.';
  return <>
    <PublicSeo title={title} description={description} path="/score" schemas={[breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Golden Triangle Score', path: '/score' }])]} />
    <section className="border-b border-border bg-muted/30 px-4 py-16 text-center"><p className="text-sm font-semibold uppercase text-primary">Three-minute self-check</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Your Golden Triangle Score</h1><p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Rate how steady each area feels today. This is a reflection tool, not a clinical assessment.</p></section>
    <section className="mx-auto max-w-2xl px-4 py-16"><div className="space-y-8">{areas.map(area => <div key={area}><div className="mb-3 flex justify-between"><label htmlFor={area} className="font-semibold">{area}</label><span aria-live="polite">{scores[area]}/10</span></div><Slider id={area} min={1} max={10} step={1} value={[scores[area]]} onValueChange={value => setScores(current => ({ ...current, [area]: value[0] ?? 5 }))} aria-label={`${area} score`} /></div>)}</div><div className="mt-10 border-y border-border py-8 text-center"><p className="text-sm font-semibold uppercase text-muted-foreground">Overall balance</p><p className="mt-2 text-6xl font-bold text-primary">{total}</p><p className="text-muted-foreground">out of 100</p></div><div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild><Link to="/courses/know-your-triangle">Explore your score live</Link></Button><Button asChild variant="outline"><Link to="/contact">Contact us</Link></Button></div></section>
  </>;
}