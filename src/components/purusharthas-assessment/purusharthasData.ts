export interface PurusharthasScores {
  dharma: number;
  artha: number;
  kama: number;
  moksha: number;
}

export const DEFAULT_SCORES: PurusharthasScores = { dharma: 5, artha: 5, kama: 5, moksha: 5 };

export interface PurusharthasDimension {
  id: keyof PurusharthasScores;
  name: string;
  hindi: string;
  emoji: string;
  color: string;
  description: string;
  subDimensions: { id: string; name: string; description: string }[];
  guidingQuestions: string[];
}

export const PURUSHARTHAS_DIMENSIONS: PurusharthasDimension[] = [
  {
    id: 'dharma',
    name: 'Dharma (Righteousness)',
    hindi: 'धर्म',
    emoji: '🕉️',
    color: '#F59E0B',
    description: 'Living with purpose, ethics, duty, and moral integrity',
    subDimensions: [
      { id: 'values', name: 'Values & Ethics', description: 'Living according to your core values' },
      { id: 'service', name: 'Service & Duty', description: 'Fulfilling responsibilities to family and society' },
      { id: 'truth', name: 'Truth & Integrity', description: 'Being honest and authentic in all dealings' },
    ],
    guidingQuestions: [
      'Am I living in alignment with my core values?',
      'Do I fulfill my duties to family, work, and society?',
      'Am I honest and ethical in my daily actions?',
    ],
  },
  {
    id: 'artha',
    name: 'Artha (Prosperity)',
    hindi: 'अर्थ',
    emoji: '💰',
    color: '#10B981',
    description: 'Material well-being, financial security, career success',
    subDimensions: [
      { id: 'wealth', name: 'Financial Security', description: 'Stable income and savings' },
      { id: 'career', name: 'Career Growth', description: 'Professional advancement and skills' },
      { id: 'resources', name: 'Resource Management', description: 'Wise use of money and assets' },
    ],
    guidingQuestions: [
      'Do I have financial stability and security?',
      'Am I growing in my career or profession?',
      'Do I manage my resources wisely?',
    ],
  },
  {
    id: 'kama',
    name: 'Kama (Pleasure)',
    hindi: 'काम',
    emoji: '🌸',
    color: '#EC4899',
    description: 'Desires, pleasure, emotional fulfillment, love, and aesthetics',
    subDimensions: [
      { id: 'relationships', name: 'Love & Relationships', description: 'Quality of intimate and personal bonds' },
      { id: 'joy', name: 'Joy & Pleasure', description: 'Experiencing beauty, art, and sensory delight' },
      { id: 'desires', name: 'Healthy Desires', description: 'Pursuing desires without attachment' },
    ],
    guidingQuestions: [
      'Are my relationships fulfilling and nurturing?',
      'Do I experience joy and beauty in daily life?',
      'Am I pursuing desires in a balanced, healthy way?',
    ],
  },
  {
    id: 'moksha',
    name: 'Moksha (Liberation)',
    hindi: 'मोक्ष',
    emoji: '🧘',
    color: '#8B5CF6',
    description: 'Spiritual growth, self-realization, inner freedom',
    subDimensions: [
      { id: 'meditation', name: 'Meditation & Practice', description: 'Regular spiritual practice' },
      { id: 'awareness', name: 'Self-Awareness', description: 'Understanding your true nature' },
      { id: 'detachment', name: 'Non-Attachment', description: 'Freedom from material clinging' },
    ],
    guidingQuestions: [
      'Do I have a consistent spiritual practice?',
      'Am I growing in self-awareness and consciousness?',
      'Can I let go of attachments gracefully?',
    ],
  },
];

export function getScoreZone(score: number): 'danger' | 'warning' | 'good' | 'excellent' {
  if (score <= 3) return 'danger';
  if (score <= 5) return 'warning';
  if (score <= 7) return 'good';
  return 'excellent';
}

export function getZoneColor(zone: string): string {
  switch (zone) {
    case 'danger': return '#EF4444';
    case 'warning': return '#F59E0B';
    case 'good': return '#10B981';
    case 'excellent': return '#8B5CF6';
    default: return '#6B7280';
  }
}

export const ACTION_RECOMMENDATIONS: Record<string, { low: string[]; mid: string[]; high: string[] }> = {
  dharma: {
    low: ['Identify your top 5 core values and write them down', 'Start a daily reflection practice on ethical choices', 'Volunteer or serve others once a week'],
    mid: ['Deepen your understanding of your life purpose', 'Take on more responsibility in community service', 'Practice radical honesty for 30 days'],
    high: ['Mentor others on values-based living', 'Teach or share your dharmic path', 'Integrate dharma into every decision'],
  },
  artha: {
    low: ['Create a monthly budget and track expenses', 'Set 3-month financial goals', 'Learn a new skill for career growth'],
    mid: ['Build an emergency fund of 6 months expenses', 'Seek mentorship for career advancement', 'Diversify income sources'],
    high: ['Invest in wealth creation strategies', 'Use wealth for social impact', 'Teach financial literacy to others'],
  },
  kama: {
    low: ['Schedule quality time with loved ones weekly', 'Pick up a hobby that brings joy', 'Practice expressing love and appreciation daily'],
    mid: ['Deepen your intimate relationships', 'Explore art, music, or nature regularly', 'Balance desire with contentment'],
    high: ['Share your joy with others', 'Create beauty in your environment', 'Guide others in healthy desire management'],
  },
  moksha: {
    low: ['Start with 5 minutes of daily meditation', 'Read one spiritual text per month', 'Practice letting go of one attachment this week'],
    mid: ['Attend a meditation retreat', 'Study deeper spiritual philosophies', 'Practice mindfulness in daily activities'],
    high: ['Deepen your sadhana practice', 'Guide others on spiritual path', 'Live with equanimity in all situations'],
  },
};

export const DANGER_MESSAGES: Record<string, string> = {
  dharma: '⚠️ Your sense of purpose and ethics needs attention. Without dharma, other pursuits lose meaning.',
  artha: '⚠️ Financial instability creates stress. Focus on building a stable material foundation.',
  kama: '⚠️ Emotional fulfillment is lacking. Nurture your relationships and sources of joy.',
  moksha: '⚠️ Spiritual disconnection can lead to emptiness. Start small with daily mindfulness.',
};
