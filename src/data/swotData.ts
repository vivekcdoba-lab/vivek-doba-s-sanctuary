export interface SwotEntry {
  category: 'strength' | 'weakness' | 'opportunity' | 'threat';
  text: string;
}

export interface CompetitorAnalysis {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  opportunityForVDTS: string[];
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const vdtsSwot: SwotEntry[] = [
  // Strengths
  { category: 'strength', text: 'Unique LGT Framework (Dharma-Artha-Kama-Moksha)' },
  { category: 'strength', text: "Founder's deep spiritual & business dual expertise" },
  { category: 'strength', text: 'Husband-wife team (Business + Astrology combination)' },
  { category: 'strength', text: 'Strong Ramayana/Mahabharata based content differentiation' },
  { category: 'strength', text: 'Hinglish/Marathi language accessibility' },
  { category: 'strength', text: 'Experiential workshop methodology' },
  { category: 'strength', text: '180-day structured transformation program (LGT Platinum)' },
  { category: 'strength', text: 'Proprietary frameworks (K.S.H.A.M.A., R.A.M., T.A.T.H.A.S.T.U., etc.)' },
  { category: 'strength', text: 'Ram Nirvana Ashram vision (long-term purpose)' },
  // Weaknesses
  { category: 'weakness', text: 'Limited online presence currently' },
  { category: 'weakness', text: 'No mobile app (this project fixes it)' },
  { category: 'weakness', text: 'Small team capacity' },
  { category: 'weakness', text: 'Geographic focus (Pune-centric)' },
  { category: 'weakness', text: 'Premium pricing may limit mass market' },
  { category: 'weakness', text: 'No passive income products yet (courses, books published)' },
  { category: 'weakness', text: 'Technology adoption in early stages' },
  // Opportunities
  { category: 'opportunity', text: 'Growing spiritual wellness market in India' },
  { category: 'opportunity', text: 'Post-pandemic demand for life coaching' },
  { category: 'opportunity', text: 'YouTube/Instagram content expansion' },
  { category: 'opportunity', text: 'Corporate wellness programs' },
  { category: 'opportunity', text: 'Marathi market underserved' },
  { category: 'opportunity', text: 'Train-the-trainer model for scaling' },
  { category: 'opportunity', text: 'Book publication (LGT book in progress)' },
  { category: 'opportunity', text: 'Retreats & Residential programs' },
  { category: 'opportunity', text: 'International NRI market' },
  // Threats
  { category: 'threat', text: 'Established players (BK Shivani, Gaur Gopal Das followers)' },
  { category: 'threat', text: 'Free content abundance on YouTube' },
  { category: 'threat', text: 'Commoditization of coaching industry' },
  { category: 'threat', text: 'Economic downturn affecting premium purchases' },
  { category: 'threat', text: 'Copycats stealing frameworks' },
  { category: 'threat', text: 'Over-dependence on founder' },
];

export const competitors: CompetitorAnalysis[] = [
  {
    name: 'Mindvalley India',
    description: 'International personal growth platform with India presence',
    strengths: [
      'Global brand recognition',
      'High production quality content',
      'Celebrity instructors',
      'Massive course library',
      'Strong technology platform',
      'Community features',
    ],
    weaknesses: [
      'Western-centric content, less Indian culture',
      'Expensive subscription model',
      'No personalized coaching',
      'Not in Hindi/regional languages',
      'No Vedic/spiritual Indian frameworks',
    ],
    opportunityForVDTS: [
      'We offer personalized coaching vs their self-paced content',
      'We are deeply rooted in Indian spirituality',
      'We offer Hindi/Marathi accessibility',
    ],
    threatLevel: 'MEDIUM',
  },
  {
    name: 'Siddharth Rajsekar / Internet Lifestyle Hub',
    description: 'Digital coach training, info-product business',
    strengths: [
      'Large community (Freedom Business Model)',
      'Strong digital marketing',
      'Multiple programs at various price points',
      'Active YouTube presence',
      'Good funnel systems',
    ],
    weaknesses: [
      'Focus only on business/money, not holistic',
      'No spiritual depth',
      'Commoditized "make money online" space',
      'No transformation focus',
    ],
    opportunityForVDTS: [
      'We offer holistic transformation, not just business',
      'Our spiritual foundation is unique',
      'LGT covers all 4 Purusharthas, not just Artha',
    ],
    threatLevel: 'LOW',
  },
  {
    name: 'ICF Certified Coaches (General Market)',
    description: 'Individual certified life coaches in Pune/Mumbai',
    strengths: [
      'ICF certification credibility',
      'Established network',
      'Referral based steady business',
      'Structured coaching methodology',
    ],
    weaknesses: [
      'No unique framework (generic coaching)',
      'Western models (GROW, etc.)',
      'No cultural/spiritual integration',
      'Individual practitioners, not scalable',
      'No community/group programs',
    ],
    opportunityForVDTS: [
      'Our Indian framework stands out',
      'We combine coaching + workshops + community',
      'LGT is a complete life operating system',
    ],
    threatLevel: 'MEDIUM',
  },
  {
    name: 'BK Shivani / Brahma Kumaris',
    description: 'Spiritual movement with massive following',
    strengths: [
      'Huge brand and following',
      'Free content everywhere',
      'Strong meditation practice',
      'Trust and credibility',
      'Pan-India presence',
    ],
    weaknesses: [
      'Religious association may limit some audiences',
      'No business/Artha focus',
      'Group-only, no personalized coaching',
      'No structured program with outcome tracking',
      'Volunteer-based, inconsistent quality',
    ],
    opportunityForVDTS: [
      'We offer structured transformation with tracking',
      'We balance spiritual AND material (Artha)',
      'We are non-religious, universally spiritual',
      'Personal coaching attention',
    ],
    threatLevel: 'LOW',
  },
];
