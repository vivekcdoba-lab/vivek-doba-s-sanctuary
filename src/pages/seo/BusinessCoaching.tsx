import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const BusinessCoaching = () => {
  useDocumentMeta({
    title: "Business Coach for Entrepreneurs, Industrialists & Founders | India",
    description:
      "Spiritual business coach for entrepreneurs, business owners and industrialists. Combine mindset, dharma and growth strategy to scale a purpose-driven business.",
    canonicalPath: "/business-coaching",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Business Coaching"
        title="Business Coaching for Conscious Entrepreneurs"
        subtitle="Combine mindset, dharma and proven growth strategy to build a business that grows you as much as it grows revenue."
      />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">What Business Coaching Actually Solves</h2>
          <p>
            Spiritual business coaching is not chanting before strategy meetings. It's removing the inner blocks — fear, scarcity,
            identity confusion — that quietly cap your revenue, your team's energy and your own fulfillment. Vivek Doba works with
            founders, industrialists and senior leaders who want spiritual maturity <em>and</em> hard business results.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Who Benefits Most</h2>
          <p>
            Entrepreneurs at a growth ceiling, industrialists managing legacy businesses, founders preparing to scale, and
            corporate leaders crossing into ownership. If your numbers have plateaued or your nervous system is fried,
            business coaching restores both clarity and capacity.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">The Artha Framework</h2>
          <p>
            Artha — wealth and material wellbeing — is one of four pillars of a complete life. Our business coaching framework
            treats your company as a living system across:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Vision, mission and brand positioning</li>
            <li>Sales, marketing and customer satisfaction</li>
            <li>Accounting, cashflow and financial discipline</li>
            <li>Team health, R&amp;D and competitor strategy</li>
            <li>Founder mindset, sankalp and conscious leadership</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Mindset + Strategy, Together</h2>
          <p>
            Most coaching focuses on either tactics (funnels, hiring, ops) or mindset (beliefs, patterns). Real growth needs both.
            Engagements integrate weekly business reviews — sales, cashflow, departmental health, SWOT — with deep inner work on
            decision fatigue and emotional regulation. Pair with{" "}
            <Link to="/meditation" className="text-primary hover:underline">meditation for entrepreneurs</Link> or{" "}
            <Link to="/manifestation" className="text-primary hover:underline">manifestation coaching</Link> for compound results.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Get Started</h2>
          <p>
            The premier 6–12 month{" "}
            <Link to="/apply-lgt" className="text-primary hover:underline">Life's Golden Triangle program</Link> is our flagship
            engagement for serious founders. Or book a free discovery call to find the right entry point for your business.
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

export default BusinessCoaching;
