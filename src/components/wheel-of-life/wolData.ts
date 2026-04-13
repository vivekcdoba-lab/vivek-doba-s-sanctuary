// Wheel of Life 8-spoke framework data & helpers

export const WOL_SPOKES = [
  { id: 'career', name: "Career & Work", emoji: "💼", color: "#17A2B8", hindi: "करियर", description: "Job satisfaction, meaningful work, career growth, work-life balance, professional relationships" },
  { id: 'finance', name: "Finance & Wealth", emoji: "💰", color: "#FFD700", hindi: "आर्थिक", description: "Income stability, savings, investments, debt management, financial security" },
  { id: 'health', name: "Health & Fitness", emoji: "❤️", color: "#E53E3E", hindi: "स्वास्थ्य", description: "Physical health, energy levels, exercise routine, diet, sleep quality, medical checkups" },
  { id: 'family', name: "Family & Relationships", emoji: "👨‍👩‍👧‍👦", color: "#FF6B00", hindi: "परिवार", description: "Connection with family, quality time, support system, communication, harmony" },
  { id: 'romance', name: "Romance & Intimacy", emoji: "💑", color: "#ED64A6", hindi: "प्रेम", description: "Romantic relationship satisfaction, emotional intimacy, physical connection, partnership quality" },
  { id: 'growth', name: "Personal Growth & Learning", emoji: "🎯", color: "#6B46C1", hindi: "विकास", description: "Learning new skills, self-improvement, reading, courses, spiritual development" },
  { id: 'fun', name: "Fun & Recreation", emoji: "🎉", color: "#F6AD55", hindi: "मनोरंजन", description: "Hobbies, leisure time, vacations, social activities, joy and laughter" },
  { id: 'environment', name: "Physical Environment", emoji: "🏠", color: "#38B2AC", hindi: "वातावरण", description: "Home comfort, workspace, cleanliness, aesthetics, safety" },
] as const;

export type SpokeId = typeof WOL_SPOKES[number]['id'];

export interface WoLScores {
  career: number;
  finance: number;
  health: number;
  family: number;
  romance: number;
  growth: number;
  fun: number;
  environment: number;
}

export const DEFAULT_SCORES: WoLScores = {
  career: 5, finance: 5, health: 5, family: 5,
  romance: 5, growth: 5, fun: 5, environment: 5,
};

export function getScoreZone(score: number) {
  if (score <= 4) return { label: 'Danger Zone', emoji: '🚨', class: 'bg-red-500/15 text-red-600 border-red-500/30', color: '#EF4444' };
  if (score <= 6) return { label: 'Needs Work', emoji: '⚠️', class: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30', color: '#F59E0B' };
  return { label: 'Thriving', emoji: '✨', class: 'bg-green-500/15 text-green-600 border-green-500/30', color: '#22C55E' };
}

export function getBalanceMessage(avg: number): { message: string; emoji: string } {
  if (avg <= 3) return { message: "Critical Imbalance — Immediate attention needed", emoji: "🚨" };
  if (avg <= 5) return { message: "Significant Imbalance — Focused improvement required", emoji: "⚠️" };
  if (avg <= 7) return { message: "Moderate Balance — Room for growth", emoji: "🔄" };
  if (avg <= 9) return { message: "Good Balance — Fine-tuning needed", emoji: "✨" };
  return { message: "Excellent Balance — Maintain your excellence", emoji: "🏆" };
}

export const DANGER_MESSAGES: Record<string, string> = {
  "Career & Work": "Low career satisfaction can lead to burnout, depression, and life dissatisfaction. Your work takes 1/3 of your life!",
  "Finance & Wealth": "Financial stress is the #1 cause of relationship problems and health issues. This needs urgent attention.",
  "Health & Fitness": "Without health, nothing else matters. Poor health affects every other life area.",
  "Family & Relationships": "Humans are social beings. Isolation and poor relationships lead to mental health decline.",
  "Romance & Intimacy": "Intimate connection is a core human need. Neglect here affects emotional wellbeing.",
  "Personal Growth & Learning": "Stagnation leads to boredom and depression. Growth is essential for fulfillment.",
  "Fun & Recreation": "All work and no play leads to burnout. Joy is not optional, it's essential.",
  "Physical Environment": "Your environment shapes your mood, productivity, and mental state daily.",
};

export const SPOKE_ACTIONS: Record<string, { low: string[]; medium: string[]; high: string[] }> = {
  "Career & Work": {
    low: [
      "Schedule a career clarity session with your coach",
      "Update your resume and LinkedIn profile this week",
      "Identify 3 skills to develop in next 90 days",
      "Have an honest conversation with your manager about growth",
      "Explore side projects aligned with your dharma",
    ],
    medium: [
      "Set quarterly professional development goals",
      "Seek a mentor in your field",
      "Attend one industry event monthly",
      "Document your achievements weekly",
    ],
    high: [
      "Mentor someone junior",
      "Share your expertise through content",
      "Maintain work-life boundaries",
      "Celebrate your professional wins",
    ],
  },
  "Finance & Wealth": {
    low: [
      "Create an emergency fund (start with ₹1000/month)",
      "Track every expense for 30 days",
      "List all debts and create payoff plan",
      "Read 'Rich Dad Poor Dad' this month",
      "Consult a financial advisor",
    ],
    medium: [
      "Increase savings rate by 5%",
      "Start SIP investments",
      "Review and optimize insurance",
      "Create multiple income streams",
    ],
    high: [
      "Focus on wealth multiplication",
      "Explore passive income options",
      "Give back — charity and donations",
      "Teach financial literacy to family",
    ],
  },
  "Health & Fitness": {
    low: [
      "Get a complete health checkup immediately",
      "Start with 10-minute daily walks",
      "Sleep 7+ hours starting tonight",
      "Eliminate one unhealthy food this week",
      "Download a fitness tracking app",
    ],
    medium: [
      "Join a gym or yoga class",
      "Meal prep for the week",
      "Add strength training 2x/week",
      "Practice stress management techniques",
    ],
    high: [
      "Train for a fitness event (5K, marathon)",
      "Experiment with advanced nutrition",
      "Help others on their fitness journey",
      "Maintain consistency",
    ],
  },
  "Family & Relationships": {
    low: [
      "Schedule weekly family time (non-negotiable)",
      "Call one family member daily",
      "Plan a family activity this weekend",
      "Have difficult conversations you've been avoiding",
      "Write appreciation letters to family members",
    ],
    medium: [
      "Create family traditions",
      "Plan a family vacation",
      "Improve communication skills",
      "Resolve old conflicts",
    ],
    high: [
      "Deepen existing bonds",
      "Create multi-generational memories",
      "Be the family anchor",
      "Document family stories",
    ],
  },
  "Romance & Intimacy": {
    low: [
      "Have an honest conversation with your partner",
      "Schedule weekly date nights",
      "Read a relationship book together",
      "Consider couples counseling",
      "Express appreciation daily",
    ],
    medium: [
      "Learn your partner's love language",
      "Plan surprise gestures",
      "Improve emotional intimacy",
      "Address unresolved issues",
    ],
    high: [
      "Keep the spark alive",
      "Support each other's growth",
      "Renew your commitment",
      "Be a relationship role model",
    ],
  },
  "Personal Growth & Learning": {
    low: [
      "Read 10 pages daily",
      "Join the LGT Platinum program",
      "Listen to podcasts during commute",
      "Set one learning goal for this month",
      "Find an accountability partner",
    ],
    medium: [
      "Take an online course",
      "Attend workshops and seminars",
      "Practice new skills daily",
      "Journal your growth journey",
    ],
    high: [
      "Teach what you learn",
      "Write a book or blog",
      "Become a thought leader",
      "Mentor others",
    ],
  },
  "Fun & Recreation": {
    low: [
      "Schedule fun like you schedule work",
      "Revive an old hobby this week",
      "Plan a weekend getaway",
      "Say yes to social invitations",
      "Create a 'fun bucket list'",
    ],
    medium: [
      "Try a new hobby monthly",
      "Join a club or group",
      "Plan quarterly vacations",
      "Balance screen time with real activities",
    ],
    high: [
      "Share your hobbies with others",
      "Organize events and gatherings",
      "Explore adventure activities",
      "Make fun a lifestyle",
    ],
  },
  "Physical Environment": {
    low: [
      "Deep clean your living space",
      "Declutter one area this week",
      "Fix one thing that's been broken",
      "Add plants to your space",
      "Improve lighting",
    ],
    medium: [
      "Redesign your workspace",
      "Upgrade your sleep environment",
      "Create zones for different activities",
      "Add inspiring elements",
    ],
    high: [
      "Optimize for productivity and peace",
      "Invest in quality furniture",
      "Create your dream space",
      "Help others improve their environment",
    ],
  },
};

export function getActionsForScore(spokeName: string, score: number): string[] {
  const actions = SPOKE_ACTIONS[spokeName];
  if (!actions) return [];
  if (score <= 4) return actions.low;
  if (score <= 6) return actions.medium;
  return actions.high;
}
