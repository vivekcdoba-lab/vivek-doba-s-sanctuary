export type Course = {
  slug: string;
  step: string | null;        // ladder step number shown on /courses ("0"–"4"), "🕉️" for Ram Nirvana, null for side programs
  stage: string | null;       // ladder stage name
  name: string;
  meta: string;               // duration / format line
  forWhom: string;            // "किसके लिए"
  forLabel?: string;          // override label, e.g. "कब"
  price: string | null;       // null = do not show a price
  priceNote?: string;         // shown instead of price when price is null
  nextDate?: string;
  ctaLabel: string | null;    // null = no button
  ctaType: "book" | "diagnostic" | "apply" | "enquiry" | "prebook" | "read" | "none";
  nextSlug?: string;          // "अगला पायदान" shown at the end of the course page
  locked?: boolean;
};

export const WHATSAPP_NUMBER = "919607050111";

export const whatsappLink = (programName: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`नमस्ते, मुझे ${programName} के बारे में जानना है`)}`;

export const ladder: Course[] = [
  {
    slug: "know-your-triangle",
    step: "0", stage: "पहचान",
    name: "Know Your Triangle",
    meta: "2 घंटे · समूह · Golden Triangle Score जीवंत",
    forWhom: "जो अभी सिर्फ़ देखना चाहते हैं",
    price: "निःशुल्क",
    ctaLabel: "सीट बुक करें", ctaType: "book",
    nextSlug: "loa",
  },
  {
    slug: "loa",
    step: "1", stage: "संकल्प",
    name: "LOA through Ramayana",
    meta: "2 दिन · Offline या Online · भीतर का राम, रावण, सीता, हनुमान",
    forWhom: "जो अटके हैं और भीतर से शुरू करना चाहते हैं",
    price: "₹5,999 से",
    nextDate: "3–4 अक्टूबर",
    ctaLabel: "अभी बुक करें", ctaType: "book",
    nextSlug: "udyog-sanjivani",
  },
  {
    slug: "udyog-sanjivani",
    step: "2", stage: "पुनर्जीवन",
    name: "उद्योग संजीवनी · पंचतत्त्व",
    meta: "90 दिन · 12 सत्र · 7 Offline + 5 Online · केवल 10 · + 30 दिन handholding",
    forWhom: "₹50 लाख–₹2 करोड़ · Business चल रहा है पर आप पर टिका है",
    price: "₹75,000",
    ctaLabel: "Diagnostic", ctaType: "diagnostic",
    nextSlug: "lgt",
  },
  {
    slug: "lgt",
    step: "3", stage: "रूपांतरण",
    name: "Life's Golden Triangle™",
    meta: "6 माह · 24 + 2 सत्र · आमने-सामने · वर्ष में केवल 20",
    forWhom: "₹2–15 करोड़ · धंधा, सेहत और घर — तीनों गहराई से",
    price: null, priceNote: "Diagnostic के बाद",
    ctaLabel: "आवेदन", ctaType: "apply",
    nextSlug: "practitioner",
  },
  {
    slug: "practitioner",
    step: "4", stage: "प्रमाणन",
    name: "LGT Practitioner",
    meta: "6 माह · हर शुक्रवार · केवल 8 · 60-40 साझेदारी",
    forWhom: "🔒 केवल Life's Golden Triangle graduates",
    price: null, priceNote: "आमंत्रण से",
    ctaLabel: null, ctaType: "none",
    locked: true,
  },
  {
    slug: "ram-nirvana",
    step: "🕉️", stage: "सिद्धि",
    name: "Ram Nirvana™",
    meta: "आश्रम — जहाँ लोग अपना त्रिकोण संतुलित करने आएँगे",
    forWhom: "2029 के बाद · अभी बिक्री नहीं",
    forLabel: "कब",
    price: null, priceNote: "दृष्टि",
    ctaLabel: "पढ़िए", ctaType: "read",
  },
];

export const sidePrograms: Course[] = [
  {
    slug: "sales-sanjivani",
    step: null, stage: null,
    name: "Sales संजीवनी",
    meta: "2 दिन · टीम के लिए · 60% अभ्यास",
    forWhom: "टीम की बिक्री",
    price: "₹6,000 से",
    ctaLabel: "Enquiry", ctaType: "enquiry",
    nextSlug: "udyog-sanjivani",
  },
  {
    slug: "leadership",
    step: null, stage: null,
    name: "Leadership the Srikrishna Way",
    meta: "1 दिन · Corporate · जनवरी 2027",
    forWhom: "संस्थाओं के लिए",
    price: null,
    ctaLabel: "Enquiry", ctaType: "enquiry",
  },
  {
    slug: "book",
    step: null, stage: null,
    name: "📕 Life's Golden Triangle — किताब + Workbook SET",
    meta: "दो भाग · Founder's Edition पहले 200 के लिए · विमोचन दशहरा",
    forWhom: "सबके लिए",
    price: "₹999",
    ctaLabel: "Pre-book", ctaType: "prebook",
  },
];

export const allCourses = [...ladder, ...sidePrograms];
export const getCourse = (slug: string) => allCourses.find((c) => c.slug === slug);

// Courses dropdown menu (grouped)
export const courseMenu = [
  {
    group: "शुरुआत",
    items: [
      { label: "Know Your Triangle", sub: "2 घंटे · निःशुल्क", href: "/know-your-triangle" },
      { label: "Golden Triangle Score", sub: "3 मिनट · online", href: "/score" },
      { label: "किताब + Workbook", sub: "₹999", href: "/book" },
    ],
  },
  {
    group: "दो दिन",
    items: [
      { label: "LOA through Ramayana", sub: "मन और संकल्प", href: "/loa" },
      { label: "Sales संजीवनी", sub: "टीम की बिक्री", href: "/sales-sanjivani" },
    ],
  },
  {
    group: "गहरा काम",
    items: [
      { label: "उद्योग संजीवनी", sub: "90 दिन · 10 लोग", href: "/udyog-sanjivani" },
      { label: "Life's Golden Triangle™", sub: "6 माह · 1:1", href: "/lgt" },
      { label: "LGT Practitioner", sub: "केवल graduates", href: "/practitioner" },
    ],
  },
  {
    group: "संस्थाओं के लिए",
    items: [
      { label: "Leadership the Srikrishna Way", sub: "Corporate · 1 दिन", href: "/leadership" },
    ],
  },
];