import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { SeoPage, SeoHero, SeoCTA } from "./_SeoLayout";

type LocationKey = "india" | "maharashtra" | "pune" | "mumbai";

const LOCATION_CONTENT: Record<LocationKey, {
  label: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  subtitle: string;
  intro: string;
  local: string;
  areaServed: string;
}> = {
  india: {
    label: "India",
    title: "Life Coach in India | Dharma-Based Coaching | VDTS",
    description: "Work with a life coach in India who blends ancient dharma with modern life-coaching frameworks. Online sessions across all states and time zones.",
    h1: "Life Coach in India for Purpose & Inner Alignment",
    eyebrow: "Pan-India · Online",
    subtitle: "Dharma-based life coaching for seekers across every Indian state — delivered online, with founders' calendars in mind.",
    intro: "Finding the right life coach in India is hard because most coaching ignores the one thing Indian seekers actually want: meaning. Vivek Doba's practice is built on Dharma, Artha, Kama and Moksha — the four Purushaarthas — translated into modern worksheets, weekly check-ins and measurable outcomes.",
    local: "Clients join from Bengaluru, Delhi-NCR, Hyderabad, Chennai, Kolkata, Ahmedabad and tier-2 cities like Indore, Jaipur and Coimbatore. Sessions run online over Google Meet, with WhatsApp support between calls. The methodology travels — whether you're a SaaS founder in Bengaluru or a family-business owner in Surat, the work begins in the same place: inner alignment.",
    areaServed: "India",
  },
  maharashtra: {
    label: "Maharashtra",
    title: "Life Coach in Maharashtra | Dharma & Mindset Coach",
    description: "Life coach serving Maharashtra — Pune, Mumbai, Nagpur, Nashik and Aurangabad. Dharma-based coaching for purpose, mindset and conscious leadership.",
    h1: "Life Coach in Maharashtra for Purpose-Driven Living",
    eyebrow: "Maharashtra · Marathi-friendly",
    subtitle: "Marathi-speaking life coach for entrepreneurs and professionals across Maharashtra — in person in Pune, online everywhere else.",
    intro: "A good life coach in Maharashtra understands the cultural texture — joint families, business communities, the pull between modern ambition and traditional duty. Vivek Doba's coaching is delivered in English, Hindi and Marathi, blending dharma philosophy with practical frameworks for mindset and life design.",
    local: "Active clients across Pune, Mumbai, Nagpur, Nashik, Aurangabad and Kolhapur. In-person workshops run quarterly in Pune; everything else is delivered online so distance never blocks the work. Particularly suited to first-generation entrepreneurs and second-generation business inheritors managing legacy expectations.",
    areaServed: "Maharashtra, India",
  },
  pune: {
    label: "Pune",
    title: "Life Coach in Pune | Purpose, Mindset & Meditation",
    description: "Life coach in Pune for founders, IT professionals and family-business owners. In-person sessions in Pune plus online support. Marathi, Hindi & English.",
    h1: "Life Coach in Pune — Clarity, Purpose, Inner Peace",
    eyebrow: "Pune · In-person + Online",
    subtitle: "Based in Pune. Working with founders in Koregaon Park, Hinjawadi and Baner — and family-business owners across the city.",
    intro: "A life coach in Pune has to speak two languages — the founder energy of Hinjawadi and the family-business culture of Sadashiv Peth. Vivek Doba does both. The coaching practice is headquartered in Pune, with in-person sessions for serious clients and online sessions for everyone else.",
    local: "Regular clients include IT professionals and product managers from Hinjawadi & Magarpatta, D2C founders around Koregaon Park, and family-business owners managing succession across Sadashiv, Camp and Aundh. Workshops are hosted quarterly in central Pune. Marathi, Hindi and English supported equally.",
    areaServed: "Pune, Maharashtra, India",
  },
  mumbai: {
    label: "Mumbai",
    title: "Life Coach in Mumbai | Founders & Corporate Leaders",
    description: "Life coach in Mumbai for founders, corporate leaders and creative professionals. Online sessions designed around Mumbai's intense schedules.",
    h1: "Life Coach in Mumbai for Founders & Corporate Leaders",
    eyebrow: "Mumbai · Online + Quarterly Visits",
    subtitle: "For Mumbai's high-velocity professionals — founders in BKC, finance leaders at Nariman Point, and creatives across Bandra & Andheri.",
    intro: "A life coach in Mumbai has to respect the city's pace. Sessions are designed for hour-long focused work — no fluff — with WhatsApp support between calls. The coaching blends dharma philosophy with frameworks for conscious leadership, decision quality and emotional regulation under pressure.",
    local: "Clients include startup founders in BKC and Lower Parel, finance and consulting professionals across Nariman Point, and creative entrepreneurs from Bandra, Andheri and Versova. Mumbai sessions are primarily online with quarterly in-person intensives. Suited to high-functioning leaders feeling more burned out than bad.",
    areaServed: "Mumbai, Maharashtra, India",
  },
};

const VALID_KEYS: LocationKey[] = ["india", "maharashtra", "pune", "mumbai"];

const LifeCoachLocation = () => {
  const { location } = useParams<{ location: string }>();
  const key = (VALID_KEYS.includes(location as LocationKey) ? location : "india") as LocationKey;
  const content = LOCATION_CONTENT[key];

  useDocumentMeta({
    title: content.title,
    description: content.description,
    canonicalPath: `/life-coach-in-${key}`,
  });

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `Vivek Doba — Life Coach in ${content.label}`,
    areaServed: content.areaServed,
    url: `https://vivekdoba.com/life-coach-in-${key}`,
    telephone: "+91-9607050111",
    address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
  };

  return (
    <SeoPage>
      <SeoHero eyebrow={content.eyebrow} title={content.h1} subtitle={content.subtitle} />

      <article className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Why Choose This Practice</h2>
          <p>{content.intro}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Local Context — {content.label}</h2>
          <p>{content.local}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">What the Work Covers</h2>
          <p>
            Purpose discovery (Ikigai + Dharma), value alignment, mindset and behaviour change, relationship and family
            dynamics, energy management, and sankalp-based goal setting. Each engagement comes with worksheets, weekly
            reviews and measurable progress charts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Related Coaching</h2>
          <p>
            Many {content.label} clients also work on{" "}
            <Link to={`/business-coach-in-${key}`} className="text-primary hover:underline">
              business coaching in {content.label}
            </Link>
            ,{" "}
            <Link to="/manifestation" className="text-primary hover:underline">manifestation</Link>, and{" "}
            <Link to="/meditation" className="text-primary hover:underline">meditation for entrepreneurs</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Get Started</h2>
          <p>Free 45-minute discovery call. We'll discuss where you are, where you want to be, and whether this is the right fit.</p>
          <Link to="/book-appointment" className="inline-flex items-center gap-1 mt-3 text-primary font-semibold hover:underline">
            Book your call <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </article>

      <SeoCTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
    </SeoPage>
  );
};

export default LifeCoachLocation;
