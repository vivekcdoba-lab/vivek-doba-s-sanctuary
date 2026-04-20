import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const NlpCoach = () => {
  useDocumentMeta({
    title: "NLP Coach in India for Corporate Professionals & Leaders",
    description:
      "Certified NLP coach for corporate employees, managers, founders and entrepreneurs. Rewire mindset, break limiting beliefs and lead with calm, conscious clarity.",
    canonicalPath: "/nlp-coach",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Neuro-Linguistic Programming"
        title="NLP Coach for Mindset & Behaviour Change"
        subtitle="Rewire limiting beliefs, install empowering patterns and lead from a calmer, clearer self."
      />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">What an NLP Coach Actually Does</h2>
          <p>
            Neuro-Linguistic Programming (NLP) is a practical toolkit for changing how you think, feel and behave under pressure.
            As an NLP coach in India, Vivek Doba combines classical NLP techniques — anchoring, reframing, timeline work and parts
            integration — with dharma-based coaching so transformation is both fast and rooted in purpose. The result is conscious
            leadership: better decisions, calmer responses and aligned action.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Who Benefits Most</h2>
          <p>
            Founders stuck in self-doubt, professionals navigating big career shifts, and leaders managing high-stakes teams.
            If you've read the books, attended the webinars, and still feel the same patterns repeating — NLP coaching is the
            intervention that goes beneath the story to the structure underneath.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">How the Work Is Structured</h2>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">1. Diagnose the pattern</h3>
          <p>We map the limiting belief, the trigger, and the unwanted behaviour with precision.</p>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2. Run the change technique</h3>
          <p>Anchoring, swish patterns, reframing or timeline work — chosen for the specific issue.</p>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3. Install and integrate</h3>
          <p>Daily worksheets, sankalp practice and meditation lock in the new pattern so it becomes identity, not effort.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Why Combine NLP With Dharma</h2>
          <p>
            NLP changes the inner machine. Dharma points it in the right direction. Together they produce mindset and business
            growth that feels meaningful — not just performance for its own sake. Pair this with{" "}
            <Link to="/meditation" className="text-primary hover:underline">meditation for entrepreneurs</Link> and{" "}
            <Link to="/manifestation" className="text-primary hover:underline">manifestation coaching</Link> and you have a complete
            inner-alignment system.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Get Started</h2>
          <p>
            Book a free 45-minute discovery call to map your current pattern and decide whether NLP coaching is the right next
            step. No pressure, no script — just clarity.
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

export default NlpCoach;
