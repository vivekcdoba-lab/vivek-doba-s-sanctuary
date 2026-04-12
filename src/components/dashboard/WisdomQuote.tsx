const WISDOM_QUOTES = [
  { text: "जो व्यक्ति अपने धर्म में स्थित रहता है, वही सच्चा सफल है।", source: "श्रीमद्भगवद्गीता", en: "One who is steadfast in their dharma is truly successful." },
  { text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।", source: "गीता 2.47", en: "You have the right to work, but never to the fruit of work." },
  { text: "योगः कर्मसु कौशलम्।", source: "गीता 2.50", en: "Yoga is skill in action." },
  { text: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।", source: "गीता 6.5", en: "Elevate yourself through the power of your mind." },
  { text: "श्रद्धावान् लभते ज्ञानम्।", source: "गीता 4.39", en: "The faithful one attains knowledge." },
];

const WisdomQuote = () => {
  const dayIndex = new Date().getDate() % WISDOM_QUOTES.length;
  const quote = WISDOM_QUOTES[dayIndex];

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800">
      <p className="text-sm font-devanagari text-foreground leading-relaxed">📖 "{quote.text}"</p>
      <p className="text-xs text-muted-foreground italic mt-1">{quote.en}</p>
      <p className="text-xs text-primary font-medium mt-2">— {quote.source}</p>
    </div>
  );
};

export default WisdomQuote;
