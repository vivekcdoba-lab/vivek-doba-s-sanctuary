import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const TEXTS = {
  en: {
    title: "FIRO-B Assessment",
    badge: "Psychological Assessment",
    welcome: {
      heading: "Understand Your Interpersonal Style",
      description: "The FIRO-B test measures how you interact with others across three core dimensions: Inclusion, Control, and Affection. There are no right or wrong answers — respond based on how you actually behave.",
      instructions: "Rate each statement from 1 (Never) to 6 (Always) based on how frequently it applies to you.",
      pills: ["54 questions · 6 dimensions", "10–15 minutes", "Personalized analysis"],
      start: "Begin Assessment",
      dims: [
        { label: "Inclusion", sub: "Belonging & connection" },
        { label: "Control", sub: "Authority & influence" },
        { label: "Affection", sub: "Warmth & intimacy" },
      ],
    },
    sections: [
      { code: "eI", label: "Inclusion — Expressed", desc: "How much you reach out to include others" },
      { code: "wI", label: "Inclusion — Wanted", desc: "How much you want others to include you" },
      { code: "eC", label: "Control — Expressed", desc: "How much you try to influence others" },
      { code: "wC", label: "Control — Wanted", desc: "How much you want others to guide you" },
      { code: "eA", label: "Affection — Expressed", desc: "How much warmth you show to others" },
      { code: "wA", label: "Affection — Wanted", desc: "How much warmth you want from others" },
    ],
    scale: ["Never", "Rarely", "Sometimes", "Often", "Usually", "Always"],
    next: "Next Section →",
    submit: "View My Results →",
    section: "Section",
    of: "of",
    results: "Your FIRO-B Profile",
    expressed: "Expressed",
    wanted: "Wanted",
    evW: "Expressed vs Wanted",
    analysis: "Personalized Analysis",
    restart: "Retake Assessment",
    low: "Low", mid: "Medium", high: "High",
    print: "🖨️ Print Report",
    save: "💾 Save Assessment",
  },
  hi: {
    title: "FIRO-B मूल्यांकन",
    badge: "मनोवैज्ञानिक मूल्यांकन",
    welcome: {
      heading: "अपनी पारस्परिक शैली को समझें",
      description: "FIRO-B परीक्षण तीन मुख्य आयामों में आपकी बातचीत को मापता है: समावेश, नियंत्रण और स्नेह। कोई सही या गलत उत्तर नहीं है — वास्तव में आप जैसा व्यवहार करते हैं उसके आधार पर जवाब दें।",
      instructions: "प्रत्येक कथन के लिए, 1 (कभी नहीं) से 6 (हमेशा) के पैमाने पर बताएं कि यह आप पर कितनी बार लागू होता है।",
      pills: ["54 प्रश्न · 6 आयाम", "10–15 मिनट", "व्यक्तिगत विश्लेषण"],
      start: "मूल्यांकन शुरू करें",
      dims: [
        { label: "समावेश", sub: "अपनापन और संबंध" },
        { label: "नियंत्रण", sub: "अधिकार और प्रभाव" },
        { label: "स्नेह", sub: "गर्मजोशी और घनिष्ठता" },
      ],
    },
    sections: [
      { code: "eI", label: "समावेश — व्यक्त", desc: "आप दूसरों को कितना शामिल करते हैं" },
      { code: "wI", label: "समावेश — अपेक्षित", desc: "आप दूसरों से कितना शामिल होना चाहते हैं" },
      { code: "eC", label: "नियंत्रण — व्यक्त", desc: "आप दूसरों को कितना प्रभावित करते हैं" },
      { code: "wC", label: "नियंत्रण — अपेक्षित", desc: "आप कितना मार्गदर्शन चाहते हैं" },
      { code: "eA", label: "स्नेह — व्यक्त", desc: "आप दूसरों को कितना प्यार दिखाते हैं" },
      { code: "wA", label: "स्नेह — अपेक्षित", desc: "आप दूसरों से कितना प्यार चाहते हैं" },
    ],
    scale: ["कभी नहीं", "शायद ही", "कभी-कभी", "अक्सर", "प्रायः", "हमेशा"],
    next: "अगला भाग →",
    submit: "परिणाम देखें →",
    section: "भाग",
    of: "में से",
    results: "आपकी FIRO-B प्रोफ़ाइल",
    expressed: "व्यक्त",
    wanted: "अपेक्षित",
    evW: "व्यक्त बनाम अपेक्षित",
    analysis: "व्यक्तिगत विश्लेषण",
    restart: "पुनः मूल्यांकन करें",
    low: "कम", mid: "मध्यम", high: "उच्च",
    print: "🖨️ रिपोर्ट प्रिंट करें",
    save: "💾 मूल्यांकन सहेजें",
  },
};

const QUESTIONS: Record<string, { en: string[]; hi: string[] }> = {
  eI: {
    en: [
      "I invite other people to do things with me.",
      "I try to include other people in my plans.",
      "I join social groups and activities.",
      "I make efforts to mix with people.",
      "I try to get people involved with me.",
      "I like to include other people in my activities.",
      "I try to be with groups of people.",
      "I join in when others are doing things together.",
      "I try to be part of social gatherings.",
    ],
    hi: [
      "मैं दूसरे लोगों को अपने साथ काम करने के लिए आमंत्रित करता/करती हूं।",
      "मैं दूसरे लोगों को अपनी योजनाओं में शामिल करने की कोशिश करता/करती हूं।",
      "मैं सामाजिक समूहों और गतिविधियों में शामिल होता/होती हूं।",
      "मैं लोगों से मेलजोल बढ़ाने की कोशिश करता/करती हूं।",
      "मैं लोगों को अपने साथ जोड़ने की कोशिश करता/करती हूं।",
      "मुझे अपनी गतिविधियों में दूसरे लोगों को शामिल करना पसंद है।",
      "मैं लोगों के समूह के साथ रहने की कोशिश करता/करती हूं।",
      "जब दूसरे मिलकर कुछ करते हैं तो मैं उनके साथ शामिल हो जाता/जाती हूं।",
      "मैं सामाजिक समारोहों का हिस्सा बनने की कोशिश करता/करती हूं।",
    ],
  },
  wI: {
    en: [
      "I like people to include me in their activities.",
      "I like people to invite me to join their plans.",
      "I like it when people notice me.",
      "I want people to include me in their social gatherings.",
      "I like it when people actively include me.",
      "I want to be accepted by others.",
      "I like people to invite me to things.",
      "I want others to include me in their groups.",
      "I like to feel that I belong to a group.",
    ],
    hi: [
      "मुझे पसंद है कि लोग मुझे अपनी गतिविधियों में शामिल करें।",
      "मुझे अच्छा लगता है जब लोग मुझे अपनी योजनाओं में आमंत्रित करते हैं।",
      "मुझे अच्छा लगता है जब लोग मुझ पर ध्यान देते हैं।",
      "मैं चाहता/चाहती हूं कि लोग मुझे अपनी सामाजिक सभाओं में शामिल करें।",
      "मुझे पसंद है जब लोग सक्रिय रूप से मुझे शामिल करते हैं।",
      "मैं चाहता/चाहती हूं कि दूसरे मुझे स्वीकार करें।",
      "मुझे पसंद है जब लोग मुझे चीज़ों में आमंत्रित करते हैं।",
      "मैं चाहता/चाहती हूं कि दूसरे मुझे अपने समूहों में शामिल करें।",
      "मुझे अच्छा लगता है जब मैं किसी समूह का हिस्सा होता/होती हूं।",
    ],
  },
  eC: {
    en: [
      "I try to influence the actions of other people.",
      "I try to take charge of things when I am with people.",
      "I try to have others do things the way I want.",
      "I try to control the outcome of situations.",
      "I try to make decisions when I'm with others.",
      "I try to get others to follow my approach.",
      "I try to dominate the social situation.",
      "I tell people what to do.",
      "I try to lead others in group settings.",
    ],
    hi: [
      "मैं दूसरे लोगों के कार्यों को प्रभावित करने की कोशिश करता/करती हूं।",
      "जब मैं लोगों के साथ होता/होती हूं तो चीज़ों की जिम्मेदारी लेने की कोशिश करता/करती हूं।",
      "मैं चाहता/चाहती हूं कि दूसरे लोग चीज़ें मेरे तरीके से करें।",
      "मैं स्थितियों के परिणामों को नियंत्रित करने की कोशिश करता/करती हूं।",
      "जब मैं दूसरों के साथ होता/होती हूं तो निर्णय लेने की कोशिश करता/करती हूं।",
      "मैं दूसरों को अपने दृष्टिकोण का पालन करवाने की कोशिश करता/करती हूं।",
      "मैं सामाजिक स्थिति में प्रभुत्व स्थापित करने की कोशिश करता/करती हूं।",
      "मैं लोगों को बताता/बताती हूं कि क्या करना है।",
      "मैं समूह में दूसरों का नेतृत्व करने की कोशिश करता/करती हूं।",
    ],
  },
  wC: {
    en: [
      "I let other people decide what to do.",
      "I let other people take charge of things.",
      "I like other people to make decisions for me.",
      "I let others control what I do.",
      "I let other people strongly influence my actions.",
      "I like others to tell me how to do things.",
      "I am easily led by people.",
      "I let others decide what to do when I am with them.",
      "I want others to take charge of situations.",
    ],
    hi: [
      "मैं दूसरे लोगों को यह तय करने देता/देती हूं कि क्या करना है।",
      "मैं दूसरे लोगों को चीज़ों की जिम्मेदारी लेने देता/देती हूं।",
      "मुझे पसंद है जब दूसरे लोग मेरे लिए निर्णय लेते हैं।",
      "मैं दूसरों को यह नियंत्रित करने देता/देती हूं कि मैं क्या करता/करती हूं।",
      "मैं दूसरे लोगों को मेरे कार्यों को दृढ़ता से प्रभावित करने देता/देती हूं।",
      "मुझे पसंद है जब दूसरे मुझे बताते हैं कि काम कैसे करना है।",
      "मैं आसानी से दूसरों के नेतृत्व में चलता/चलती हूं।",
      "जब मैं दूसरों के साथ होता/होती हूं तो उन्हें फैसला करने देता/देती हूं।",
      "मैं चाहता/चाहती हूं कि दूसरे स्थितियों की जिम्मेदारी लें।",
    ],
  },
  eA: {
    en: [
      "I try to be friendly toward people.",
      "I try to have close relationships with people.",
      "I try to have warm relationships with people.",
      "I act warm toward other people.",
      "I try to get close to people.",
      "I try to have intimate relationships with people.",
      "I express affection to people.",
      "I show personal interest in people.",
      "I confide in people.",
    ],
    hi: [
      "मैं लोगों के साथ मित्रवत रहने की कोशिश करता/करती हूं।",
      "मैं लोगों के साथ करीबी संबंध बनाने की कोशिश करता/करती हूं।",
      "मैं लोगों के साथ गर्मजोशी भरे संबंध रखने की कोशिश करता/करती हूं।",
      "मैं दूसरे लोगों के प्रति स्नेहशील व्यवहार करता/करती हूं।",
      "मैं लोगों के करीब जाने की कोशिश करता/करती हूं।",
      "मैं लोगों के साथ घनिष्ठ संबंध बनाने की कोशिश करता/करती हूं।",
      "मैं लोगों के प्रति अपना स्नेह व्यक्त करता/करती हूं।",
      "मैं लोगों में व्यक्तिगत रुचि दिखाता/दिखाती हूं।",
      "मैं लोगों में विश्वास करके अपनी बातें साझा करता/करती हूं।",
    ],
  },
  wA: {
    en: [
      "I want people to act warm toward me.",
      "I like people to act close to me.",
      "I want people to share personal feelings with me.",
      "I want people to confide in me.",
      "I want people to act friendly toward me.",
      "I want people to have warm feelings toward me.",
      "I like it when people show interest in me.",
      "I want others to feel close to me.",
      "I like people to express affection to me.",
    ],
    hi: [
      "मैं चाहता/चाहती हूं कि लोग मेरे प्रति स्नेहशील व्यवहार करें।",
      "मुझे पसंद है जब लोग मेरे करीब आते हैं।",
      "मैं चाहता/चाहती हूं कि लोग मेरे साथ अपनी निजी भावनाएं साझा करें।",
      "मैं चाहता/चाहती हूं कि लोग मुझ पर भरोसा करके अपनी बातें बताएं।",
      "मैं चाहता/चाहती हूं कि लोग मेरे साथ मित्रवत व्यवहार करें।",
      "मैं चाहता/चाहती हूं कि लोग मेरे प्रति उष्ण भावनाएं रखें।",
      "मुझे अच्छा लगता है जब लोग मुझमें रुचि दिखाते हैं।",
      "मैं चाहता/चाहती हूं कि दूसरे मेरे करीब महसूस करें।",
      "मुझे पसंद है जब लोग मेरे प्रति स्नेह व्यक्त करते हैं।",
    ],
  },
};

const CODES = ["eI", "wI", "eC", "wC", "eA", "wA"] as const;

type Lang = "en" | "hi";

interface FIROBAssessmentProps {
  onClose: () => void;
  onSave?: (scores: Record<string, number>) => void;
}

function getLevel(s: number, t: typeof TEXTS.en) {
  if (s <= 3) return { label: t.low, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
  if (s <= 6) return { label: t.mid, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
  return { label: t.high, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" };
}

function getAnalysisText(scores: Record<string, number>, lang: Lang): string {
  const t = TEXTS[lang];
  const sections = [
    { e: "eI", w: "wI", nameEn: "Inclusion", nameHi: "समावेश" },
    { e: "eC", w: "wC", nameEn: "Control", nameHi: "नियंत्रण" },
    { e: "eA", w: "wA", nameEn: "Affection", nameHi: "स्नेह" },
  ];

  const lines: string[] = [];
  const name = lang === "en" ? "nameEn" : "nameHi";

  // Summary
  const totalE = scores.eI + scores.eC + scores.eA;
  const totalW = scores.wI + scores.wC + scores.wA;
  if (lang === "en") {
    lines.push(`**Your Interpersonal Profile Summary**`);
    lines.push(`Your total expressed score is ${totalE}/27 and wanted score is ${totalW}/27. ${totalE > totalW ? "You tend to initiate more than you seek from others." : totalE < totalW ? "You desire more from others than you typically express." : "Your giving and receiving are well balanced."}`);
  } else {
    lines.push(`**आपकी पारस्परिक प्रोफ़ाइल का सारांश**`);
    lines.push(`आपका कुल व्यक्त स्कोर ${totalE}/27 और अपेक्षित स्कोर ${totalW}/27 है। ${totalE > totalW ? "आप दूसरों से अपेक्षा करने से अधिक पहल करते हैं।" : totalE < totalW ? "आप जितना व्यक्त करते हैं उससे अधिक दूसरों से चाहते हैं।" : "आपका देना और लेना संतुलित है।"}`);
  }
  lines.push("");

  for (const sec of sections) {
    const eScore = scores[sec.e];
    const wScore = scores[sec.w];
    const gap = Math.abs(eScore - wScore);
    const dimName = sec[name as "nameEn" | "nameHi"];

    lines.push(`**${dimName} (${sec.e}: ${eScore}/9 | ${sec.w}: ${wScore}/9)**`);

    if (lang === "en") {
      if (sec.e === "eI") {
        lines.push(`${eScore >= 7 ? "You actively seek out social connections and enjoy including others." : eScore <= 3 ? "You tend to be selective about social engagement and prefer smaller circles." : "You have a moderate approach to social inclusion."} ${wScore >= 7 ? "You strongly desire to be included by others." : wScore <= 3 ? "You're comfortable being on your own and don't need external validation." : "You appreciate being included but don't depend on it."} ${gap >= 4 ? `The ${eScore > wScore ? "high expressed/low wanted" : "low expressed/high wanted"} gap suggests ${eScore > wScore ? "you give more than you seek" : "unmet social needs"}.` : ""}`);
      } else if (sec.e === "eC") {
        lines.push(`${eScore >= 7 ? "You naturally take charge and influence others' decisions." : eScore <= 3 ? "You prefer a collaborative or hands-off approach to leadership." : "You exercise control selectively based on the situation."} ${wScore >= 7 ? "You're comfortable with others directing you." : wScore <= 3 ? "You resist being controlled and value autonomy." : "You accept guidance when appropriate."} ${gap >= 4 ? `This ${eScore > wScore ? "dominant" : "deferential"} pattern is significant.` : ""}`);
      } else {
        lines.push(`${eScore >= 7 ? "You are openly warm and emotionally expressive." : eScore <= 3 ? "You tend to keep emotional distance in relationships." : "You show warmth selectively with trusted people."} ${wScore >= 7 ? "You deeply crave emotional closeness from others." : wScore <= 3 ? "You're self-sufficient emotionally." : "You appreciate affection but don't actively seek it."} ${gap >= 4 ? `The gap between giving and receiving affection is notable.` : ""}`);
      }
    } else {
      if (sec.e === "eI") {
        lines.push(`${eScore >= 7 ? "आप सक्रिय रूप से सामाजिक संबंध बनाते हैं।" : eScore <= 3 ? "आप सामाजिक जुड़ाव में चयनात्मक हैं।" : "समावेश के प्रति आपका दृष्टिकोण संतुलित है।"} ${wScore >= 7 ? "आप दूसरों द्वारा शामिल किए जाने की तीव्र इच्छा रखते हैं।" : wScore <= 3 ? "आप अकेले भी सहज हैं।" : "आप शामिल होने की सराहना करते हैं लेकिन इस पर निर्भर नहीं हैं।"}`);
      } else if (sec.e === "eC") {
        lines.push(`${eScore >= 7 ? "आप स्वाभाविक रूप से नेतृत्व करते हैं।" : eScore <= 3 ? "आप सहयोगी दृष्टिकोण पसंद करते हैं।" : "आप परिस्थिति के अनुसार नियंत्रण करते हैं।"} ${wScore >= 7 ? "आप दूसरों के मार्गदर्शन में सहज हैं।" : wScore <= 3 ? "आप स्वायत्तता को महत्व देते हैं।" : "आप उचित मार्गदर्शन स्वीकार करते हैं।"}`);
      } else {
        lines.push(`${eScore >= 7 ? "आप खुले तौर पर स्नेहशील हैं।" : eScore <= 3 ? "आप भावनात्मक दूरी बनाए रखते हैं।" : "आप विश्वसनीय लोगों के साथ गर्मजोशी दिखाते हैं।"} ${wScore >= 7 ? "आप भावनात्मक निकटता की गहरी इच्छा रखते हैं।" : wScore <= 3 ? "आप भावनात्मक रूप से आत्मनिर्भर हैं।" : "आप स्नेह की सराहना करते हैं।"}`);
      }
    }
    lines.push("");
  }

  // Strengths
  if (lang === "en") {
    lines.push("**Key Strengths**");
    const strengths: string[] = [];
    if (scores.eI >= 6) strengths.push("Strong social initiator — you bring people together naturally.");
    if (scores.eA >= 6) strengths.push("Emotionally expressive — you create warm, trusting environments.");
    if (scores.eC >= 6) strengths.push("Natural leader — you provide direction and structure.");
    if (scores.wI <= 3 && scores.eI >= 5) strengths.push("Self-assured — you connect without needing validation.");
    if (scores.wC <= 3) strengths.push("Independent thinker — you value autonomy.");
    if (strengths.length < 2) {
      strengths.push("Balanced interpersonal style — adaptable across situations.");
      strengths.push("Self-aware — taking this assessment shows commitment to growth.");
    }
    lines.push(strengths.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join("\n"));
    lines.push("");

    lines.push("**Growth Opportunities**");
    const growth: string[] = [];
    if (scores.eI <= 3) growth.push("Practice initiating social contact — start with small group activities.");
    if (scores.eA <= 3) growth.push("Express warmth more openly — start with verbal appreciation.");
    if (scores.wI >= 7 && scores.eI <= 4) growth.push("Bridge the inclusion gap — initiate more instead of waiting.");
    if (scores.eC >= 8) growth.push("Practice delegating and listening — not every situation needs your control.");
    if (growth.length < 2) growth.push("Continue developing self-awareness through regular reflection.");
    lines.push(growth.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join("\n"));
  } else {
    lines.push("**मुख्य शक्तियां**");
    const strengths: string[] = [];
    if (scores.eI >= 6) strengths.push("मजबूत सामाजिक पहलकर्ता — आप स्वाभाविक रूप से लोगों को जोड़ते हैं।");
    if (scores.eA >= 6) strengths.push("भावनात्मक रूप से अभिव्यक्त — आप गर्म, विश्वसनीय वातावरण बनाते हैं।");
    if (scores.eC >= 6) strengths.push("प्राकृतिक नेता — आप दिशा और संरचना प्रदान करते हैं।");
    if (strengths.length < 2) {
      strengths.push("संतुलित पारस्परिक शैली — विभिन्न परिस्थितियों में अनुकूलनीय।");
      strengths.push("आत्म-जागरूक — यह मूल्यांकन लेना विकास के प्रति प्रतिबद्धता दर्शाता है।");
    }
    lines.push(strengths.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join("\n"));
    lines.push("");

    lines.push("**विकास के अवसर**");
    const growth: string[] = [];
    if (scores.eI <= 3) growth.push("सामाजिक संपर्क शुरू करने का अभ्यास करें।");
    if (scores.eA <= 3) growth.push("गर्मजोशी अधिक खुले तौर पर व्यक्त करें।");
    if (growth.length < 2) growth.push("नियमित आत्म-चिंतन के माध्यम से आत्म-जागरूकता विकसित करते रहें।");
    lines.push(growth.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join("\n"));
  }

  return lines.join("\n");
}

export default function FIROBAssessment({ onClose, onSave }: FIROBAssessmentProps) {
  const [lang, setLang] = useState<Lang>("en");
  const [screen, setScreen] = useState<"welcome" | "test" | "results">("welcome");
  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [scores, setScores] = useState<Record<string, number> | null>(null);

  const t = TEXTS[lang];

  const computeScores = (ans: Record<string, number>) => {
    const result: Record<string, number> = {};
    CODES.forEach((code) => {
      let sum = 0;
      for (let qi = 0; qi < 9; qi++) {
        sum += ans[`${code}_${qi}`] || 1;
      }
      result[code] = Math.round(((sum - 9) / 45) * 9);
    });
    return result;
  };

  const sectionComplete = (idx: number) => {
    const code = CODES[idx];
    return Array.from({ length: 9 }, (_, qi) => answers[`${code}_${qi}`]).every(Boolean);
  };

  const handleNext = () => {
    if (section < 5) {
      setSection((p) => p + 1);
      window.scrollTo?.(0, 0);
    } else {
      const sc = computeScores(answers);
      setScores(sc);
      setScreen("results");
    }
  };

  const resetAll = () => {
    setScreen("welcome");
    setSection(0);
    setAnswers({});
    setScores(null);
  };

  // Language toggle
  const LangToggle = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex rounded-lg overflow-hidden border border-border">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`${compact ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-xs"} transition-colors ${
            lang === l
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-transparent text-muted-foreground hover:bg-muted"
          }`}
        >
          {l === "en" ? "English" : "हिंदी"}
        </button>
      ))}
    </div>
  );

  // ── WELCOME ──
  if (screen === "welcome") {
    const dimColors = ["bg-blue-50 dark:bg-blue-950/20", "bg-amber-50 dark:bg-amber-950/20", "bg-emerald-50 dark:bg-emerald-950/20"];
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h2 className="text-lg font-bold text-foreground">{t.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle compact />
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary">{t.badge}</span>
          <h3 className="text-xl font-bold text-foreground">{t.welcome.heading}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.welcome.description}</p>
          <p className="text-xs text-muted-foreground">{t.welcome.instructions}</p>

          <div className="flex flex-wrap gap-2">
            {t.welcome.pills.map((p, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-[11px] bg-muted text-muted-foreground">{p}</span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {t.welcome.dims.map((d, i) => (
              <div key={i} className={`rounded-xl p-4 text-center ${dimColors[i]}`}>
                <p className="text-sm font-bold text-foreground">{d.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{d.sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setScreen("test")}
              className="px-8 py-2.5 text-sm font-medium rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              {t.welcome.start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── TEST ──
  if (screen === "test") {
    const code = CODES[section];
    const sec = t.sections[section];
    const qs = QUESTIONS[code][lang];
    const answered = Object.keys(answers).length;
    const progress = Math.round((answered / 54) * 100);
    const canProceed = sectionComplete(section);

    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Top bar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t.section} {section + 1} {t.of} 6
            </span>
            <div className="flex items-center gap-2">
              <LangToggle compact />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Section header */}
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-base font-bold text-foreground">{sec.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{sec.desc}</p>
        </div>

        {/* Scale legend */}
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between gap-1 px-2 py-2 bg-muted/50 rounded-lg">
            {t.scale.map((label, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <span className="text-xs font-semibold text-foreground">{i + 1}</span>
                <span className="text-[8px] text-muted-foreground leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="px-6 pb-4 space-y-3">
          {qs.map((q, qi) => {
            const key = `${code}_${qi}`;
            const sel = answers[key];
            return (
              <div key={qi} className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground mb-3">
                  <span className="font-semibold text-primary mr-1">{qi + 1}.</span>
                  {q}
                </p>
                <div className="flex items-center gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAnswers((p) => ({ ...p, [key]: val }))}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                        sel === val
                          ? "bg-primary text-primary-foreground shadow-md scale-110"
                          : "border border-border text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <button
            disabled={!canProceed}
            onClick={handleNext}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {section < 5 ? t.next : t.submit}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (screen === "results" && scores) {
    const barData = [
      { name: lang === "en" ? "Inclusion" : "समावेश", [t.expressed]: scores.eI, [t.wanted]: scores.wI },
      { name: lang === "en" ? "Control" : "नियंत्रण", [t.expressed]: scores.eC, [t.wanted]: scores.wC },
      { name: lang === "en" ? "Affection" : "स्नेह", [t.expressed]: scores.eA, [t.wanted]: scores.wA },
    ];

    const analysisText = getAnalysisText(scores, lang);

    const renderAnalysis = (text: string) =>
      text.split("\n").map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <h4 key={i} className="text-sm font-bold text-foreground mt-4 mb-1">{line.slice(2, -2)}</h4>;
        }
        if (!line.trim()) return <div key={i} className="h-2" />;
        return <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>;
      });

    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{t.results}</h2>
          <div className="flex items-center gap-2">
            <LangToggle compact />
            <button onClick={resetAll} className="text-xs text-primary font-medium">{t.restart}</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Score grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {t.sections.map((s, i) => {
              const sc = scores[CODES[i]];
              const lv = getLevel(sc, t);
              return (
                <div key={i} className="bg-muted/30 rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-primary">{CODES[i]}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{sc}<span className="text-xs text-muted-foreground">/9</span></p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium mt-1 ${lv.color}`}>{lv.label}</span>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-muted/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">{t.evW}</h3>
              <div className="flex items-center gap-3">
                {[{ key: t.expressed, color: "#1D9E75" }, { key: t.wanted, color: "#9FE1CB" }].map((d) => (
                  <div key={d.key} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-muted-foreground">{d.key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 9]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey={t.expressed} fill="#1D9E75" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t.wanted} fill="#9FE1CB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-muted/20 rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">{t.analysis}</h3>
            {renderAnalysis(analysisText)}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.print()}
              className="py-3 rounded-xl font-bold text-sm tracking-wider transition-all hover:opacity-90"
              style={{ background: '#D4A843', color: '#0D1B3E' }}
            >
              {t.print}
            </button>
            <button
              onClick={() => onSave?.(scores)}
              className="py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF9933, #B8860B)' }}
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
