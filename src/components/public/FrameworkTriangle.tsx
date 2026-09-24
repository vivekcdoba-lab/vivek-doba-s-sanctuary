import { framework } from '@/data/framework';

export default function FrameworkTriangle() {
  const [dharma, artha, kama] = framework.corners;
  if (!dharma || !artha || !kama) return null;

  return <div className="homepage-triangle mx-auto" aria-label="Golden Triangle with Dharma, Artha and Kama at its corners and Moksha at the centre">
    <div className="homepage-triangle-shape" />
    <span className="homepage-triangle-point homepage-triangle-dharma"><strong>{dharma.name}</strong> · {dharma.short}</span>
    <span className="homepage-triangle-point homepage-triangle-artha"><strong>{artha.name}</strong> · {artha.short}</span>
    <span className="homepage-triangle-point homepage-triangle-kama"><strong>{kama.name}</strong> · {kama.short}</span>
    <span className="homepage-triangle-centre"><strong>{framework.centre.name}</strong> · {framework.centre.short}</span>
  </div>;
}