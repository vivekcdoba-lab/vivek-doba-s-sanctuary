import { useState, useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

// ══════════════════════════════════════════════════════════
// LGT — Life's Golden Triangle Assessment
// 28 Questions · 4 Sections · Score 1-5 each · Total /140
// Sections: Dharma (Foundation), Kama (Engine), Artha (Fuel), Soul Stability
// ══════════════════════════════════════════════════════════

const PILLAR_COLORS = {
  dharma: '#9B2335',
  kama: '#5B2D8E',
  artha: '#1B4F72',
  soul: '#1A6B3A',
};

interface LGTQuestion {
  id: number;
  en: string;
  mr: string;
  hint?: string;
}

interface LGTSection {
  key: 'dharma' | 'kama' | 'artha' | 'soul';
  name: string;
  nameEn: string;
  subtitle: string;
  subtitleMr: string;
  emoji: string;
  color: string;
  maxScore: 35;
  insight: { en: string; mr: string };
  questions: LGTQuestion[];
}

const LGT_SECTIONS: LGTSection[] = [
  {
    key: 'dharma', name: 'DHARMA', nameEn: 'The Foundation', subtitle: 'Health, Mindset & Time',
    subtitleMr: 'पाया — आरोग्य, मनस्थिती आणि वेळ', emoji: '🔥', color: PILLAR_COLORS.dharma, maxScore: 35,
    insight: { en: 'Your body is your first business. Fix energy first — everything else follows.', mr: 'तुमचे शरीर हा तुमचा पहिला व्यवसाय आहे. प्रथम उर्जा दुरुस्त करा — बाकी सर्व आपोआप होईल.' },
    questions: [
      { id: 1, en: 'Bio-Energy: Do you wake with explosive energy — without tea or coffee?', mr: 'जैव-उर्जा: सकाळी उठताना चहा किंवा कॉफी शिवाय तुम्हाला पुरेपूर उत्साह वाटतो का?' },
      { id: 2, en: 'Gut Instinct: Do you eat according to hunger (Gut) — not taste (Greed)?', mr: 'आतड्याची आज्ञा: तुम्ही भुकेनुसार जेवता, की जिभेच्या लालसेनुसार?' },
      { id: 3, en: 'Time Mastery: Do you run your day — or does the day run you?', mr: 'वेळ नियंत्रण: तुम्ही दिवसाचे मालक आहात, की दिवस तुम्हाला ओढत नेतो?' },
      { id: 4, en: 'Reaction Logic: In a crisis — first response: Calm (Vishnu) or Anger (Ravana)?', mr: 'प्रतिक्रिया तर्क: संकटात पहिली प्रतिक्रिया शांत विचार असते, की चिडचिड?' },
      { id: 5, en: 'Sleep Quality: Do you get 6-8 hours of deep, peaceful sleep — every night?', mr: 'झोपेचा दर्जा: तुम्हाला दररोज ६ ते ८ तास शांत, गाढ झोप मिळते का?' },
      { id: 6, en: 'Solitude: Do you spend 20 mins daily in silence — connecting with your Soul?', mr: 'एकांत: दररोज किमान २० मिनिटे तुम्ही मौनात स्वतःच्या आत्म्याशी संवाद साधता का?' },
      { id: 7, en: 'Medical Stats: Are Sugar, BP and Weight in range — without heavy medication?', mr: 'वैद्यकीय स्थिती: तुमचे रक्तशर्करा, रक्तदाब आणि वजन औषधांशिवाय नियंत्रणात आहे का?' },
    ],
  },
  {
    key: 'kama', name: 'KAMA', nameEn: 'The Engine', subtitle: 'Relationships, Team & Desire',
    subtitleMr: 'इंजिन — नातेसंबंध, टीम आणि इच्छाशक्ती', emoji: '💜', color: PILLAR_COLORS.kama, maxScore: 35,
    insight: { en: 'Your relationships are your real net worth. Vision attracts loyalty. Fear only creates resignation.', mr: 'तुमचे नातेसंबंध हीच तुमची खरी संपत्ती आहे. दृष्टी निष्ठा आकर्षित करते. भय केवळ राजीनामा निर्माण करतो.' },
    questions: [
      { id: 8, en: 'Home Presence: Does your family see a Loving Father — or a Stressed Boss?', mr: 'घरची उपस्थिती: घरात आल्यावर कुटुंब प्रेमळ बाबा पाहते, की ताणग्रस्त बॉस?' },
      { id: 9, en: 'Team Loyalty: Does your team work for Vision and Trust — or Salary and Fear?', mr: 'टीम निष्ठा: टीम स्वप्न आणि विश्वासासाठी काम करते, की केवळ पगार आणि भयासाठी?' },
      { id: 10, en: 'Desire Clarity: Is your Big Dream written down clearly — in your own words?', mr: 'इच्छा स्पष्टता: तुमचे मोठे स्वप्न स्पष्टपणे कागदावर लिहिले आहे का?' },
      { id: 11, en: 'Conflict Resolution: Do you aim to Win the Argument — or Win the Relationship?', mr: 'संघर्ष निवारण: तुम्हाला वाद जिंकायचा असतो, की नाते जपायचे असते?' },
      { id: 12, en: 'Network Strength: If you lost everything — 5 people who would still fund you?', mr: 'नेटवर्क शक्ती: सर्व काही गमावले तरी तुमच्यावर पैसे लावणारे ५ लोक आहेत का?' },
      { id: 13, en: 'Joy & Celebration: Do you celebrate small wins — or only worry about next target?', mr: 'आनंद आणि उत्सव: तुम्ही लहान यशाचा आनंद साजरा करता, की पुढील लक्ष्याची काळजी करता?' },
      { id: 14, en: 'Runanubandh: Do you treat partners with sacred respect — or just as transactions?', mr: 'ऋणानुबंध: भागीदारांशी आदराने वागता, की केवळ व्यावसायिक व्यवहार करता?' },
    ],
  },
  {
    key: 'artha', name: 'ARTHA', nameEn: 'The Fuel', subtitle: 'Money, Business & Legacy',
    subtitleMr: 'इंधन — पैसा, व्यवसाय आणि वारसा', emoji: '💎', color: PILLAR_COLORS.artha, maxScore: 35,
    insight: { en: '15/10/5 Rule: Assets / Soul-joy / Donation — every month. Business must run without you.', mr: 'दरमहा १५% संपत्ती, १०% आत्मआनंद, ५% दान — हा सुवर्ण नियम पाळा. व्यवसाय तुमच्याशिवाय चालायला हवा.' },
    questions: [
      { id: 15, en: 'Cash Flow: Is your income consistent — or feast-and-famine roller coaster?', mr: 'रोख प्रवाह: तुमचे उत्पन्न स्थिर आहे, की कधी भरपूर आणि कधी खडखडाट असे चढउतार आहेत?' },
      { id: 16, en: 'Golden Split: 15% Assets / 10% Soul-joy / 5% Donation — every month?', mr: 'सुवर्ण विभागणी: दरमहा १५% संपत्ती, १०% आत्मआनंद, ५% दान या नियमाचे पालन करता का?' },
      { id: 17, en: 'Business Autonomy: Can business run profitably for 15 days — without you?', mr: 'व्यवसाय स्वायत्तता: तुम्ही १५ दिवस सुट्टीवर गेलात तरी व्यवसाय नफ्यात चालेल का?' },
      { id: 18, en: 'Service Mindset: Are you truly solving a problem — or just selling a product?', mr: 'सेवा मानसिकता: तुम्ही खऱ्या अर्थाने लोकांची समस्या सोडवता, की केवळ वस्तू विकता?' },
      { id: 19, en: 'Debt Control: Is your debt fuelling healthy growth — or stealing your sleep?', mr: 'कर्ज नियंत्रण: तुमचे कर्ज प्रगतीसाठी आहे, की ते तुमची झोप उडवत आहे?' },
      { id: 20, en: 'Innovation: Are you upgrading your business every year — or repeating old methods?', mr: 'नवनिर्मिती: तुम्ही दरवर्षी व्यवसायात नवीन काहीतरी आणता, की तेच जुने काम करत राहता?' },
      { id: 21, en: 'Legacy Building: Building a brand that will outlive you — Tata-style legacy?', mr: 'वारसा निर्मिती: टाटांप्रमाणे असा ब्रँड बांधत आहात, जो तुमच्यानंतरही टिकेल?' },
    ],
  },
  {
    key: 'soul', name: 'SOUL STABILITY', nameEn: 'Balancing Life\'s Golden Triangle', subtitle: 'Flow, Integration & Legacy',
    subtitleMr: 'जीवनाचा सुवर्ण त्रिकोण संतुलित करणे', emoji: '⚖️', color: PILLAR_COLORS.soul, maxScore: 35,
    insight: { en: 'Soul Stability = Dharma + Kama + Artha in perfect harmony. The equilateral state is the highest human operating system.', mr: 'आत्मस्थिरता म्हणजे धर्म, काम आणि अर्थ यांचे परिपूर्ण संतुलन. समभुज त्रिकोण ही मानवाची सर्वोच्च अवस्था आहे.' },
    questions: [
      { id: 22, en: 'Flow State: Days when work, joy, and purpose feel effortlessly unified?', mr: 'प्रवाह अवस्था: असे दिवस येतात का जेव्हा काम, आनंद आणि उद्देश सहजपणे एकत्र वाटतात?' },
      { id: 23, en: 'Decision Integrity: Major decisions — soul, family and business all agree?', mr: 'निर्णय सचोटी: मोठे निर्णय घेताना आत्मा, कुटुंब आणि व्यवसाय — तिन्ही एकमत असतात का?' },
      { id: 24, en: 'Guilt-Free Living: Choose rest or family — without guilt about your business?', mr: 'निर्दोष जगणे: विश्रांती किंवा कुटुंब निवडताना व्यवसायाबद्दल अपराधी भावना येत नाही का?' },
      { id: 25, en: 'Soul Satisfaction: Week\'s end — deep fulfilment, not just task completion?', mr: 'आत्मतृप्ती: आठवड्याच्या शेवटी खऱ्या अर्थाने आत्मतृप्ती जाणवते, केवळ कामपूर्ती नाही?' },
      { id: 26, en: 'Legacy Consciousness: Daily decisions reflect a 100-year legacy vision?', mr: 'वारसा जाणीव: दैनंदिन निर्णय शंभर वर्षांच्या वारसाची जाणीव ठेवून घेतले जातात का?' },
      { id: 27, en: 'Triangle Awareness: Clearly identify which pillar drains your energy most today?', mr: 'त्रिकोण जाणीव: आज कोणत्या स्तंभातून सर्वाधिक उर्जा खर्च होतेय हे ओळखू शकता का?' },
      { id: 28, en: 'Mentorship: Actively guiding someone — who will grow beyond even you?', mr: 'मार्गदर्शन: अशा कोणाला मार्गदर्शन करता, जो पुढे तुमच्यापेक्षाही मोठा होईल?' },
    ],
  },
];

const LGT_ZONES = [
  { min: 0, max: 23, rank: 'WORST', rankMr: 'अत्यंत वाईट', name: 'Collapsed Soul', nameMr: 'पडलेला आत्मा', color: '#8B0000', action: 'Emergency Reset', actionMr: 'आणीबाणी पुनर्रचना',
    diag: 'Your triangle has completely collapsed. You are surviving, not truly living. Stop everything. Fix Dharma first — sleep, silence, breath.',
    diagMr: 'तुमचा त्रिकोण पूर्णपणे कोसळला आहे. तुम्ही जगत नाही, फक्त टिकून आहात. सर्व काही थांबवा. आधी धर्म दुरुस्त करा.',
    months: [
      { focus: 'DHARMA — EMERGENCY', detail: 'Sleep 8 hrs. 20-min silence daily. No screens after 10 PM.', detailMr: '८ तास झोप. दररोज २० मिनिटे मौन. रात्री १० नंतर स्क्रीन बंद.' },
      { focus: 'KAMA — RECONNECT', detail: 'Repair top 3 relationships. Express gratitude daily.', detailMr: 'सर्वात महत्वाची ३ नाती दुरुस्त करा. दररोज कृतज्ञता व्यक्त करा.' },
      { focus: 'ARTHA — STABILIZE', detail: 'Track all expenses. Stop bleeding. Build emergency fund.', detailMr: 'सर्व खर्च लिहा. रक्तस्राव थांबवा. आणीबाणी निधी तयार करा.' },
    ]},
  { min: 24, max: 46, rank: 'BAD', rankMr: 'वाईट', name: 'Drowning Achiever', nameMr: 'बुडणारा यशस्वी', color: '#C0392B', action: 'Critical Repair', actionMr: 'गंभीर दुरुस्ती',
    diag: 'You are driving a Ferrari on a flat tire. The engine exists — but the foundation is gone. Stop expanding. Repair your most depleted pillar.',
    diagMr: 'तुम्ही पंक्चर टायरवर फेरारी चालवत आहात. इंजिन आहे — पण पाया गेला. विस्तार थांबवा. आधी सर्वात क्षीण स्तंभ दुरुस्त करा.',
    months: [
      { focus: 'DHARMA — FOUNDATION', detail: '20-min Chetana daily. Restore bio-energy. Sleep discipline.', detailMr: 'दररोज २० मिनिटे चेतना. उर्जा पुनर्स्थापित करा. झोपेचे शिस्त.' },
      { focus: 'KAMA — DELEGATION', detail: 'Build second-line leader. Stop doing employee-level work.', detailMr: 'दुसऱ्या फळीचा नेता तयार करा. कर्मचाऱ्याचे काम सोडा.' },
      { focus: 'ARTHA — SYSTEMS', detail: 'Apply 15/10/5 Golden Split Rule. Create SOPs.', detailMr: '१५/१०/५ सुवर्ण नियम पाळा. SOP तयार करा.' },
    ]},
  { min: 47, max: 69, rank: 'AVERAGE', rankMr: 'सामान्य', name: 'Comfortable Sleepwalker', nameMr: 'आरामदायी स्वप्नदृष्टा', color: '#7D6608', action: 'Wake Up', actionMr: 'जागे व्हा',
    diag: 'You are not failing — you are settling. Comfort has become your cage. You have the potential for 10X but are operating at 2X. Wake up.',
    diagMr: 'तुम्ही अपयशी नाही — तुम्ही समाधानी झाला आहात. आराम हा तुमचा पिंजरा बनला आहे. १०X ची क्षमता आहे पण २X वर काम करत आहात.',
    months: [
      { focus: 'DHARMA — DISCIPLINE', detail: 'Morning routine. Exercise 30 min. Meditation 20 min.', detailMr: 'सकाळचा नियम. ३० मिनिटे व्यायाम. २० मिनिटे ध्यान.' },
      { focus: 'KAMA — VISION', detail: 'Write 10-year vision. Share with family. Build accountability.', detailMr: '१० वर्षांचे स्वप्न लिहा. कुटुंबाशी शेअर करा. जबाबदारी तयार करा.' },
      { focus: 'ARTHA — EXPANSION', detail: 'Invest in 10X marketing. Hire strategically. Scale up.', detailMr: '१०X विपणनात गुंतवणूक. धोरणात्मक भरती. विस्तार करा.' },
    ]},
  { min: 70, max: 92, rank: 'GOOD', rankMr: 'चांगले', name: 'Awakened Builder', nameMr: 'जागृत निर्माता', color: '#1A6A35', action: 'Find Constraint', actionMr: 'छुपा अडथळा शोधा',
    diag: 'You are doing well — but there is a hidden constraint preventing your next breakthrough. One pillar is silently pulling the others down. Find it.',
    diagMr: 'तुम्ही चांगले करत आहात — पण एक छुपा अडथळा पुढच्या यशापासून रोखत आहे. एक स्तंभ शांतपणे बाकीच्यांना खाली ओढत आहे.',
    months: [
      { focus: 'DHARMA — OPTIMIZE', detail: 'Advanced meditation. Ayurvedic routine. Peak performance.', detailMr: 'प्रगत ध्यान. आयुर्वेदिक दिनचर्या. शिखर कामगिरी.' },
      { focus: 'KAMA — DEEPEN', detail: 'Quality time rituals. Mentor 2 people. Build inner circle.', detailMr: 'गुणवत्ता वेळेचे नियम. २ लोकांना मार्गदर्शन. आंतरिक वर्तुळ बनवा.' },
      { focus: 'ARTHA — MULTIPLY', detail: 'Multiple income streams. Passive income. Invest in assets.', detailMr: 'अनेक उत्पन्न स्रोत. निष्क्रिय उत्पन्न. संपत्तीत गुंतवणूक.' },
    ]},
  { min: 93, max: 116, rank: 'BETTER', rankMr: 'उत्तम', name: 'Integrated Leader', nameMr: 'एकात्म नेता', color: '#1A5276', action: 'Expand Impact', actionMr: 'प्रभाव वाढवा',
    diag: 'You are rare. Most people never reach this zone. Your triangle is strong. Now expand your circle of influence. Build systems that outlive you.',
    diagMr: 'तुम्ही दुर्मिळ आहात. बहुतेक लोक या झोनपर्यंत कधीच पोहोचत नाहीत. आता प्रभाव वर्तुळ वाढवा. तुमच्यानंतरही टिकणाऱ्या प्रणाली बनवा.',
    months: [
      { focus: 'DHARMA — MASTERY', detail: 'Teach what you know. Write your philosophy. Spiritual depth.', detailMr: 'जे जाणता ते शिकवा. तत्वज्ञान लिहा. आध्यात्मिक खोली.' },
      { focus: 'KAMA — LEGACY TEAM', detail: 'Build leadership pipeline. Create succession plan.', detailMr: 'नेतृत्व पाइपलाइन बनवा. उत्तराधिकार योजना तयार करा.' },
      { focus: 'ARTHA — GENERATIONAL', detail: 'Family office structure. Cross-generational wealth.', detailMr: 'कौटुंबिक कार्यालय रचना. पिढ्यानपिढ्या संपत्ती.' },
    ]},
  { min: 117, max: 140, rank: 'BEST', rankMr: 'सर्वोत्तम', name: 'Luminous Legacy', nameMr: 'प्रकाशमय वारसा', color: '#B5860A', action: 'Become the Light', actionMr: 'प्रकाश व्हा',
    diag: 'You have achieved what most dream of. Your triangle is nearly equilateral. You are ready to become a Guru yourself — transmit wisdom, build a school of thought.',
    diagMr: 'तुम्ही ते साध्य केले जे बहुतेक लोक स्वप्न पाहतात. तुमचा त्रिकोण जवळजवळ समभुज आहे. आता स्वतः गुरू बना — ज्ञान प्रसारित करा.',
    months: [
      { focus: 'DHARMA — TRANSMIT', detail: 'Create your teaching. Mentor the next generation.', detailMr: 'तुमचे शिक्षण तयार करा. पुढच्या पिढीला मार्गदर्शन करा.' },
      { focus: 'KAMA — SCHOOL', detail: 'Build a community. Create your own ashram/academy.', detailMr: 'समुदाय बनवा. तुमची स्वतःची अकादमी तयार करा.' },
      { focus: 'ARTHA — ETERNAL', detail: 'Endowment fund. Philanthropy. Impact investing.', detailMr: 'बंदोबस्ती निधी. परोपकार. प्रभाव गुंतवणूक.' },
    ]},
];

function getZone(total: number) {
  return LGT_ZONES.find(z => total >= z.min && total <= z.max) || LGT_ZONES[0];
}

function getPillarZone(score: number) {
  if (score <= 7) return { label: 'Worst', color: '#8B0000' };
  if (score <= 13) return { label: 'Bad', color: '#C0392B' };
  if (score <= 20) return { label: 'Average', color: '#7D6608' };
  if (score <= 26) return { label: 'Good', color: '#1A6A35' };
  if (score <= 33) return { label: 'Better', color: '#1A5276' };
  return { label: 'Best', color: '#B5860A' };
}

interface Props {
  onClose: () => void;
  onSave?: (scores: number[], sectionScores: Record<string, number>) => void;
  readOnly?: boolean;
  initialScores?: number[];
}

const LGTAssessment = ({ onClose, onSave, readOnly = false, initialScores }: Props) => {
  const [scores, setScores] = useState<number[]>(initialScores || new Array(28).fill(3));
  const [activeSection, setActiveSection] = useState(0);
  const [showResults, setShowResults] = useState(!!initialScores);

  const analysis = useMemo(() => {
    const sectionScores: Record<string, number> = {};
    LGT_SECTIONS.forEach((sec, si) => {
      sectionScores[sec.key] = scores.slice(si * 7, si * 7 + 7).reduce((a, b) => a + b, 0);
    });
    const grandTotal = Object.values(sectionScores).reduce((a, b) => a + b, 0);
    const coreTotal = sectionScores.dharma + sectionScores.kama + sectionScores.artha;
    const zone = getZone(grandTotal);
    const balance = Math.round(
      100 - (Math.max(...Object.values(sectionScores)) - Math.min(...Object.values(sectionScores))) / 35 * 100
    );
    const weakest = Object.entries(sectionScores).reduce((a, b) => a[1] < b[1] ? a : b);
    const strongest = Object.entries(sectionScores).reduce((a, b) => a[1] > b[1] ? a : b);
    return { sectionScores, grandTotal, coreTotal, zone, balance, weakest, strongest };
  }, [scores]);

  const radarData = LGT_SECTIONS.map(sec => ({
    name: sec.name,
    score: analysis.sectionScores[sec.key],
    fullMark: 35,
  }));

  const handleScore = (qIndex: number, value: number) => {
    if (readOnly) return;
    const next = [...scores];
    next[qIndex] = value;
    setScores(next);
  };

  const handleAnalyze = () => setShowResults(true);

  const handleSave = () => {
    onSave?.(scores, analysis.sectionScores);
    onClose();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            🔺 Life's Golden Triangle Test
          </h2>
          <p className="text-xs text-muted-foreground">जीवनाचा सुवर्ण त्रिकोण परीक्षा · 28 Questions · Score 1-5</p>
        </div>
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">✕ Close</button>
      </div>

      {/* 3 Pillars + Soul Banner */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { name: 'Dharma', mr: 'धर्म · पाया', color: PILLAR_COLORS.dharma },
          { name: 'Kama', mr: 'काम · इंजिन', color: PILLAR_COLORS.kama },
          { name: 'Artha', mr: 'अर्थ · इंधन', color: PILLAR_COLORS.artha },
        ].map(p => (
          <div key={p.name} className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-sm font-bold" style={{ color: p.color }}>{p.name}</p>
            <p className="text-[10px] text-muted-foreground">{p.mr}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-3 text-center text-white text-sm font-semibold" style={{ background: PILLAR_COLORS.soul }}>
        Section 4: Soul Stability — Balancing Life's Golden Triangle
        <span className="block text-[10px] opacity-70">आत्मस्थिरता परीक्षा — जीवनाचा सुवर्ण त्रिकोण संतुलित करणे</span>
      </div>

      {/* Section Tabs */}
      {!showResults && (
        <>
          <div className="flex gap-1 overflow-x-auto">
            {LGT_SECTIONS.map((sec, i) => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(i)}
                className={`flex-1 min-w-0 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeSection === i ? 'text-white shadow-lg' : 'bg-muted text-muted-foreground'
                }`}
                style={activeSection === i ? { backgroundColor: sec.color } : undefined}
              >
                {sec.emoji} {sec.name}
                <span className="block text-[9px] font-normal opacity-70">{analysis.sectionScores[sec.key]}/35</span>
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: LGT_SECTIONS[activeSection].color }}>
                {activeSection + 1}
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: LGT_SECTIONS[activeSection].color }}>
                  {LGT_SECTIONS[activeSection].name}
                </h3>
                <p className="text-xs text-muted-foreground">{LGT_SECTIONS[activeSection].subtitle}</p>
                <p className="text-[10px] text-muted-foreground">{LGT_SECTIONS[activeSection].subtitleMr}</p>
              </div>
              <div className="ml-auto text-center border-2 rounded-lg px-3 py-2" style={{ borderColor: LGT_SECTIONS[activeSection].color }}>
                <p className="text-[9px] font-bold tracking-wider" style={{ color: '#B5860A' }}>YOUR SCORE</p>
                <p className="text-2xl font-black" style={{ color: LGT_SECTIONS[activeSection].color }}>
                  {analysis.sectionScores[LGT_SECTIONS[activeSection].key]}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 35</p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mb-3">1 = Poor/Never · 2 = Rarely · 3 = Sometimes · 4 = Often · 5 = Excellent/Always</p>

            <div className="space-y-1">
              {LGT_SECTIONS[activeSection].questions.map((q, qi) => {
                const globalIndex = activeSection * 7 + qi;
                return (
                  <div key={q.id} className="flex items-start gap-2 py-3 border-b border-border last:border-b-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: LGT_SECTIONS[activeSection].color }}>
                      {q.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">{q.en}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{q.mr}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button
                          key={v}
                          onClick={() => handleScore(globalIndex, v)}
                          disabled={readOnly}
                          className={`w-8 h-8 rounded-lg border-2 text-xs font-bold transition-all ${
                            scores[globalIndex] === v
                              ? 'text-white scale-110 shadow-md'
                              : 'bg-card text-muted-foreground hover:scale-105'
                          }`}
                          style={{
                            borderColor: LGT_SECTIONS[activeSection].color,
                            backgroundColor: scores[globalIndex] === v ? LGT_SECTIONS[activeSection].color : undefined,
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight */}
            <div className="mt-4 p-3 rounded-lg border-l-4" style={{ borderColor: '#B5860A', background: 'rgba(181,134,10,0.05)' }}>
              <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: '#B5860A' }}>KEY INSIGHT · मुख्य अंतर्दृष्टी</p>
              <p className="text-xs text-foreground italic">{LGT_SECTIONS[activeSection].insight.en}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{LGT_SECTIONS[activeSection].insight.mr}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {activeSection > 0 && (
              <button onClick={() => setActiveSection(activeSection - 1)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground">
                ← Previous
              </button>
            )}
            {activeSection < 3 ? (
              <button onClick={() => setActiveSection(activeSection + 1)} className="flex-1 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: LGT_SECTIONS[activeSection + 1].color }}>
                Next: {LGT_SECTIONS[activeSection + 1].name} →
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                className="flex-1 py-4 rounded-xl text-base font-bold tracking-wider transition-all hover:scale-[1.02] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0D1B3E, #162758)', color: '#D4A843', border: '2px solid #D4A843' }}
              >
                🔱 ANALYZE MY LGT SCORE 🔱
              </button>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════
         RESULTS
      ═══════════════════════════════════════ */}
      {showResults && (
        <div className="space-y-5 animate-fade-up">
          {/* Grand Total + Zone */}
          <div className="rounded-xl p-5 text-center text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${analysis.zone.color}DD, ${analysis.zone.color}88)` }}>
            <p className="text-[10px] font-bold tracking-widest opacity-80 mb-1">YOUR LIFE'S GOLDEN TRIANGLE SCORE</p>
            <p className="text-5xl font-black">{analysis.grandTotal}<span className="text-lg opacity-50">/140</span></p>
            <p className="text-sm font-bold mt-1">{analysis.zone.rank} — {analysis.zone.name}</p>
            <p className="text-xs opacity-70">{analysis.zone.rankMr} — {analysis.zone.nameMr}</p>
            <div className="mt-3 flex justify-center gap-4 text-xs opacity-80">
              <span>Core: {analysis.coreTotal}/105</span>
              <span>Soul: {analysis.sectionScores.soul}/35</span>
              <span>Balance: {analysis.balance}%</span>
            </div>
          </div>

          {/* 4 Pillar Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LGT_SECTIONS.map(sec => {
              const score = analysis.sectionScores[sec.key];
              const pz = getPillarZone(score);
              return (
                <div key={sec.key} className="bg-card rounded-xl p-4 border border-border text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: sec.color }} />
                  <span className="text-lg">{sec.emoji}</span>
                  <p className="text-xs font-bold mt-1" style={{ color: sec.color }}>{sec.name}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: sec.color }}>{score}</p>
                  <p className="text-[10px] text-muted-foreground">/ 35</p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${(score / 35) * 100}%`, backgroundColor: sec.color }} />
                  </div>
                  <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded border" style={{ color: pz.color, borderColor: pz.color }}>
                    {pz.label.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Triangle + Zone Table */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Radar */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-sm font-bold text-foreground mb-2">🔺 Your LGT Triangle</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <Radar dataKey="score" stroke="#B5860A" fill="#B5860A" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-sm font-bold text-foreground mb-2">📊 Pillar Comparison</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LGT_SECTIONS.map(s => ({ name: s.name, score: analysis.sectionScores[s.key], color: s.color }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 35]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {LGT_SECTIONS.map((s, i) => (
                        <Cell key={i} fill={s.color + 'CC'} stroke={s.color} strokeWidth={1.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Zone Guide */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-3">🎯 Zone Classification (out of 140)</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
              {LGT_ZONES.map(z => (
                <div
                  key={z.rank}
                  className={`rounded-lg p-2 text-center text-white text-[10px] ${analysis.grandTotal >= z.min && analysis.grandTotal <= z.max ? 'ring-2 ring-offset-2 ring-primary scale-105' : 'opacity-60'}`}
                  style={{ backgroundColor: z.color }}
                >
                  <p className="font-bold">{z.rank}</p>
                  <p className="opacity-80">{z.min}–{z.max}</p>
                  <p className="text-[8px] opacity-70 mt-0.5">{z.nameMr}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="rounded-xl p-5 border-l-4" style={{ borderColor: '#B5860A', background: 'rgba(181,134,10,0.05)' }}>
            <p className="text-[9px] font-bold tracking-widest mb-2" style={{ color: '#B5860A' }}>PERSONAL DIAGNOSIS · वैयक्तिक निदान</p>
            <p className="text-sm italic text-foreground leading-relaxed">"{analysis.zone.diag}"</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">"{analysis.zone.diagMr}"</p>
          </div>

          {/* 6-Month Roadmap (displayed as 3-month protocol × 2 cycles) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground text-center">
              ◆ THE VISHNU PROTOCOL — 6-Month Roadmap to Soul Stability ◆
            </h3>
            <p className="text-xs text-muted-foreground text-center">विष्णू प्रोटोकॉल — ६ महिने आत्मस्थिरतेचा रोडमॅप</p>
            <div className="grid md:grid-cols-3 gap-3">
              {analysis.zone.months.map((m, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: LGT_SECTIONS[i].color }} />
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground mb-1">MONTH {i + 1} · महिना {i + 1}</p>
                  <p className="text-sm font-bold mb-2" style={{ color: LGT_SECTIONS[i].color }}>{m.focus}</p>
                  <p className="text-xs text-foreground italic leading-relaxed">{m.detail}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{m.detailMr}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { focus: 'MONTH 4 — CONSOLIDATE', detail: 'Review progress. Strengthen weakest pillar. Deepen daily rituals.', detailMr: 'प्रगतीचा आढावा. सर्वात कमकुवत स्तंभ मजबूत करा. दैनंदिन संस्कार गहन करा.' },
                { focus: 'MONTH 5 — ACCELERATE', detail: 'Push all 3 pillars simultaneously. Build sustainable momentum.', detailMr: 'तिन्ही स्तंभ एकाच वेळी वाढवा. टिकाऊ गती तयार करा.' },
                { focus: 'MONTH 6 — SOUL STABILITY', detail: 'LGT Retest. Measure transformation. Plan next phase.', detailMr: 'LGT पुन्हा परीक्षा. परिवर्तन मोजा. पुढच्या टप्प्याची योजना.' },
              ].map((m, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#B5860A' }} />
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground mb-1">MONTH {i + 4} · महिना {i + 4}</p>
                  <p className="text-sm font-bold mb-2" style={{ color: '#B5860A' }}>{m.focus}</p>
                  <p className="text-xs text-foreground italic leading-relaxed">{m.detail}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{m.detailMr}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Table with Guru */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-3 flex justify-between items-center" style={{ background: 'rgba(181,134,10,0.1)' }}>
              <span className="text-xs font-bold tracking-wider" style={{ color: '#B5860A' }}>LGT Growth Roadmap with Guru</span>
              <span className="text-[10px] text-muted-foreground">गुरू मार्गदर्शनासह वाढ रोडमॅप</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-2 text-left text-muted-foreground">Zone</th>
                  <th className="p-2 text-center text-muted-foreground">Score</th>
                  <th className="p-2 text-center text-muted-foreground">Now</th>
                  <th className="p-2 text-left text-muted-foreground">With Guru · 6 Months</th>
                  <th className="p-2 text-center text-muted-foreground">Target</th>
                </tr>
              </thead>
              <tbody>
                {LGT_ZONES.map(z => {
                  const isActive = analysis.grandTotal >= z.min && analysis.grandTotal <= z.max;
                  const multipliers = ['0.5X', '1X', '2X', '3X', '5X', '7X'];
                  const targets = ['3X', '4X', '5X', '7X', '9X', '10X'];
                  const descriptions = [
                    'Emergency reset → Foundation repair → Restore Dharma',
                    'Pillar repair → Second-line leader → Delegation done',
                    'Break comfort → Growth rituals → Sustained momentum',
                    'Unlock hidden constraint → Accelerate all 3 pillars',
                    'Integration mastery → Generational systems → Legacy',
                    'Transmit wisdom → Build school of thought → Become legacy',
                  ];
                  const idx = LGT_ZONES.indexOf(z);
                  return (
                    <tr key={z.rank} className={`border-b border-border ${isActive ? 'bg-primary/5 font-medium' : ''}`}>
                      <td className="p-2 font-bold" style={{ color: z.color }}>{z.rank}</td>
                      <td className="p-2 text-center text-muted-foreground">{z.min}–{z.max}</td>
                      <td className="p-2 text-center font-bold" style={{ color: z.color }}>{multipliers[idx]}</td>
                      <td className="p-2 italic text-muted-foreground">{descriptions[idx]}</td>
                      <td className="p-2 text-center font-bold" style={{ color: z.color }}>{targets[idx]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Overall Assessment */}
          <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #080F24, #0D1B3E)' }}>
            <span className="absolute bottom-[-20px] right-2 text-[80px] opacity-5 pointer-events-none">🔺</span>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#D4A843' }}>🔱 Your Transformation Path</h3>
            <p className="text-xs leading-relaxed text-white/90">
              Grand Total: <span className="font-bold" style={{ color: '#D4A843' }}>{analysis.grandTotal}/140</span> · 
              Zone: <span className="font-bold" style={{ color: '#D4A843' }}>{analysis.zone.name}</span> · 
              Weakest Pillar: <span className="font-bold" style={{ color: LGT_SECTIONS.find(s => s.key === analysis.weakest[0])?.color }}>{analysis.weakest[0].toUpperCase()} ({analysis.weakest[1]}/35)</span>
            </p>
            <p className="text-xs leading-relaxed text-white/80 mt-2">
              {analysis.zone.action}: {analysis.zone.diag}
            </p>
            <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(181,134,10,0.1)', borderLeft: '3px solid #B5860A' }}>
              <p className="text-xs italic text-white/70">
                "गुरु ब्रह्मा, गुरु विष्णू, गुरु देवो महेश्वरः। गुरु साक्षात् परब्रह्मः, तस्मै श्री गुरवे नमः॥"
              </p>
              <p className="text-[10px] text-white/50 mt-1">
                "The Guru removes darkness and reveals your true Golden Triangle within."
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.print()}
              className="py-3 rounded-xl font-bold text-sm tracking-wider transition-all hover:opacity-90"
              style={{ background: '#D4A843', color: '#0D1B3E' }}
            >
              🖨️ Print Report
            </button>
            <button
              onClick={() => { setShowResults(false); setActiveSection(0); }}
              className="py-3 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              ↺ Retake Test
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FF9933, #B8860B)' }}
          >
            💾 Save LGT Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export { LGT_SECTIONS, LGT_ZONES, PILLAR_COLORS, getZone, getPillarZone };
export default LGTAssessment;
