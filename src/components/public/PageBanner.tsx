import type { LucideIcon } from 'lucide-react';

export default function PageBanner({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description: string }) {
  return <section className="gradient-hero text-primary-foreground py-14 sm:py-20">
    <div className="max-w-5xl mx-auto px-4 text-center">
      <Icon className="w-9 h-9 mx-auto mb-4 opacity-90" />
      <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">{eyebrow}</p>
      <h1 className="text-3xl sm:text-5xl font-bold mb-4">{title}</h1>
      <p className="max-w-2xl mx-auto text-sm sm:text-base opacity-90 leading-relaxed">{description}</p>
    </div>
  </section>;
}