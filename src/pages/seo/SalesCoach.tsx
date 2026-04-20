import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const SalesCoach = () => {
  useDocumentMeta({
    title: "Sales Coach for Founders, Entrepreneurs & B2B Sales Teams",
    description:
      "Sales coaching for founders, consultants, corporate sales teams and entrepreneurs across India. Build a calm, ethical, repeatable sales process that converts.",
    canonicalPath: "/sales-coach",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Conscious Selling"
        title="Sales Coach for Founders, Consultants & B2B Teams"
        subtitle="Sell with clarity and conviction — not pressure. Build a calm, repeatable sales process rooted in service."
      />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">A Different Kind of Sales Coach</h2>
          <p>
            Most sales coaching teaches scripts and closes. This one teaches identity and process. As a sales coach for
            entrepreneurs and small B2B teams, Vivek Doba helps founders move from reluctant selling to confident, ethical
            conversations that convert because they create real value — not because of pressure tactics.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">What We Work On</h2>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">1. Sales mindset</h3>
          <p>Heal the money story, the worthiness gap and the fear of rejection that throttle most founder-led sales.</p>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2. A repeatable process</h3>
          <p>Discovery → diagnosis → proposal → close → onboarding — written down, measured, and improved weekly.</p>
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3. Team enablement</h3>
          <p>For small teams: shared playbooks, weekly sales reviews, pipeline rituals and 1:1 coaching for AEs and SDRs.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">For Founders Who Hate Selling</h2>
          <p>
            If selling makes you feel sleazy, anxious or invisible, the issue is rarely technique — it's identity. We use
            NLP-informed reframes (see the{" "}
            <Link to="/nlp-coach" className="text-primary hover:underline">NLP coaching page</Link>) plus dharma-based
            positioning so your sales conversations feel like service. That single shift changes conversion rates more than any
            script ever will.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">For Sales Teams That Have Plateaued</h2>
          <p>
            We diagnose the leak — top-of-funnel, qualification, follow-up or close — and install rituals (daily standup,
            weekly pipeline review, monthly deal post-mortem) that compound. Pair this with{" "}
            <Link to="/business-coaching" className="text-primary hover:underline">business coaching</Link> for full-spectrum
            growth.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Get Started</h2>
          <p>Book a free discovery call. We'll review your current pipeline and decide whether 1:1 or team coaching is the right fit.</p>
          <Link to="/book-appointment" className="inline-flex items-center gap-1 mt-3 text-primary font-semibold hover:underline">
            Book your sales coaching call <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </article>

      <SeoCTA />
    </SeoPage>
  );
};

export default SalesCoach;
