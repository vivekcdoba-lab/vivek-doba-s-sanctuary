export interface FiroBScores {
  eI: number; wI: number; eC: number; wC: number; eA: number; wA: number;
}

export const DEFAULT_SCORES: FiroBScores = { eI: 0, wI: 0, eC: 0, wC: 0, eA: 0, wA: 0 };

export interface FiroBDimension {
  code: keyof FiroBScores;
  label: string;
  description: string;
  emoji: string;
  color: string;
  maxScore: number;
}

export const FIRO_B_DIMENSIONS: FiroBDimension[] = [
  { code: 'eI', label: 'Expressed Inclusion', description: 'How much you reach out to include others', emoji: '🤝', color: '#3B82F6', maxScore: 9 },
  { code: 'wI', label: 'Wanted Inclusion', description: 'How much you want others to include you', emoji: '🏠', color: '#60A5FA', maxScore: 9 },
  { code: 'eC', label: 'Expressed Control', description: 'How much you try to influence others', emoji: '👑', color: '#F59E0B', maxScore: 9 },
  { code: 'wC', label: 'Wanted Control', description: 'How much you want others to guide you', emoji: '🎯', color: '#FBBF24', maxScore: 9 },
  { code: 'eA', label: 'Expressed Affection', description: 'How much warmth you show to others', emoji: '💖', color: '#EC4899', maxScore: 9 },
  { code: 'wA', label: 'Wanted Affection', description: 'How much warmth you want from others', emoji: '🫂', color: '#F472B6', maxScore: 9 },
];

export const FIRO_B_QUESTIONS: Record<string, string[]> = {
  eI: [
    'I invite other people to do things with me.',
    'I try to include other people in my plans.',
    'I join social groups and activities.',
    'I make efforts to mix with people.',
    'I try to get people involved with me.',
    'I like to include other people in my activities.',
    'I try to be with groups of people.',
    'I join in when others are doing things together.',
    'I try to be part of social gatherings.',
  ],
  wI: [
    'I like people to include me in their activities.',
    'I like people to invite me to join their plans.',
    'I like it when people notice me.',
    'I want people to include me in their social gatherings.',
    'I like it when people actively include me.',
    'I want to be accepted by others.',
    'I like people to invite me to things.',
    'I want others to include me in their groups.',
    'I like to feel that I belong to a group.',
  ],
  eC: [
    'I try to influence the actions of other people.',
    'I try to take charge of things when I am with people.',
    'I try to have others do things the way I want.',
    'I try to control the outcome of situations.',
    'I try to make decisions when I\'m with others.',
    'I try to get others to follow my approach.',
    'I try to dominate the social situation.',
    'I tell people what to do.',
    'I try to lead others in group settings.',
  ],
  wC: [
    'I let other people decide what to do.',
    'I let other people take charge of things.',
    'I like other people to make decisions for me.',
    'I let others control what I do.',
    'I let other people strongly influence my actions.',
    'I like others to tell me how to do things.',
    'I am easily led by people.',
    'I let others decide what to do when I am with them.',
    'I want others to take charge of situations.',
  ],
  eA: [
    'I try to be friendly toward people.',
    'I try to have close relationships with people.',
    'I try to have warm relationships with people.',
    'I act warm toward other people.',
    'I try to get close to people.',
    'I try to have intimate relationships with people.',
    'I express affection to people.',
    'I show personal interest in people.',
    'I confide in people.',
  ],
  wA: [
    'I like people to act friendly toward me.',
    'I like people to get close to me.',
    'I want people to show warmth toward me.',
    'I like people to share feelings with me.',
    'I like others to be affectionate to me.',
    'I want others to trust me with their secrets.',
    'I like to have deep personal connections.',
    'I want others to express care toward me.',
    'I want people to be emotionally open with me.',
  ],
};

export function getLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  return 'High';
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'Low': return '#3B82F6';
    case 'Medium': return '#F59E0B';
    case 'High': return '#EF4444';
    default: return '#6B7280';
  }
}

export const INTERPERSONAL_INSIGHTS: Record<string, { low: string; mid: string; high: string }> = {
  eI: { low: 'You tend to be selective about who you include. This can mean deep but few connections.', mid: 'You balance including others comfortably. You can both lead and participate socially.', high: 'You actively seek to include others. You are a natural connector and community builder.' },
  wI: { low: 'You are comfortable being independent and don\'t need much social inclusion.', mid: 'You enjoy being included but aren\'t dependent on it. Good social balance.', high: 'You strongly desire to be included. Being left out can be particularly painful for you.' },
  eC: { low: 'You prefer collaborative approaches over directing others. You\'re easy-going about control.', mid: 'You can lead when needed but also step back. Balanced approach to authority.', high: 'You naturally take charge and direct situations. You prefer structure and clear authority.' },
  wC: { low: 'You prefer autonomy and making your own decisions. You resist being controlled.', mid: 'You can accept guidance while maintaining your independence. Flexible with authority.', high: 'You are comfortable with others taking the lead. You trust guidance from authority figures.' },
  eA: { low: 'You tend to be reserved in showing affection. Emotional expression is selective.', mid: 'You show warmth in comfortable settings. Balanced emotional expression.', high: 'You freely express warmth and affection. You create emotionally rich environments.' },
  wA: { low: 'You don\'t require much emotional reassurance from others. You\'re self-sufficient emotionally.', mid: 'You appreciate affection without being dependent on it. Healthy emotional needs.', high: 'You desire strong emotional connections and warmth from others.' },
};

export const ACTION_RECOMMENDATIONS: Record<string, string[]> = {
  eI: ['Practice initiating social plans', 'Join a new group or club', 'Organize a small gathering this week'],
  wI: ['Communicate your social needs clearly', 'Practice self-inclusion — join without waiting for invites', 'Build your own sense of belonging internally'],
  eC: ['Practice delegating decisions', 'Ask others for their opinions before deciding', 'Lead with questions, not directives'],
  wC: ['Practice making small decisions independently', 'Set boundaries around others\' influence', 'Develop your own decision-making framework'],
  eA: ['Express appreciation to someone today', 'Practice vulnerability in safe relationships', 'Show interest in others\' feelings'],
  wA: ['Communicate your emotional needs to trusted people', 'Practice self-compassion as a primary source of warmth', 'Create rituals of connection with loved ones'],
};
