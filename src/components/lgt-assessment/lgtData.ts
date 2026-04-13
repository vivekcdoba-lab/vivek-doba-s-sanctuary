export interface LgtDimension {
  id: 'dharma' | 'artha' | 'kama' | 'moksha';
  name: string;
  hindi: string;
  emoji: string;
  color: string;
  description: string;
  questions: string[];
}

export interface LgtScores {
  dharma: number;
  artha: number;
  kama: number;
  moksha: number;
}

export const DEFAULT_SCORES: LgtScores = { dharma: 5, artha: 5, kama: 5, moksha: 5 };

export const LGT_DIMENSIONS: LgtDimension[] = [
  {
    id: 'dharma',
    name: 'Dharma',
    hindi: 'धर्म',
    emoji: '🕉️',
    color: 'hsl(122, 46%, 33%)',
    description: 'Purpose, duty, righteousness & ethical living',
    questions: [
      'Am I living in alignment with my core values?',
      'Do I feel a sense of purpose and meaning in my daily life?',
      'Am I fulfilling my responsibilities towards family and society?',
      'Do I practise honesty, integrity, and compassion consistently?',
    ],
  },
  {
    id: 'artha',
    name: 'Artha',
    hindi: 'अर्थ',
    emoji: '💰',
    color: 'hsl(51, 100%, 50%)',
    description: 'Wealth, career, material security & prosperity',
    questions: [
      'Am I financially secure and growing my wealth mindfully?',
      'Is my career/business aligned with my long-term goals?',
      'Do I have adequate savings and investments?',
      'Am I building skills that increase my earning potential?',
    ],
  },
  {
    id: 'kama',
    name: 'Kama',
    hindi: 'काम',
    emoji: '❤️',
    color: 'hsl(340, 82%, 52%)',
    description: 'Desires, relationships, pleasure & emotional fulfilment',
    questions: [
      'Are my personal relationships healthy and fulfilling?',
      'Do I make time for hobbies, passions, and recreation?',
      'Am I emotionally connected with loved ones?',
      'Do I experience joy and satisfaction regularly?',
    ],
  },
  {
    id: 'moksha',
    name: 'Moksha',
    hindi: 'मोक्ष',
    emoji: '🧘',
    color: 'hsl(27, 100%, 60%)',
    description: 'Liberation, spiritual growth, self-realisation & inner peace',
    questions: [
      'Do I practise meditation, prayer, or mindfulness regularly?',
      'Am I growing in self-awareness and consciousness?',
      'Do I feel a sense of inner peace and detachment?',
      'Am I letting go of ego, attachments, and limiting beliefs?',
    ],
  },
];

export function getScoreZone(score: number): { label: string; color: string; emoji: string } {
  if (score <= 4) return { label: 'Danger Zone', color: 'hsl(0, 69%, 50%)', emoji: '🔴' };
  if (score <= 6) return { label: 'Growth Zone', color: 'hsl(33, 100%, 50%)', emoji: '🟡' };
  return { label: 'Thriving Zone', color: 'hsl(122, 46%, 33%)', emoji: '🟢' };
}

export function getBalanceAnalysis(scores: LgtScores) {
  const vals = Object.values(scores);
  const avg = vals.reduce((a, b) => a + b, 0) / 4;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const gap = max - min;
  const variance = Math.sqrt(vals.reduce((s, v) => s + (v - avg) ** 2, 0) / 4);

  const highest = LGT_DIMENSIONS.find(d => scores[d.id] === max)!;
  const lowest = LGT_DIMENSIONS.find(d => scores[d.id] === min)!;

  let balanceLevel: string;
  if (gap <= 2) balanceLevel = 'Excellent Balance';
  else if (gap <= 4) balanceLevel = 'Moderate Balance';
  else balanceLevel = 'Significant Imbalance';

  return { avg, max, min, gap, variance, highest, lowest, balanceLevel };
}

export const DIMENSION_ACTIONS: Record<string, { low: string[]; mid: string[]; high: string[] }> = {
  dharma: {
    low: ['Identify your top 3 core values and journal about them', 'Start a daily gratitude & purpose reflection', 'Volunteer or serve the community once a week'],
    mid: ['Create a personal mission statement', 'Align daily actions with your stated values', 'Read a book on dharmic living'],
    high: ['Mentor someone on values-based living', 'Deepen your philosophical study', 'Share your purpose journey with others'],
  },
  artha: {
    low: ['Create a monthly budget and track expenses', 'Set one financial goal for the next 90 days', 'Learn one new income-generating skill'],
    mid: ['Build an emergency fund of 6 months expenses', 'Diversify income streams', 'Invest in professional development'],
    high: ['Create a wealth-sharing plan', 'Mentor others on financial literacy', 'Align wealth with purpose (dharmic wealth)'],
  },
  kama: {
    low: ['Schedule quality time with family weekly', 'Rediscover one hobby or passion', 'Express appreciation to 3 people this week'],
    mid: ['Plan a meaningful experience with loved ones', 'Join a social group aligned with your interests', 'Practice active listening in conversations'],
    high: ['Help others build better relationships', 'Create lasting memories through shared experiences', 'Deepen emotional intelligence practices'],
  },
  moksha: {
    low: ['Start with 5 minutes of daily meditation', 'Journal about one limiting belief to release', 'Spend 10 minutes in nature daily'],
    mid: ['Attend a spiritual retreat or workshop', 'Practice detachment from one material attachment', 'Study a spiritual text weekly'],
    high: ['Guide others in meditation or mindfulness', 'Deepen your contemplative practice', 'Live with greater equanimity and acceptance'],
  },
};
