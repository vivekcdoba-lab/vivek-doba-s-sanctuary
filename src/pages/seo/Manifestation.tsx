import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const Manifestation = () => {
  useDocumentMeta({
    title: "Manifestation Coaching for All Ages | Law of Attraction India",
    description: "Manifestation & law of attraction coaching for students, professionals, entrepreneurs and seekers of every age. Turn intention into measurable life & business outcomes.",
    canonicalPath: "/manifestation",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Manifestation"
        title="Manifestation Coaching for Real-World Results"
        subtitle="Bridge ancient sankalp practice with modern goal science to manifest outcomes you can actually measure."
      />

      <article className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Manifestation, grounded in action</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Manifestation coaching often gets reduced to vision boards. The deeper Vedic understanding is more rigorous: a
          clear sankalp (intention), aligned identity, daily disciplined action, and surrender of attachment to outcome.
          When all four are present, the law of attraction stops feeling like magic and starts behaving like physics.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">The four-step manifestation framework</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
          <li><strong>Clarify</strong> — name exactly what you want and why it matters</li>
          <li><strong>Align</strong> — rebuild identity, environment and beliefs to match</li>
          <li><strong>Act</strong> — design daily worksheets and non-negotiables that move you forward</li>
          <li><strong>Surrender</strong> — release timing and form, stay anchored in the present</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Law of attraction coaching for entrepreneurs</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          For founders, manifestation is not separate from strategy — it is what makes strategy stick. We use daily
          sankalp setting, gratitude journaling, and weekly reviews to keep your mental state in the frequency of the
          outcome you're building. Combined with <Link to="/meditation" className="text-primary underline">meditation for
          success</Link>, this creates a stable inner platform from which growth becomes natural.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">What clients manifest</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Clients have manifested business breakthroughs, healed relationships, weight loss goals, books, programs and
          deeply changed self-image. The common factor is not luck — it is the quality of attention they bring to their
          inner state every single morning.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Begin your manifestation journey</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Start with a one-day workshop on Laws of Attraction through the Ramayana, or go deeper with{" "}
          <Link to="/life-coaching" className="text-primary underline">1:1 life coaching</Link> built around
          dharma-aligned manifestation.
        </p>
      </article>

      <SeoCTA />
    </SeoPage>
  );
};

export default Manifestation;
