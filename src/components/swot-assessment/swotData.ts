export interface SwotItem {
  text: string;
  importance: number; // 1-5
  category: string;
}

export interface SwotQuadrant {
  id: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
  name: string;
  emoji: string;
  colorClass: string;
  description: string;
  guidingQuestions: string[];
  categories: string[];
}

export const SWOT_QUADRANTS: SwotQuadrant[] = [
  {
    id: 'strengths',
    name: 'Strengths',
    emoji: '💪',
    colorClass: 'text-green-600',
    description: 'Internal positive attributes you can leverage',
    guidingQuestions: [
      'What skills or talents do you excel at?',
      'What resources or support do you have?',
      'What do others say you do well?',
      'What unique advantages do you possess?',
    ],
    categories: ['Skills', 'Knowledge', 'Resources', 'Character', 'Network', 'Experience'],
  },
  {
    id: 'weaknesses',
    name: 'Weaknesses',
    emoji: '🔧',
    colorClass: 'text-red-500',
    description: 'Internal areas that need improvement',
    guidingQuestions: [
      'What tasks do you avoid because of lack of confidence?',
      'Where do you lack education or training?',
      'What habits hold you back?',
      'What do others see as your weaknesses?',
    ],
    categories: ['Skills Gap', 'Habits', 'Mindset', 'Resources', 'Health', 'Knowledge'],
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    emoji: '🌟',
    colorClass: 'text-blue-600',
    description: 'External factors you can take advantage of',
    guidingQuestions: [
      'What trends could you benefit from?',
      'Are there new skills you could develop?',
      'Who could help or mentor you?',
      'What changes in your industry or field create openings?',
    ],
    categories: ['Career', 'Education', 'Networking', 'Technology', 'Market', 'Relationships'],
  },
  {
    id: 'threats',
    name: 'Threats',
    emoji: '⚡',
    colorClass: 'text-orange-500',
    description: 'External factors that could cause trouble',
    guidingQuestions: [
      'What obstacles do you currently face?',
      'Are any of your weaknesses becoming threats?',
      'What changes could threaten your progress?',
      'What is your competition doing?',
    ],
    categories: ['Competition', 'Economy', 'Health Risk', 'Time', 'Technology', 'Environment'],
  },
];

export interface SwotScores {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export const DEFAULT_SWOT: SwotScores = {
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
};

export function getSwotBalance(scores: SwotScores): {
  internalRatio: number;
  externalRatio: number;
  overallBalance: number;
} {
  const sWeight = scores.strengths.reduce((sum, i) => sum + i.importance, 0) || 0;
  const wWeight = scores.weaknesses.reduce((sum, i) => sum + i.importance, 0) || 0;
  const oWeight = scores.opportunities.reduce((sum, i) => sum + i.importance, 0) || 0;
  const tWeight = scores.threats.reduce((sum, i) => sum + i.importance, 0) || 0;

  const internalRatio = sWeight + wWeight > 0 ? sWeight / (sWeight + wWeight) : 0.5;
  const externalRatio = oWeight + tWeight > 0 ? oWeight / (oWeight + tWeight) : 0.5;
  const total = sWeight + oWeight + wWeight + tWeight;
  const overallBalance = total > 0 ? (sWeight + oWeight) / total : 0.5;

  return { internalRatio, externalRatio, overallBalance };
}

export function getQuadrantHealth(ratio: number): { label: string; color: string } {
  if (ratio >= 0.65) return { label: 'Strong', color: 'text-green-600' };
  if (ratio >= 0.45) return { label: 'Balanced', color: 'text-blue-600' };
  return { label: 'Needs Attention', color: 'text-red-500' };
}

export const STRATEGY_MATRIX = [
  { id: 'leverage', label: '🚀 Leverage (S+O)', description: 'Use strengths to capitalize on opportunities', colorClass: 'bg-green-50 border-green-200' },
  { id: 'defend', label: '🛡️ Defend (S+T)', description: 'Use strengths to counter threats', colorClass: 'bg-blue-50 border-blue-200' },
  { id: 'improve', label: '📈 Improve (W+O)', description: 'Overcome weaknesses to pursue opportunities', colorClass: 'bg-amber-50 border-amber-200' },
  { id: 'mitigate', label: '🔒 Mitigate (W+T)', description: 'Minimize weaknesses to avoid threats', colorClass: 'bg-red-50 border-red-200' },
];
