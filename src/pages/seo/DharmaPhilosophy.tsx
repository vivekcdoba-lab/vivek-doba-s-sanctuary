import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const DharmaPhilosophy = () => {
  useDocumentMeta({
    title: "Dharma Karma Moksha Meaning | Coaching | VDTS",
    description: "Understand the dharma karma moksha meaning and how dharma-based coaching applies these timeless principles to modern life and business.",
    canonicalPath: "/dharma-philosophy",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Dharma Philosophy"
        title="Dharma, Karma & Moksha — The Path to Purpose"
        subtitle="Ancient wisdom, applied. Understand the four Purushaarthas and use them as a practical map for a meaningful modern life."
      />

      <article className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Dharma, karma and moksha — a clear meaning</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The dharma karma moksha meaning is often presented mystically. In practice it is deeply pragmatic.
          <strong> Dharma</strong> is your right action — what is yours to do in this life. <strong>Karma</strong> is the
          law that every action shapes future experience. <strong>Moksha</strong> is the freedom that comes from acting
          from clarity rather than compulsion. Together they form a complete model for living well.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">The four Purushaarthas</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A complete life balances four pursuits, called the Purushaarthas:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
          <li><strong>Dharma</strong> — purpose, values, right action</li>
          <li><strong>Artha</strong> — wealth, work, material wellbeing</li>
          <li><strong>Kama</strong> — relationships, desires, joy</li>
          <li><strong>Moksha</strong> — inner freedom, spiritual realization</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Most modern lives over-invest in Artha and starve the others. Dharma-based coaching rebalances all four,
          which is why clients report not just better businesses but richer relationships and deeper peace.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Life's Golden Triangle</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          LGT — Personal Mastery × Professional Excellence × Spiritual Wellbeing — is Vivek Doba's signature framework
          for translating Purushaartha philosophy into a 6–12 month transformation. It gives spiritual wisdom a measurable
          structure: assessments, daily worksheets, weekly reviews and milestone certifications.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">From philosophy to practice</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Knowing the dharma karma moksha meaning changes nothing on its own. Living it changes everything. Begin by
          mapping your Purushaarthas, then choose the pillar that needs attention first —{" "}
          <Link to="/life-coaching" className="text-primary underline">life coaching</Link> for dharma clarity,{" "}
          <Link to="/business-coaching" className="text-primary underline">business coaching</Link> for artha,{" "}
          <Link to="/manifestation" className="text-primary underline">manifestation</Link> and{" "}
          <Link to="/meditation" className="text-primary underline">meditation</Link> for kama and moksha.
        </p>
      </article>

      <SeoCTA />
    </SeoPage>
  );
};

export default DharmaPhilosophy;
