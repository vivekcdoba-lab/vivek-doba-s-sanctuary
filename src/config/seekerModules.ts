// Single source of truth for seeker modules subject to per-seeker access control.
// Sidebar (SeekerLayout) and ModuleGuard both consult this registry.

export interface SeekerModule {
  key: string;       // canonical, stable key stored in DB
  label: string;     // shown in admin Access tab
  path: string;      // matches the route in App.tsx
  alwaysOn?: boolean; // never gated (Home, Profile, Help, Notifications, Privacy)
}

export interface SeekerModuleGroup {
  group: string;       // e.g. "Daily Practice"
  emoji: string;
  section: string;     // top-level section: HOME, MY JOURNEY, PURUSHAARTH, RESOURCES, SETTINGS
  modules: SeekerModule[];
}

export const SEEKER_MODULE_REGISTRY: SeekerModuleGroup[] = [
  {
    group: 'Home', emoji: '🏠', section: 'HOME', modules: [
      { key: 'home.dashboard', label: 'Dashboard', path: '/seeker/home', alwaysOn: true },
      { key: 'home.journey', label: 'My Journey', path: '/seeker/transformation' },
    ],
  },
  {
    group: 'Daily Practice', emoji: '📝', section: 'MY JOURNEY', modules: [
      { key: 'daily.worksheet', label: "Today's Worksheet", path: '/seeker/worksheet' },
      { key: 'daily.timesheet', label: 'Time Sheet', path: '/seeker/timesheet' },
      { key: 'daily.challenges', label: 'Challenges', path: '/seeker/challenges' },
      { key: 'daily.worksheet_history', label: 'Worksheet History', path: '/seeker/worksheet-history' },
      { key: 'daily.streaks', label: 'My Streaks', path: '/seeker/streaks' },
      { key: 'daily.weekly_review', label: 'Weekly Review', path: '/seeker/weekly-review' },
      { key: 'daily.gratitude_wall', label: 'Gratitude Wall', path: '/seeker/gratitude-wall' },
      { key: 'daily.win_journal', label: 'Win Journal', path: '/seeker/win-journal' },
    ],
  },
  {
    group: 'Assessments', emoji: '📋', section: 'MY JOURNEY', modules: [
      { key: 'assess.wol', label: 'Wheel of Life', path: '/seeker/assessments/wheel-of-life' },
      { key: 'assess.swot', label: 'SWOT Analysis', path: '/seeker/assessments/swot' },
      { key: 'assess.lgt', label: 'LGT Dimension', path: '/seeker/assessments/lgt' },
      { key: 'assess.purusharthas', label: 'Purusharthas', path: '/seeker/assessments/purusharthas' },
      { key: 'assess.happiness', label: 'Happiness Index', path: '/seeker/assessments/happiness' },
      { key: 'assess.mooch', label: 'MOOCH Patterns', path: '/seeker/assessments/mooch' },
      { key: 'assess.firob', label: 'FIRO-B', path: '/seeker/assessments/firo-b' },
      { key: 'assess.history', label: 'Assessment History', path: '/seeker/assessments/history' },
      { key: 'assess.personality', label: 'Personality Type', path: '/seeker/personality' },
      { key: 'assess.progress_charts', label: 'My Progress Charts', path: '/seeker/progress-charts' },
    ],
  },
  {
    group: 'Sessions', emoji: '📚', section: 'MY JOURNEY', modules: [
      { key: 'sessions.upcoming', label: 'Upcoming Sessions', path: '/seeker/upcoming-sessions' },
      { key: 'sessions.live', label: 'Join Live Session', path: '/seeker/live-session' },
      { key: 'sessions.notes', label: 'Session Notes', path: '/seeker/session-notes' },
      { key: 'sessions.history', label: 'Session History', path: '/seeker/session-history' },
      { key: 'sessions.feedback', label: 'Give Feedback', path: '/seeker/feedback' },
    ],
  },
  {
    group: 'Assignments', emoji: '✅', section: 'MY JOURNEY', modules: [
      { key: 'assign.pending', label: 'Pending Tasks', path: '/seeker/tasks' },
      { key: 'assign.completed', label: 'Completed Tasks', path: '/seeker/completed-tasks' },
      { key: 'assign.submit', label: 'Submit Assignment', path: '/seeker/submit-assignment' },
      { key: 'assign.coach_feedback', label: 'Coach Feedback', path: '/seeker/coach-feedback' },
    ],
  },
  {
    group: 'Dharma (Purpose)', emoji: '🕉️', section: 'PURUSHAARTH', modules: [
      { key: 'dharma.mission', label: 'My Mission', path: '/seeker/dharma/mission' },
      { key: 'dharma.values', label: 'My Values', path: '/seeker/dharma/values' },
      { key: 'dharma.journal', label: 'Dharma Journal', path: '/seeker/dharma/journal' },
      { key: 'dharma.practices', label: 'Daily Practices', path: '/seeker/dharma/practices' },
      { key: 'dharma.ikigai', label: 'IKIGAI Discovery', path: '/seeker/dharma/ikigai' },
    ],
  },
  {
    group: 'Artha (Business)', emoji: '💰', section: 'PURUSHAARTH', modules: [
      { key: 'artha.profile', label: 'Business Profile', path: '/seeker/artha/profile' },
      { key: 'artha.vision', label: 'Vision & Mission', path: '/seeker/artha/vision' },
      { key: 'artha.values', label: 'Core Values', path: '/seeker/artha/values' },
      { key: 'artha.swot', label: 'SWOT Analysis', path: '/seeker/artha/swot' },
      { key: 'artha.marketing', label: 'Marketing Strategy', path: '/seeker/artha/marketing' },
      { key: 'artha.branding', label: 'Branding Strategy', path: '/seeker/artha/branding' },
      { key: 'artha.sales', label: 'Sales Strategy', path: '/seeker/artha/sales' },
      { key: 'artha.accounting', label: 'Accounting & Finance', path: '/seeker/artha/accounting' },
      { key: 'artha.cashflow', label: 'Cash Flow Tracker', path: '/seeker/artha/cashflow' },
      { key: 'artha.team', label: 'Team Building', path: '/seeker/artha/team' },
      { key: 'artha.rnd', label: 'R&D / Innovation', path: '/seeker/artha/rnd' },
      { key: 'artha.satisfaction', label: 'Client Satisfaction', path: '/seeker/artha/satisfaction' },
      { key: 'artha.competitors', label: 'Competitor Analysis', path: '/seeker/artha/competitors' },
      { key: 'artha.departments', label: 'Department Health', path: '/seeker/artha/departments' },
      { key: 'artha.dashboard', label: 'Business Dashboard', path: '/seeker/artha/dashboard' },
    ],
  },
  {
    group: 'Kama (Relationships)', emoji: '❤️', section: 'PURUSHAARTH', modules: [
      { key: 'kama.goals', label: 'Relationship Goals', path: '/seeker/kama/goals' },
      { key: 'kama.family', label: 'Family Harmony', path: '/seeker/kama/family' },
      { key: 'kama.social', label: 'Social Connections', path: '/seeker/kama/social' },
      { key: 'kama.desires', label: 'Desire Fulfillment', path: '/seeker/kama/desires' },
      { key: 'kama.tracker', label: 'Relationship Tracker', path: '/seeker/kama/relationships' },
    ],
  },
  {
    group: 'Moksha (Liberation)', emoji: '☀️', section: 'PURUSHAARTH', modules: [
      { key: 'moksha.mindfulness', label: 'Daily Mindfulness', path: '/seeker/daily-mindfulness' },
      { key: 'moksha.meditation', label: 'Meditation Practice', path: '/seeker/moksha/meditation' },
      { key: 'moksha.timer', label: 'Meditation Timer', path: '/seeker/moksha/meditation-timer' },
      { key: 'moksha.goals', label: 'Spiritual Goals', path: '/seeker/moksha/goals' },
      { key: 'moksha.journal', label: 'Inner Peace Journal', path: '/seeker/moksha/journal' },
      { key: 'moksha.consciousness', label: 'Consciousness Growth', path: '/seeker/moksha/consciousness' },
    ],
  },
  {
    group: 'Learning', emoji: '📚', section: 'RESOURCES', modules: [
      { key: 'learning.videos', label: 'Video Library', path: '/seeker/learning/videos' },
      { key: 'learning.audio', label: 'Audio Meditations', path: '/seeker/learning/audio' },
      { key: 'learning.pdfs', label: 'PDF Resources', path: '/seeker/learning/pdfs' },
      { key: 'learning.frameworks', label: 'Frameworks & Models', path: '/seeker/learning/frameworks' },
      { key: 'learning.bookmarks', label: 'My Bookmarks', path: '/seeker/learning/bookmarks' },
    ],
  },
  {
    group: 'Ambient Sounds', emoji: '🎧', section: 'RESOURCES', modules: [
      { key: 'sounds.player', label: 'Sound Player', path: '/seeker/sacred-space' },
    ],
  },
  {
    group: 'Messages', emoji: '💬', section: 'RESOURCES', modules: [
      { key: 'messages.chat', label: 'Chat with Coach', path: '/seeker/messages' },
      { key: 'messages.announcements', label: 'Announcements', path: '/seeker/announcements' },
    ],
  },
  {
    group: 'Achievements', emoji: '🏆', section: 'RESOURCES', modules: [
      { key: 'achievements.badges', label: 'My Badges', path: '/seeker/badges' },
      { key: 'achievements.points', label: 'Points & Levels', path: '/seeker/points' },
      { key: 'achievements.leaderboard', label: 'Leaderboard', path: '/seeker/leaderboard' },
    ],
  },
  {
    group: 'Settings', emoji: '⚙️', section: 'SETTINGS', modules: [
      { key: 'settings.profile', label: 'My Profile', path: '/seeker/profile', alwaysOn: true },
      { key: 'settings.notifications', label: 'Notifications', path: '/seeker/notifications', alwaysOn: true },
      { key: 'settings.privacy', label: 'Privacy', path: '/seeker/privacy-settings', alwaysOn: true },
      { key: 'settings.help', label: 'Help & Support', path: '/seeker/help', alwaysOn: true },
    ],
  },
];

export const ALL_SEEKER_MODULES: SeekerModule[] =
  SEEKER_MODULE_REGISTRY.flatMap(g => g.modules);

export const PATH_TO_MODULE: Record<string, SeekerModule> =
  ALL_SEEKER_MODULES.reduce((acc, m) => { acc[m.path] = m; return acc; }, {} as Record<string, SeekerModule>);

export const KEY_TO_MODULE: Record<string, SeekerModule> =
  ALL_SEEKER_MODULES.reduce((acc, m) => { acc[m.key] = m; return acc; }, {} as Record<string, SeekerModule>);

export function moduleForPath(pathname: string): SeekerModule | undefined {
  // exact match first
  if (PATH_TO_MODULE[pathname]) return PATH_TO_MODULE[pathname];
  // prefix match for nested routes (e.g. /seeker/sessions/:id derives from /seeker/session-history)
  return ALL_SEEKER_MODULES.find(m => pathname === m.path || pathname.startsWith(m.path + '/'));
}
