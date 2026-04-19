import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

const Meditation = () => {
  useDocumentMeta({
    title: "Meditation for Entrepreneurs & Success | VDTS",
    description: "Meditation for success and entrepreneurs. Practical guided practice to build mental clarity, emotional control and a calm leadership presence.",
    canonicalPath: "/meditation",
  });

  return (
    <SeoPage>
      <SeoHero
        eyebrow="Meditation"
        title="Meditation for Success & Mental Clarity"
        subtitle="A practical, results-oriented meditation practice for founders, professionals and high-performers."
      />

      <article className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Meditation for entrepreneurs and busy professionals</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Meditation for success is less about silencing the mind and more about training attention. Consistent practice
          improves decision quality, emotional regulation and the ability to stay with hard problems. For founders, this
          shows up as fewer reactive emails, better hiring decisions and a steadier presence in front of teams.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">A simple daily protocol</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
          <li>10–20 minutes morning meditation (breath, mantra or visualization)</li>
          <li>3-minute reset between meetings — eyes closed, deep breath, one intention</li>
          <li>Evening review — gratitude, three wins, sankalp for tomorrow</li>
          <li>Weekly silent practice — 30+ minutes uninterrupted</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Why meditation belongs in your business operating system</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Inner alignment success is built on attention. Without it, strategy fragments and culture drifts. Meditation is
          the lowest-cost, highest-leverage intervention available to a leader. Paired with{" "}
          <Link to="/business-coaching" className="text-primary underline">business coaching</Link> and{" "}
          <Link to="/manifestation" className="text-primary underline">manifestation practice</Link>, it becomes the
          quiet engine behind sustainable growth.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Guided practice and tools</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Inside the VDTS platform you'll find a meditation timer, a Sacred Sound System with procedurally generated
          ambient audio, and progress tracking that shows how consistent practice correlates with mood, energy and
          performance over time.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Start meditating today</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Book a free discovery call to design a meditation routine that fits your actual calendar — not an idealized
          version of it. Or explore the deeper{" "}
          <Link to="/dharma-philosophy" className="text-primary underline">dharma philosophy</Link> behind the practice.
        </p>
      </article>

      <SeoCTA />
    </SeoPage>
  );
};

export default Meditation;
