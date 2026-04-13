export interface MoochScores {
  overthinking: number;
  negativity: number;
  comparison: number;
  fear: number;
  attachment: number;
  resistance: number;
}

export const DEFAULT_SCORES: MoochScores = {
  overthinking: 5, negativity: 5, comparison: 5, fear: 5, attachment: 5, resistance: 5,
};

export interface MoochPattern {
  id: keyof MoochScores;
  name: string;
  emoji: string;
  color: string;
  description: string;
  guidingQuestions: string[];
}

// NOTE: In MOOCH, HIGH score = STRONG pattern = needs MORE attention (inverse of other assessments)
export const MOOCH_PATTERNS: MoochPattern[] = [
  { id: 'overthinking', name: 'Overthinking', emoji: '🌀', color: '#EF4444', description: 'Excessive analysis, rumination, and mental loops', guidingQuestions: ['Do you replay conversations in your head?', 'Do you analyze situations excessively before acting?', 'Is it hard to quiet your mind at night?'] },
  { id: 'negativity', name: 'Negativity Bias', emoji: '☁️', color: '#6366F1', description: 'Tendency to focus on negative aspects and worst-case scenarios', guidingQuestions: ['Do you tend to see the negative side first?', 'Do you dwell on criticism more than praise?', 'Do you expect things to go wrong?'] },
  { id: 'comparison', name: 'Comparison', emoji: '⚖️', color: '#F59E0B', description: 'Measuring yourself against others, social comparison', guidingQuestions: ['Do you often compare yourself to others?', 'Does social media make you feel inadequate?', 'Do you feel jealous of others\' success?'] },
  { id: 'fear', name: 'Fear & Anxiety', emoji: '😰', color: '#EC4899', description: 'Worry about future, fear of failure, anxiety patterns', guidingQuestions: ['Do you worry excessively about the future?', 'Does fear of failure stop you from trying?', 'Do you feel anxious in new situations?'] },
  { id: 'attachment', name: 'Attachment', emoji: '🔗', color: '#14B8A6', description: 'Clinging to people, things, outcomes, or past experiences', guidingQuestions: ['Do you have difficulty letting go of things?', 'Are you overly attached to outcomes?', 'Do you cling to past experiences or relationships?'] },
  { id: 'resistance', name: 'Resistance to Change', emoji: '🧱', color: '#8B5CF6', description: 'Difficulty accepting change, rigidity, comfort zone addiction', guidingQuestions: ['Do you resist new situations or routines?', 'Is change stressful for you?', 'Do you prefer staying in your comfort zone?'] },
];

// For MOOCH: low intensity (1-3) = healthy, mid (4-6) = moderate, high (7-10) = needs attention
export function getIntensityZone(score: number): 'healthy' | 'moderate' | 'intense' | 'critical' {
  if (score <= 3) return 'healthy';
  if (score <= 5) return 'moderate';
  if (score <= 7) return 'intense';
  return 'critical';
}

export function getIntensityColor(zone: string): string {
  switch (zone) {
    case 'healthy': return '#10B981';
    case 'moderate': return '#F59E0B';
    case 'intense': return '#F97316';
    case 'critical': return '#EF4444';
    default: return '#6B7280';
  }
}

export const TRANSFORMATION_STRATEGIES: Record<string, { high: string[]; mid: string[]; low: string[] }> = {
  overthinking: { high: ['Practice "thought stopping" — say STOP when spiraling', 'Set a 5-minute timer for decisions', 'Write thoughts in a journal to externalize them'], mid: ['Practice mindfulness meditation daily', 'Use the 5-4-3-2-1 grounding technique', 'Set specific worry time (15 min/day)'], low: ['Maintain your healthy thinking patterns', 'Share strategies with others who overthink', 'Continue mindfulness practice'] },
  negativity: { high: ['Challenge each negative thought with evidence', 'Practice "3 good things" exercise nightly', 'Limit exposure to negative news/media'], mid: ['Reframe one negative thought daily', 'Surround yourself with positive people', 'Practice gratitude journaling'], low: ['Keep nurturing your positive outlook', 'Be a source of positivity for others', 'Celebrate your balanced perspective'] },
  comparison: { high: ['Take a social media detox for 1 week', 'Write your unique strengths and achievements', 'Practice "compare with your past self" only'], mid: ['Limit social media to 30 min/day', 'Celebrate others\' success genuinely', 'Focus on your own progress metrics'], low: ['Maintain healthy self-awareness', 'Inspire others with your self-acceptance', 'Continue focusing on personal growth'] },
  fear: { high: ['Face one small fear daily', 'Practice deep breathing when anxious', 'Write down worst-case vs likely-case scenarios'], mid: ['Expand your comfort zone weekly', 'Use visualization for upcoming challenges', 'Practice progressive muscle relaxation'], low: ['Channel your courage into new adventures', 'Help others overcome their fears', 'Keep building resilience'] },
  attachment: { high: ['Practice letting go of one small thing today', 'Meditate on impermanence', 'Focus on experiences over possessions'], mid: ['Practice non-attachment in daily decisions', 'Accept outcomes without judging them', 'Develop flexibility in relationships'], low: ['Enjoy healthy non-attachment', 'Share wisdom about letting go', 'Deepen your equanimity practice'] },
  resistance: { high: ['Try one new thing this week', 'Reframe change as opportunity', 'Start with tiny changes to build comfort'], mid: ['Seek novelty in your routine', 'Say yes to unexpected invitations', 'Learn from past successful changes'], low: ['Embrace your adaptability', 'Help others navigate change', 'Continue exploring new possibilities'] },
};
