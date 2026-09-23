export type Course = {
  slug: string;
  step: string | null;          // "0"–"4", "ॐ" for the summit, null for side programs
  stage: string | null;         // ladder stage name
  name: string;
  hook: string;                 // the emotional first line: the reader's own feeling, in their words
  outcome: string;              // ONE line: what their life looks like after
  duration: string;
  format: string;
  seats?: string;               // real seat limit only
  nextDate?: string;
  forWhom: string;
  notFor: string[];
  before: string[];             // "Today" — what they feel now
  after: string[];              // "After" — what changes
  journey: { title: string; text: string }[];   // the phases inside the program
  takeaways: string[];
  priceINR: number | null;      // base fee, excluding GST. null = do not show a price
  priceFrom?: boolean;          // shows "From ₹…"
  gstApplies: boolean;          // true = 18% GST added on top
  priceNote?: string;           // shown when priceINR is null
  cta: string;
  ctaType: "book" | "diagnostic" | "apply" | "enquiry" | "prebook" | "read" | "none";
  nextSlug?: string;
  locked?: boolean;
  videos: { youtubeId: string; name: string; business?: string }[];
};

export const GST_RATE = 0.18;
export const WHATSAPP_NUMBER = "919607050111";

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");
export const gstAmount = (n: number) => Math.round(n * GST_RATE);
export const totalWithGst = (n: number) => n + gstAmount(n);

export const whatsappLink = (courseName: string, diagnostic = false) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    diagnostic
      ? `Namaste, I would like to book a diagnostic call for ${courseName}.`
      : `Namaste, I would like to know more about ${courseName}.`
  )}`;

export const ladder: Course[] = [
  {
    slug: "know-your-triangle",
    step: "0", stage: "Discover",
    name: "Know Your Triangle",
    hook: "Something feels off, but you can’t quite name it.",
    outcome: "See your business, health and family on one score in just 2 hours.",
    duration: "2 hours", format: "Group session · Live Golden Triangle Score",
    forWhom: "Anyone who simply wants to explore first",
    notFor: ["People looking for a quick motivational talk"],
    before: ["You are busy every day, but unsure if you are moving forward", "One area of life keeps pulling the others down"],
    after: ["You know your Golden Triangle score", "You can see which side needs attention first"],
    journey: [],
    takeaways: ["Your personal Golden Triangle Score", "Clarity on your next step"],
    priceINR: 0, gstApplies: false,
    cta: "Book my free seat", ctaType: "book",
    nextSlug: "loa", videos: [],
  },
  {
    slug: "loa",
    step: "1", stage: "Resolve",
    name: "LOA through Ramayana",
    hook: "You know what you want. Something inside you keeps stopping you.",
    outcome: "Walk out with a clear mind and a resolve you can act on from Monday.",
    duration: "2 days", format: "Offline or Online · The Ram, Ravan, Sita and Hanuman within you",
    nextDate: "3–4 October",
    forWhom: "Those who feel stuck and want to begin from within",
    notFor: ["People who want someone else to change their life for them"],
    before: ["You start strong and lose steam", "Doubt and fear speak louder than your goals"],
    after: ["You recognise the Ravan inside you and how to face it", "You leave with a resolve that holds"],
    journey: [],
    takeaways: [],
    priceINR: 5999, priceFrom: true, gstApplies: true,
    cta: "Book my seat", ctaType: "book",
    nextSlug: "udyog-sanjivani", videos: [],
  },
  {
    slug: "udyog-sanjivani",
    step: "2", stage: "Revive",
    name: "Udyog Sanjivani · Panchatattva",
    hook: "Your business runs. But only when you are in the room.",
    outcome: "Build a business that keeps running, and growing, without depending on you.",
    duration: "90 days", format: "12 sessions: 7 offline + 5 online · Plus 30 days of handholding",
    seats: "Only 10 business owners per batch",
    forWhom: "Business owners at ₹50 lakh–₹2 crore whose business still depends entirely on them",
    notFor: ["Businesses that have not started yet", "Owners who are not willing to let go of control"],
    before: ["Every decision waits for you", "A holiday feels impossible", "Growth has stalled"],
    after: ["Your team runs the day-to-day", "You finally work on the business, not in it"],
    journey: [],
    takeaways: [],
    priceINR: 75000, gstApplies: true,
    cta: "Book a diagnostic", ctaType: "diagnostic",
    nextSlug: "lgt", videos: [],
  },
  {
    slug: "lgt",
    step: "3", stage: "Transform",
    name: "Life’s Golden Triangle",
    hook: "The business grew. Your health and your home paid the price.",
    outcome: "Bring business, health and family into balance, deeply and together.",
    duration: "6 months", format: "24 + 2 sessions · Face to face, one to one",
    seats: "Only 20 people a year",
    forWhom: "Business owners at ₹2–15 crore ready to work on business, health and family together",
    notFor: ["Anyone looking for a shortcut", "Anyone not ready for honest one-to-one work"],
    before: ["Success on paper, emptiness at home", "Your body is warning you"],
    after: ["All three sides of your life support each other"],
    journey: [],
    takeaways: [],
    priceINR: null, gstApplies: true, priceNote: "Fee shared after your diagnostic call",
    cta: "Apply now", ctaType: "apply",
    nextSlug: "practitioner", videos: [],
  },
  {
    slug: "practitioner",
    step: "4", stage: "Certify",
    name: "(Train the Trainer) LGT Practitioner",
    hook: "You lived the transformation. Now you want to carry it to others.",
    outcome: "Become certified to guide others through Life’s Golden Triangle.",
    duration: "6 months", format: "Every Friday · 60–40 partnership",
    seats: "Only 8 practitioners",
    forWhom: "Graduates of Life’s Golden Triangle only",
    notFor: ["Anyone who has not completed Life’s Golden Triangle"],
    before: [], after: [], journey: [], takeaways: [],
    priceINR: null, gstApplies: true, priceNote: "By invitation",
    cta: "Graduates only", ctaType: "none", locked: true, videos: [],
  },
  {
    slug: "ram-nirvana",
    step: "ॐ", stage: "The summit",
    name: "Ram Nirvana™",
    hook: "A place to come home to yourself.",
    outcome: "An ashram where people come to bring their triangle into balance.",
    duration: "After 2029", format: "A vision, not open for enrollment",
    forWhom: "A future home for everyone who walks this path",
    notFor: [], before: [], after: [], journey: [], takeaways: [],
    priceINR: null, gstApplies: false, priceNote: "A vision",
    cta: "Read the vision", ctaType: "read", videos: [],
  },
];

export const sidePrograms: Course[] = [
  {
    slug: "sales-sanjivani",
    step: null, stage: "For teams",
    name: "Sales Sanjivani",
    hook: "Your team sells when you push, and stops when you don’t.",
    outcome: "A sales team that sells with confidence, built through real practice.",
    duration: "1 day", format: "For sales teams · 60% hands-on practice",
    forWhom: "Business owners who want their sales team to perform without them",
    notFor: [], before: [], after: [], journey: [], takeaways: [],
    priceINR: 6000, priceFrom: true, gstApplies: true,
    cta: "Enquire", ctaType: "enquiry", nextSlug: "udyog-sanjivani", videos: [],
  },
  {
    slug: "leadership",
    step: null, stage: "For organisations",
    name: "Leadership the Srikrishna Way",
    hook: "Calm at the centre of the battlefield.",
    outcome: "Leaders who stay clear and steady when pressure rises.",
    duration: "1 day", format: "Corporate program · Starting January 2027",
    forWhom: "Organisations developing their leadership teams",
    notFor: [], before: [], after: [], journey: [], takeaways: [],
    priceINR: null, gstApplies: true, priceNote: "Fee on proposal",
    cta: "Enquire", ctaType: "enquiry", videos: [],
  },
  {
    slug: "book",
    step: null, stage: "For readers",
    name: "Life’s Golden Triangle: Book + Workbook set",
    hook: "The whole philosophy, in your hands.",
    outcome: "Read it, then work through it, one page at a time.",
    duration: "Two volumes", format: "Founder’s Edition for the first 200 · Launching on Dussehra",
    forWhom: "Anyone who wants to begin at home",
    notFor: [], before: [], after: [], journey: [], takeaways: [],
    priceINR: 999, gstApplies: false,
    cta: "Pre-book", ctaType: "prebook", videos: [],
  },
];

export const allCourses = [...ladder, ...sidePrograms];
export const getCourse = (slug: string) => allCourses.find((c) => c.slug === slug);
