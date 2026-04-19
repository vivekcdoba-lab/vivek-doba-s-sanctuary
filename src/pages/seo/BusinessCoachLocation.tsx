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
    title: "Business Coach in India | For Founders & SMBs",
    description: "Business coach in India for founders, SMB owners and consultants. Mindset, strategy and ethical sales — delivered online across the country.",
    h1: "Business Coach in India for Conscious Founders",
    eyebrow: "Pan-India · Online",
    subtitle: "Strategy, mindset and conscious leadership for founders building purpose-driven businesses anywhere in India.",
    intro: "Choosing a business coach in India is a serious decision — most are either pure-strategy MBAs with no inner work, or pure mindset coaches with no business experience. Vivek Doba bridges both: 20+ years building, advising and scaling businesses, combined with a deep dharma-based coaching practice for the inner game.",
    local: "Clients across Bengaluru SaaS, Delhi-NCR D2C, Hyderabad services, Chennai manufacturing, Pune IT, and tier-2 family businesses in Indore, Coimbatore, Jaipur and Surat. Sessions delivered online with quarterly intensives in Pune for serious engagements. Particularly strong fit for founders running ₹1–25 Cr revenue businesses.",
    areaServed: "India",
  },
  maharashtra: {
    label: "Maharashtra",
    title: "Business Coach in Maharashtra | Founder Coaching",
    description: "Business coach for Maharashtra-based founders and SMB owners. Pune, Mumbai, Nagpur, Nashik. Strategy, mindset and ethical sales coaching.",
    h1: "Business Coach in Maharashtra for Founders & SMBs",
    eyebrow: "Maharashtra · Marathi-friendly",
    subtitle: "Mindset and business growth coaching for Maharashtra's founders, manufacturers and family businesses.",
    intro: "A business coach in Maharashtra needs to understand the state's distinct business cultures — Pune's IT-driven entrepreneurship, Mumbai's corporate intensity, the manufacturing belts of Aurangabad and Nashik, and the deep family-business networks of Pune and Kolhapur. Vivek Doba's coaching meets each on its own terms.",
    local: "Active engagements with founders in Pune, Mumbai, Nashik, Aurangabad, Nagpur and Kolhapur. Marathi, Hindi and English supported. Quarterly in-person workshops in Pune; ongoing coaching online. Particularly suited to second-generation business owners modernising legacy operations.",
    areaServed: "Maharashtra, India",
  },
  pune: {
    label: "Pune",
    title: "Business Coach in Pune | Founders & Family Business",
    description: "Business coach in Pune for IT founders, D2C entrepreneurs and family-business owners. In-person sessions in Pune plus online coaching.",
    h1: "Business Coach in Pune for Founders & Family Business Owners",
    eyebrow: "Pune · In-person + Online",
    subtitle: "Based in Pune. Coaching IT founders in Hinjawadi, D2C brands in Koregaon Park, and multi-generational family businesses across the city.",
    intro: "Pune is where this practice is built. As a business coach in Pune, Vivek Doba works with both ends of the city's economy — the venture-backed founders of Hinjawadi and Magarpatta, and the family-owned manufacturers and traders of Sadashiv Peth, Camp and Pimpri-Chinchwad.",
    local: "Specialisations include IT and SaaS founders managing rapid growth, D2C and consumer brands building distribution, and family businesses navigating succession or modernisation. In-person sessions available; cohort workshops hosted quarterly. Marathi, Hindi and English supported equally.",
    areaServed: "Pune, Maharashtra, India",
  },
  mumbai: {
    label: "Mumbai",
    title: "Business Coach in Mumbai | Founders & Leaders",
    description: "Business coach in Mumbai for startup founders in BKC, finance leaders at Nariman Point, and creative entrepreneurs across Bandra & Andheri.",
    h1: "Business Coach in Mumbai for Founders & Senior Leaders",
    eyebrow: "Mumbai · Online + Quarterly Visits",
    subtitle: "Strategy and conscious leadership coaching for Mumbai's high-velocity founders, finance leaders and creative entrepreneurs.",
    intro: "A business coach in Mumbai must respect the city's velocity and the cost of every leader's hour. Sessions are tightly structured — diagnosis, decision, action — with WhatsApp follow-up so you keep moving between calls. The coaching pairs business strategy with the inner work that prevents burnout at scale.",
    local: "Clients include startup founders in BKC and Lower Parel, finance and consulting professionals around Nariman Point, and creative-agency owners across Bandra, Andheri and Versova. Sessions are primarily online with quarterly in-person intensives. Strong fit for founders scaling past their first plateau.",
    areaServed: "Mumbai, Maharashtra, India",
  },
};

const VALID_KEYS: LocationKey[] = ["india", "maharashtra", "pune", "mumbai"];

const BusinessCoachLocation = () => {
  const { location } = useParams<{ location: string }>();
  const key = (VALID_KEYS.includes(location as LocationKey) ? location : "india") as LocationKey;
  const content = LOCATION_CONTENT[key];

  useDocumentMeta({
    title: content.title,
    description: content.description,
    canonicalPath: `/business-coach-in-${key}`,
  });

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `Vivek Doba — Business Coach in ${content.label}`,
    areaServed: content.areaServed,
    url: `https://vivekdoba.com/business-coach-in-${key}`,
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
            Vision and mission clarity, strategic positioning, sales process design, team building, financial discipline, and the
            inner work — sankalp, energy management, decision quality — that determines whether you can actually execute the strategy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Related Coaching</h2>
          <p>
            Many {content.label} founders also engage with{" "}
            <Link to={`/life-coach-in-${key}`} className="text-primary hover:underline">life coaching in {content.label}</Link>,{" "}
            <Link to="/sales-coach" className="text-primary hover:underline">sales coaching</Link>, and{" "}
            <Link to="/nlp-coach" className="text-primary hover:underline">NLP coaching</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Get Started</h2>
          <p>Book a free 45-minute discovery call. We'll diagnose the bottleneck and decide whether 1:1 coaching or the LGT program is right.</p>
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

export default BusinessCoachLocation;
