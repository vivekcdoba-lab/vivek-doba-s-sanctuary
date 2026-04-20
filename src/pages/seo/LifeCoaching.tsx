import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const LifeCoaching = () => {
  useDocumentMeta({
    title: "Life Coach in India for Students, Professionals & Entrepreneurs",
    description:
      "Trusted life coach for students, working professionals, entrepreneurs and seekers of all ages. Dharma-based coaching for clarity, purpose and lasting fulfillment.",
    canonicalPath: "/life-coaching",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Life Coaching"
        title="Life Coaching for Purpose-Driven Living"
        subtitle="Find clarity, align with your dharma and design a life that feels meaningful — not just successful."
      />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">What a Life Coach Actually Does</h2>
          <p>
            A life coach helps you uncover the deeper <em>why</em> behind your daily actions and rebuild your routines around it.
            As a dharma-based life coach, Vivek Doba works with students, professionals, entrepreneurs and seekers of all ages to
            map their life calling and design a life that feels genuinely theirs — quieter mind, clearer decisions, real meaning.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Who Benefits Most</h2>
          <p>
            High-functioning people who are successful on paper but feel a quiet restlessness — entrepreneurs at an inflection point,
            corporate leaders facing burnout, students choosing a path, and individuals navigating a major life transition.
            If outer achievement no longer satisfies, dharma-based life coaching is built for exactly this moment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">How the Work Is Structured</h2>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">1. Diagnose</h3>
          <p>We map your current life across the Wheel of Life, Ikigai and the four Purushaarthas (Dharma, Artha, Kama, Moksha) — and locate where alignment is missing.</p>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2. Practice</h3>
          <p>Daily worksheets, meditation, journaling and sankalp (intention setting) build new patterns of clarity and emotional regulation.</p>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3. Integrate</h3>
          <p>A 6-stage transformation journey — Awakening → Tapasya → Sangharsh → Bodh → Vistar → Siddhi — locks the change into identity, not effort.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Why Dharma-Based Life Coaching Works</h2>
          <p>
            Most coaching changes behaviour. Dharma-based coaching changes the source of behaviour — your relationship with purpose
            itself. Clients consistently report sharper decision-making, healthier relationships, fewer reactive moments and a renewed
            sense of meaning. Pair this with{" "}
            <Link to="/business-coaching" className="text-primary hover:underline">business coaching</Link>,{" "}
            <Link to="/manifestation" className="text-primary hover:underline">manifestation coaching</Link> or{" "}
            <Link to="/meditation" className="text-primary hover:underline">meditation for success</Link> for compound results.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Get Started</h2>
          <p>
            Book a free 45-minute discovery call to clarify what you're really seeking. No pressure, no script — just clarity on
            whether life coaching is the right next step for you.
          </p>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-1 mt-3 text-primary font-semibold hover:underline"
          >
            Book your discovery call <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </article>

      <SeoCTA />
    </SeoPage>
  );
};

export default LifeCoaching;
