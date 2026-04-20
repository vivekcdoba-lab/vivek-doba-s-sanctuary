import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const BusinessCoaching = () => {
  useDocumentMeta({
    title: "Business Coach for Entrepreneurs, Industrialists & Founders | India",
    description: "Spiritual business coach for entrepreneurs, business owners and industrialists. Combine mindset, dharma and growth strategy to scale a purpose-driven business.",
    canonicalPath: "/business-coaching",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Business Coaching"
        title="Business Coaching for Conscious Entrepreneurs"
        subtitle="Combine mindset, dharma and proven growth strategy to build a business that grows you as much as it grows revenue."
      />

      <article className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">A business coach for entrepreneurs who want depth and scale</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Spiritual business coaching is not about chanting before strategy meetings. It's about removing the inner blocks
          — fear, scarcity, identity confusion — that quietly cap your revenue, your team's energy and your own
          fulfillment. Vivek Doba works with founders and senior leaders who want both spiritual maturity <em>and</em> hard
          business results.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Mindset and business growth, side by side</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Most coaching either focuses on tactics (funnels, hiring, ops) or mindset (beliefs, patterns). Real growth needs
          both. Engagements integrate weekly business reviews — sales, cashflow, departmental health, SWOT — with deep
          inner work on conscious leadership, decision fatigue and emotional regulation. You leave each month with cleaner
          numbers and a calmer nervous system.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Built around the Artha pillar</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Artha — wealth and material wellbeing — is one of four pillars of a complete life. Our business coaching
          framework treats your company as a living system across:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
          <li>Vision, mission and brand positioning</li>
          <li>Sales, marketing and customer satisfaction</li>
          <li>Accounting, cashflow and financial discipline</li>
          <li>Team health, R&D and competitor strategy</li>
          <li>Founder mindset, sankalp and conscious leadership</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">For purpose-driven businesses</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          A purpose-driven business is not a slogan on a website. It is a company whose strategy, hiring and offers all
          flow from a clear inner why. Coaching helps you articulate that why, then operationalize it across every
          department so culture and growth reinforce each other.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Get started</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The premier 6–12 month <Link to="/apply-lgt" className="text-primary underline">Life's Golden Triangle program</Link>
          {" "}is our flagship engagement for serious founders. You can also pair business coaching with{" "}
          <Link to="/meditation" className="text-primary underline">meditation for entrepreneurs</Link> or{" "}
          <Link to="/manifestation" className="text-primary underline">manifestation coaching</Link> for compound results.
        </p>
      </article>

      <SeoCTA />
    </SeoPage>
  );
};

export default BusinessCoaching;
