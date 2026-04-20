import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const LifeCoaching = () => {
  useDocumentMeta({
    title: "Life Coach in India for Students, Professionals & Entrepreneurs",
    description: "Trusted life coach for students, working professionals, entrepreneurs and seekers of all ages. Dharma-based coaching for clarity, purpose and lasting fulfillment.",
    canonicalPath: "/life-coaching",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Life Coaching"
        title="Life Coaching for Purpose-Driven Living"
        subtitle="Find clarity, align with your dharma and design a life that feels meaningful — not just successful."
      />

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">A life coach for purpose, not just productivity</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Most people don't need another planner — they need a deeper answer to <em>why</em> they're doing what they do. As
          a life coach for purpose, Vivek Doba helps professionals, founders and creatives uncover their dharma (life
          calling) and rebuild daily routines around it. The result is a quieter mind, clearer decisions and a life that
          finally feels yours.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Who this coaching is for</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          You may be successful on paper — promotions, revenue, recognition — yet feel a quiet restlessness. You sense
          you're playing a role rather than living a life. Dharma-based coaching is built for high-functioning people who
          want inner alignment to match outer achievement: entrepreneurs at an inflection point, leaders facing burnout,
          and individuals navigating a major transition.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">How dharma-based life coaching works</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Sessions blend ancient Indian wisdom with modern coaching psychology. We use frameworks like the Wheel of Life,
          Ikigai, Purushaarthas (Dharma, Artha, Kama, Moksha) and FIRO-B to map where you are today and where you want to
          go. Each engagement combines:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
          <li>1:1 coaching conversations focused on inner alignment success</li>
          <li>Daily practices — meditation, journaling, sankalp (intention setting)</li>
          <li>Assessments that translate insight into measurable progress</li>
          <li>A 6-stage transformation journey: Awakening → Tapasya → Sangharsh → Bodh → Vistar → Siddhi</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">What changes for clients</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Clients consistently report sharper decision-making, healthier relationships, fewer reactive moments, and a
          renewed sense of meaning in their work. For founders, this often shows up as a calmer leadership presence; for
          professionals, as the courage to make a long-postponed change. Purpose-driven living is not a luxury — it is the
          foundation of sustainable performance.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Where to start</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Begin with a free 45-minute discovery call to clarify what you're really seeking. If you're ready to go deeper,
          explore <Link to="/business-coaching" className="text-primary underline">business coaching for entrepreneurs</Link>,
          {" "}<Link to="/manifestation" className="text-primary underline">manifestation coaching</Link> or{" "}
          <Link to="/meditation" className="text-primary underline">meditation for success</Link>.
        </p>
      </article>

      <SeoCTA />
    </SeoPage>
  );
};

export default LifeCoaching;
