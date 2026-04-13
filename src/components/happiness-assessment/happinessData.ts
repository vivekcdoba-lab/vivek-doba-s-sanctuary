export interface HappinessScores {
  life_satisfaction: number;
  positive_emotions: number;
  engagement: number;
  relationships: number;
  meaning: number;
  accomplishment: number;
  health: number;
  gratitude: number;
}

export const DEFAULT_SCORES: HappinessScores = {
  life_satisfaction: 5, positive_emotions: 5, engagement: 5, relationships: 5,
  meaning: 5, accomplishment: 5, health: 5, gratitude: 5,
};

export interface HappinessDimension {
  id: keyof HappinessScores;
  name: string;
  emoji: string;
  color: string;
  description: string;
  guidingQuestions: string[];
}

export const HAPPINESS_DIMENSIONS: HappinessDimension[] = [
  { id: 'life_satisfaction', name: 'Life Satisfaction', emoji: '🌟', color: '#F59E0B', description: 'Overall contentment with your life as a whole', guidingQuestions: ['How satisfied are you with your life overall?', 'Do you feel your life is close to your ideal?', 'Would you change much if you could live your life over?'] },
  { id: 'positive_emotions', name: 'Positive Emotions', emoji: '😊', color: '#EC4899', description: 'Frequency of joy, love, hope, and amusement', guidingQuestions: ['How often do you feel joyful during the day?', 'Do you frequently experience love and warmth?', 'Are you generally optimistic about the future?'] },
  { id: 'engagement', name: 'Engagement', emoji: '🎯', color: '#3B82F6', description: 'Being absorbed in activities, experiencing flow', guidingQuestions: ['Do you often lose track of time in activities?', 'Do you feel fully engaged in your work?', 'Are you passionate about your hobbies?'] },
  { id: 'relationships', name: 'Relationships', emoji: '❤️', color: '#EF4444', description: 'Quality of connections with family, friends, and community', guidingQuestions: ['Do you have close, supportive relationships?', 'Do you feel loved and valued by others?', 'Are you part of a community you care about?'] },
  { id: 'meaning', name: 'Meaning & Purpose', emoji: '🧭', color: '#8B5CF6', description: 'Sense of purpose and belonging to something bigger', guidingQuestions: ['Do you feel your life has clear purpose?', 'Are your daily activities meaningful?', 'Do you contribute to something beyond yourself?'] },
  { id: 'accomplishment', name: 'Accomplishment', emoji: '🏆', color: '#10B981', description: 'Pursuing and achieving goals, sense of mastery', guidingQuestions: ['Are you making progress toward your goals?', 'Do you feel a sense of accomplishment regularly?', 'Are you developing new skills or abilities?'] },
  { id: 'health', name: 'Health & Vitality', emoji: '💪', color: '#14B8A6', description: 'Physical health, energy, and well-being', guidingQuestions: ['Do you have good energy throughout the day?', 'Are you sleeping well and exercising regularly?', 'Do you feel physically healthy and strong?'] },
  { id: 'gratitude', name: 'Gratitude', emoji: '🙏', color: '#F97316', description: 'Appreciation for what you have, thankfulness', guidingQuestions: ['Do you regularly feel grateful for your life?', 'Can you easily list things you appreciate?', 'Do you express gratitude to others?'] },
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
  life_satisfaction: { low: ['Write down 3 things going well in your life', 'Set one meaningful goal for this month', 'Practice "best possible self" visualization'], mid: ['Review and adjust your life priorities', 'Plan something you look forward to each week', 'Connect with a mentor or coach'], high: ['Share your life wisdom with others', 'Help someone struggling with satisfaction', 'Deepen what brings you contentment'] },
  positive_emotions: { low: ['Start a daily gratitude journal', 'Schedule one fun activity per day', 'Practice loving-kindness meditation'], mid: ['Cultivate a positive morning routine', 'Surround yourself with uplifting people', 'Watch/read inspiring content daily'], high: ['Spread positivity to others', 'Mentor someone in emotional well-being', 'Create joyful experiences for others'] },
  engagement: { low: ['Identify activities that make you lose track of time', 'Minimize distractions during focused work', 'Try a new creative hobby'], mid: ['Set challenging but achievable goals', 'Practice mindfulness during routine tasks', 'Increase complexity of your activities'], high: ['Teach flow techniques to others', 'Take on stretch challenges', 'Design your day around peak engagement'] },
  relationships: { low: ['Reach out to one person today', 'Schedule weekly quality time with loved ones', 'Practice active listening'], mid: ['Deepen existing friendships', 'Join a community group', 'Express appreciation to someone daily'], high: ['Be a relationship role model', 'Organize community events', 'Mentor others in building connections'] },
  meaning: { low: ['Write your personal mission statement', 'Volunteer for a cause you care about', 'Reflect on what matters most to you'], mid: ['Align daily activities with your values', 'Find purpose in your work', 'Contribute to something bigger'], high: ['Live your purpose fully', 'Inspire meaning in others', 'Create legacy projects'] },
  accomplishment: { low: ['Set one small achievable goal today', 'Track your daily wins', 'Celebrate small progress'], mid: ['Set stretch goals with deadlines', 'Learn a challenging new skill', 'Seek feedback on your growth'], high: ['Mentor others in goal-setting', 'Take on leadership roles', 'Share your achievement strategies'] },
  health: { low: ['Walk for 20 minutes today', 'Improve your sleep routine', 'Drink 8 glasses of water daily'], mid: ['Establish a regular exercise routine', 'Focus on nutrition quality', 'Practice stress management techniques'], high: ['Optimize your fitness level', 'Help others get healthy', 'Explore advanced wellness practices'] },
  gratitude: { low: ['Write 3 things you are grateful for tonight', 'Thank someone who helped you', 'Notice small blessings throughout the day'], mid: ['Keep a gratitude journal', 'Write gratitude letters monthly', 'Practice gratitude meditation'], high: ['Lead gratitude circles', 'Express appreciation publicly', 'Create gratitude rituals for others'] },
};
