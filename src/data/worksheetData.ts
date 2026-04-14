// Activity groups for the 24-hour timesheet
export const ACTIVITY_GROUPS = [
  {
    group: '🌸 SPIRITUAL & SOUL (Moksha)',
    pillar: 'moksha',
    items: [
      'Brahma Muhurta Sadhana', 'Puja / Aarti / Archana', 'Meditation (Dhyana)',
      'Pranayama / Breathing Practice', 'Mantra Chanting / Japa', 'Gratitude Practice',
      'Visualization / Sankalp Shakti', 'Reading Spiritual Texts', 'Silent Sitting / Contemplation',
      'Yoga Nidra', 'Evening Aarti / Prayer', 'Nature Walk (Mindful)', 'Commute Prayer / Car Japa',
      'Svadhyaya (Self-Study of Sacred Texts)',
    ],
  },
  {
    group: '🏋️ HEALTH & BODY (Dharma)',
    pillar: 'dharma',
    items: [
      'Sleep (Night / Main)', 'Power Nap', 'Morning Exercise / Workout', 'Yoga Asanas',
      'Stretching / Mobility', 'Walk / Running / Cardio', 'Strength Training',
      'Sports / Outdoor Activity', 'Body Care / Self-Love Ritual', 'Oil Massage / Abhyanga',
      'Rest / Recovery', 'Supplements / Vitamins', 'Cold Shower / Hydrotherapy',
    ],
  },
  {
    group: '🍽️ FOOD & NOURISHMENT',
    pillar: 'dharma',
    items: [
      'Early Morning Detox Drink', 'Breakfast (Nashta)', 'Mid-Morning Snack', 'Lunch',
      'Afternoon Snack / Chai', 'Dinner (Raat ka Khana)', 'Meal Prep / Cooking',
      'Fasting / Upvas', 'Water Intake Log',
    ],
  },
  {
    group: '📚 LEARNING & GROWTH',
    pillar: 'dharma',
    items: [
      'Book Reading', 'Online Course / Webinar', 'Journaling / Reflection', 'Podcast / Audio Learning',
      'Research / Study Time', 'Skill Practice', 'Creative Writing', 'Mentor / Coach Call',
    ],
  },
  {
    group: '💰 ARTHA — MONEY & BUSINESS',
    pillar: 'artha',
    items: [
      'Deep Work / Focus Block', 'Client Call / Meeting', 'New Business Meeting',
      'Follow-Up / Lead Nurturing', 'Money Review / Financial Planning', 'Invoice / Admin / Accounts',
      'Marketing / Content Creation', 'Social Media Strategy', 'Email & Communication',
      'Sales Call / Closing', 'Networking / Collaboration', 'Business Development Planning',
      'LGT Coaching Session', 'Corporate Training Delivery',
    ],
  },
  {
    group: '👨‍👩‍👧 RELATIONSHIPS & KAMA',
    pillar: 'kama',
    items: [
      'Family Time', 'Quality Time with Spouse', 'Children Time / Parenting',
      'Friends & Social Connection', 'Community / Social Service', 'Fun / Entertainment',
      'Hobby Time', 'Accountability Buddy Call',
    ],
  },
  {
    group: '🧘 SELF-LOVE & WELLBEING',
    pillar: 'moksha',
    items: [
      'Self-Love Ritual / Mirror Work', 'Digital Detox', 'Leisure / Relaxation',
      'Creative Expression', 'Affirmations / EFT Tapping', 'Gratitude Journaling',
      'Vision Board Review', 'Breathwork',
    ],
  },
  {
    group: '🏠 HOME & DAILY LIFE',
    pillar: 'dharma',
    items: [
      'Morning Office Rituals', 'Household Duties', 'Shopping / Errands', 'Travel / Commute',
      'Getting Ready / Grooming', 'Personal Admin / Planning', 'Sleep Preparation',
      'Weekly Planning Session',
    ],
  },
];

export const DEFAULT_NON_NEGOTIABLES = [
  { habit_name: 'Brahma Muhurta Wake-Up (before 5:30 AM)', lgt_pillar: 'moksha' },
  { habit_name: 'Morning Puja / Aarti completed', lgt_pillar: 'moksha' },
  { habit_name: 'Pranayama / Breathing Practice done', lgt_pillar: 'dharma' },
  { habit_name: 'Meditation completed', lgt_pillar: 'moksha' },
  { habit_name: 'Physical Exercise / Yoga done', lgt_pillar: 'dharma' },
  { habit_name: 'Healthy Breakfast eaten', lgt_pillar: 'dharma' },
  { habit_name: 'Daily Sankalp (intention) written', lgt_pillar: 'moksha' },
  { habit_name: 'Gratitude written (3 items)', lgt_pillar: 'moksha' },
  { habit_name: 'No screen for first 30 minutes', lgt_pillar: 'dharma' },
  { habit_name: 'Water intake started (min 2 glasses)', lgt_pillar: 'dharma' },
  { habit_name: 'Read / Listen to something uplifting', lgt_pillar: 'dharma' },
  { habit_name: 'LGT Worksheet filled for today', lgt_pillar: 'moksha' },
];

export const MOOD_OPTIONS = [
  { emoji: '😴', label: 'Just Woke Up' },
  { emoji: '🔥', label: 'Energized' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😟', label: 'Anxious' },
  { emoji: '🙏', label: 'Grateful' },
];

export const PILLAR_CONFIG = {
  dharma: { label: 'Dharma', icon: '🟠', color: '#F97316', bgClass: 'bg-orange-500', lightBg: 'bg-orange-50', textClass: 'text-orange-600' },
  artha: { label: 'Artha', icon: '💛', color: '#EAB308', bgClass: 'bg-yellow-500', lightBg: 'bg-yellow-50', textClass: 'text-yellow-600' },
  kama: { label: 'Kama', icon: '🩷', color: '#EC4899', bgClass: 'bg-pink-500', lightBg: 'bg-pink-50', textClass: 'text-pink-600' },
  moksha: { label: 'Moksha', icon: '🟣', color: '#8B5CF6', bgClass: 'bg-violet-500', lightBg: 'bg-violet-50', textClass: 'text-violet-600' },
} as const;

export type PillarKey = keyof typeof PILLAR_CONFIG;

export const TIME_PHASES = [
  { start: '03:00', end: '05:30', label: '🌙 Brahma Muhurta', bgClass: 'bg-indigo-950/20' },
  { start: '06:00', end: '08:30', label: '🌅 Morning Rise', bgClass: 'bg-amber-100/50' },
  { start: '09:00', end: '12:30', label: '☀️ Peak Energy', bgClass: 'bg-white' },
  { start: '13:00', end: '16:30', label: '🌤 Afternoon Flow', bgClass: 'bg-yellow-50/50' },
  { start: '17:00', end: '19:30', label: '🌇 Evening Transition', bgClass: 'bg-orange-50/50' },
  { start: '20:00', end: '22:30', label: '🌃 Night Wind-Down', bgClass: 'bg-violet-50/50' },
  { start: '23:00', end: '02:00', label: '🌑 Sleep Zone', bgClass: 'bg-indigo-950/10' },
];

export const DAY_NAMES: Record<number, { en: string; hi: string }> = {
  0: { en: 'Sunday', hi: 'रविवार / Ravivar' },
  1: { en: 'Monday', hi: 'सोमवार / Somvar' },
  2: { en: 'Tuesday', hi: 'मंगलवार / Mangalvar' },
  3: { en: 'Wednesday', hi: 'बुधवार / Budhvar' },
  4: { en: 'Thursday', hi: 'गुरुवार / Guruvar' },
  5: { en: 'Friday', hi: 'शुक्रवार / Shukravar' },
  6: { en: 'Saturday', hi: 'शनिवार / Shanivar' },
};

export const MONEY_AFFIRMATIONS = [
  "Mera paisa badh raha hai — main deta hoon, main pata hoon",
  "Lakshmi Maa ki kripa mere upar bani rahti hai",
  "Main dhanwan hoon, aur main aur dhanwan ho raha hoon",
  "Mere paas paise aate hain aasani se aur khushi se",
  "Main apne parivaar ko samridh bana raha hoon",
  "Mera har kaam safal hota hai, aur paisa aata hai",
  "Main apne sapno ko poora karne ke liye dhanwan hoon",
  "Paise mere dost hain, mere saathi hain",
  "Main har din nayi opportunity paata hoon",
  "Mere business mein vriddhi ho rahi hai har din",
  "Main abundance ka channel hoon",
  "Meri mehnat rang la rahi hai",
  "Main grateful hoon mere paas jo hai uske liye",
  "Lakshmi dhyan se mera jeevan samridh ho raha hai",
  "Mera financial future bright hai",
  "Main har deal close karta hoon confidence se",
  "Main value create karta hoon, paisa follow karta hai",
  "Main apne worth ko jaanta hoon",
  "Main daan karta hoon, aur mujhe aur milta hai",
  "Mere andar ek successful entrepreneur hai",
  "Main apne goals achieve kar raha hoon step by step",
  "Main prosperous hoon, main abundant hoon",
  "Paisa mere liye kaam karta hai",
  "Main financially free hone ki raah par hoon",
  "Mera karma aur paisa dono aligned hain",
  "Main khushi se kamata hoon aur khushi se kharcha karta hoon",
  "Mere clients mujhse khush hain aur wapis aate hain",
  "Main apne desh aur samaaj ke liye contribute karta hoon",
  "Mera ghar samridhi se bhara hai",
  "Har subah ek nayi opportunity lekar aati hai",
];

export function generateTimeSlots() {
  const slots: { start: string; end: string; display: string }[] = [];
  // 3:00 AM to 2:00 AM next day = hours 3..25 (25 = 1 AM next day, ends at 2 AM)
  for (let h = 3; h <= 25; h++) {
    const hour = h % 24;
    for (const m of [0, 30]) {
      if (h === 25 && m === 30) break; // stop at 2:00 AM
      const nextM = m === 0 ? 30 : 0;
      const nextH = m === 0 ? hour : (hour + 1) % 24;
      const fmt = (hh: number, mm: number) => {
        const period = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
        return `${h12}:${mm.toString().padStart(2, '0')} ${period}`;
      };
      const toTime = (hh: number, mm: number) => `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
      slots.push({
        start: toTime(hour, m),
        end: toTime(nextH, nextM),
        display: fmt(hour, m),
      });
    }
  }
  return slots;
}

export function getPhaseForTime(time: string): string {
  const [h] = time.split(':').map(Number);
  if (h >= 3 && h < 6) return 'bg-indigo-950/10 dark:bg-indigo-950/30';
  if (h >= 6 && h < 9) return 'bg-amber-50 dark:bg-amber-900/10';
  if (h >= 9 && h < 13) return 'bg-background';
  if (h >= 13 && h < 17) return 'bg-yellow-50/60 dark:bg-yellow-900/5';
  if (h >= 17 && h < 20) return 'bg-orange-50/60 dark:bg-orange-900/5';
  if (h >= 20 && h < 23) return 'bg-violet-50/50 dark:bg-violet-900/5';
  return 'bg-indigo-950/5 dark:bg-indigo-950/20';
}

export function getPillarForActivity(activityName: string): PillarKey | null {
  for (const group of ACTIVITY_GROUPS) {
    if (group.items.includes(activityName)) return group.pillar as PillarKey;
  }
  return null;
}

// Template slot definitions for schedule templates
export const TEMPLATE_SLOTS: Record<string, { from: string; to: string; activity: string; pillar: PillarKey | '' }[]> = {
  'Sadhak Day': [
    { from: '03:00', to: '05:30', activity: 'Brahma Muhurta Sadhana', pillar: 'moksha' },
    { from: '05:30', to: '06:30', activity: 'Pranayama / Breathing Practice', pillar: 'moksha' },
    { from: '06:30', to: '07:00', activity: 'Yoga Asanas', pillar: 'dharma' },
    { from: '07:00', to: '07:30', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '07:30', to: '08:30', activity: 'Reading Spiritual Texts', pillar: 'moksha' },
    { from: '08:30', to: '09:00', activity: 'Journaling / Reflection', pillar: 'dharma' },
    { from: '09:00', to: '12:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '13:00', activity: 'Walk / Running / Cardio', pillar: 'dharma' },
    { from: '13:00', to: '15:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '15:00', to: '15:30', activity: 'Afternoon Snack / Chai', pillar: 'dharma' },
    { from: '15:30', to: '17:00', activity: 'Meditation (Dhyana)', pillar: 'moksha' },
    { from: '17:00', to: '18:00', activity: 'Family Time', pillar: 'kama' },
    { from: '18:00', to: '18:30', activity: 'Evening Aarti / Prayer', pillar: 'moksha' },
    { from: '18:30', to: '19:00', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '19:00', to: '20:00', activity: 'Silent Sitting / Contemplation', pillar: 'moksha' },
    { from: '20:00', to: '20:30', activity: 'Gratitude Journaling', pillar: 'moksha' },
    { from: '20:30', to: '21:00', activity: 'Sleep Preparation', pillar: 'dharma' },
    { from: '21:00', to: '03:00', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
  'Arjun Day': [
    { from: '04:00', to: '05:00', activity: 'Morning Exercise / Workout', pillar: 'dharma' },
    { from: '05:00', to: '05:30', activity: 'Meditation (Dhyana)', pillar: 'moksha' },
    { from: '05:30', to: '06:00', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '06:00', to: '06:30', activity: 'Personal Admin / Planning', pillar: 'dharma' },
    { from: '06:30', to: '09:30', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '09:30', to: '10:00', activity: 'Client Call / Meeting', pillar: 'artha' },
    { from: '10:00', to: '12:00', activity: 'Sales Call / Closing', pillar: 'artha' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '13:00', activity: 'Power Nap', pillar: 'dharma' },
    { from: '13:00', to: '15:00', activity: 'Follow-Up / Lead Nurturing', pillar: 'artha' },
    { from: '15:00', to: '17:00', activity: 'Marketing / Content Creation', pillar: 'artha' },
    { from: '17:00', to: '18:00', activity: 'Money Review / Financial Planning', pillar: 'artha' },
    { from: '18:00', to: '19:00', activity: 'Walk / Running / Cardio', pillar: 'dharma' },
    { from: '19:00', to: '20:00', activity: 'Family Time', pillar: 'kama' },
    { from: '20:00', to: '20:30', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '20:30', to: '21:00', activity: 'Book Reading', pillar: 'dharma' },
    { from: '21:00', to: '04:00', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
  'Grihastha Day': [
    { from: '05:00', to: '06:00', activity: 'Puja / Aarti / Archana', pillar: 'moksha' },
    { from: '06:00', to: '06:30', activity: 'Yoga Asanas', pillar: 'dharma' },
    { from: '06:30', to: '07:00', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '07:00', to: '09:00', activity: 'Quality Time with Spouse', pillar: 'kama' },
    { from: '09:00', to: '12:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '14:00', activity: 'Children Time / Parenting', pillar: 'kama' },
    { from: '14:00', to: '16:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '16:00', to: '17:00', activity: 'Friends & Social Connection', pillar: 'kama' },
    { from: '17:00', to: '18:00', activity: 'Fun / Entertainment', pillar: 'kama' },
    { from: '18:00', to: '19:00', activity: 'Family Time', pillar: 'kama' },
    { from: '19:00', to: '19:30', activity: 'Evening Aarti / Prayer', pillar: 'moksha' },
    { from: '19:30', to: '20:00', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '20:00', to: '21:00', activity: 'Hobby Time', pillar: 'kama' },
    { from: '21:00', to: '05:00', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
  'Sampoorna Din': [
    { from: '04:00', to: '05:00', activity: 'Brahma Muhurta Sadhana', pillar: 'moksha' },
    { from: '05:00', to: '05:30', activity: 'Pranayama / Breathing Practice', pillar: 'moksha' },
    { from: '05:30', to: '06:00', activity: 'Morning Exercise / Workout', pillar: 'dharma' },
    { from: '06:00', to: '06:30', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '06:30', to: '07:00', activity: 'Book Reading', pillar: 'dharma' },
    { from: '07:00', to: '10:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '10:00', to: '10:30', activity: 'Afternoon Snack / Chai', pillar: 'dharma' },
    { from: '10:30', to: '12:00', activity: 'Client Call / Meeting', pillar: 'artha' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '13:00', activity: 'Walk / Running / Cardio', pillar: 'dharma' },
    { from: '13:00', to: '15:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '15:00', to: '16:00', activity: 'Meditation (Dhyana)', pillar: 'moksha' },
    { from: '16:00', to: '17:00', activity: 'Skill Practice', pillar: 'dharma' },
    { from: '17:00', to: '18:00', activity: 'Family Time', pillar: 'kama' },
    { from: '18:00', to: '18:30', activity: 'Evening Aarti / Prayer', pillar: 'moksha' },
    { from: '18:30', to: '19:00', activity: 'Friends & Social Connection', pillar: 'kama' },
    { from: '19:00', to: '19:30', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '19:30', to: '20:00', activity: 'Gratitude Journaling', pillar: 'moksha' },
    { from: '20:00', to: '21:00', activity: 'Quality Time with Spouse', pillar: 'kama' },
    { from: '21:00', to: '04:00', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
  'Vidyarthi Day': [
    { from: '04:30', to: '05:00', activity: 'Meditation (Dhyana)', pillar: 'moksha' },
    { from: '05:00', to: '06:00', activity: 'Book Reading', pillar: 'dharma' },
    { from: '06:00', to: '06:30', activity: 'Morning Exercise / Workout', pillar: 'dharma' },
    { from: '06:30', to: '07:00', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '07:00', to: '10:00', activity: 'Online Course / Webinar', pillar: 'dharma' },
    { from: '10:00', to: '10:30', activity: 'Afternoon Snack / Chai', pillar: 'dharma' },
    { from: '10:30', to: '12:00', activity: 'Research / Study Time', pillar: 'dharma' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '14:00', activity: 'Skill Practice', pillar: 'dharma' },
    { from: '14:00', to: '16:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '16:00', to: '17:00', activity: 'Podcast / Audio Learning', pillar: 'dharma' },
    { from: '17:00', to: '18:00', activity: 'Creative Writing', pillar: 'dharma' },
    { from: '18:00', to: '19:00', activity: 'Walk / Running / Cardio', pillar: 'dharma' },
    { from: '19:00', to: '20:00', activity: 'Family Time', pillar: 'kama' },
    { from: '20:00', to: '20:30', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '20:30', to: '21:00', activity: 'Journaling / Reflection', pillar: 'dharma' },
    { from: '21:00', to: '04:30', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
  'Rest & Recovery': [
    { from: '06:00', to: '07:00', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
    { from: '07:00', to: '07:30', activity: 'Stretching / Mobility', pillar: 'dharma' },
    { from: '07:30', to: '08:00', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '08:00', to: '09:00', activity: 'Nature Walk (Mindful)', pillar: 'moksha' },
    { from: '09:00', to: '10:00', activity: 'Meditation (Dhyana)', pillar: 'moksha' },
    { from: '10:00', to: '11:00', activity: 'Book Reading', pillar: 'dharma' },
    { from: '11:00', to: '12:00', activity: 'Rest / Recovery', pillar: 'dharma' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '14:00', activity: 'Power Nap', pillar: 'dharma' },
    { from: '14:00', to: '15:00', activity: 'Leisure / Relaxation', pillar: 'moksha' },
    { from: '15:00', to: '16:00', activity: 'Oil Massage / Abhyanga', pillar: 'dharma' },
    { from: '16:00', to: '17:00', activity: 'Hobby Time', pillar: 'kama' },
    { from: '17:00', to: '18:00', activity: 'Family Time', pillar: 'kama' },
    { from: '18:00', to: '19:00', activity: 'Yoga Nidra', pillar: 'moksha' },
    { from: '19:00', to: '19:30', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '19:30', to: '20:30', activity: 'Digital Detox', pillar: 'moksha' },
    { from: '20:30', to: '06:00', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
  'Brahmastra Day': [
    { from: '04:00', to: '04:30', activity: 'Meditation (Dhyana)', pillar: 'moksha' },
    { from: '04:30', to: '05:00', activity: 'Morning Exercise / Workout', pillar: 'dharma' },
    { from: '05:00', to: '05:30', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '05:30', to: '09:00', activity: 'Deep Work / Focus Block', pillar: 'artha' },
    { from: '09:00', to: '09:30', activity: 'Afternoon Snack / Chai', pillar: 'dharma' },
    { from: '09:30', to: '12:00', activity: 'Sales Call / Closing', pillar: 'artha' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '15:00', activity: 'Client Call / Meeting', pillar: 'artha' },
    { from: '15:00', to: '17:00', activity: 'Business Development Planning', pillar: 'artha' },
    { from: '17:00', to: '18:00', activity: 'Marketing / Content Creation', pillar: 'artha' },
    { from: '18:00', to: '18:30', activity: 'Walk / Running / Cardio', pillar: 'dharma' },
    { from: '18:30', to: '19:00', activity: 'Family Time', pillar: 'kama' },
    { from: '19:00', to: '19:30', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '19:30', to: '20:30', activity: 'Email & Communication', pillar: 'artha' },
    { from: '20:30', to: '04:00', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
  'Lakshmi Day': [
    { from: '04:30', to: '05:00', activity: 'Puja / Aarti / Archana', pillar: 'moksha' },
    { from: '05:00', to: '05:30', activity: 'Visualization / Sankalp Shakti', pillar: 'moksha' },
    { from: '05:30', to: '06:00', activity: 'Morning Exercise / Workout', pillar: 'dharma' },
    { from: '06:00', to: '06:30', activity: 'Breakfast (Nashta)', pillar: 'dharma' },
    { from: '06:30', to: '07:00', activity: 'Money Review / Financial Planning', pillar: 'artha' },
    { from: '07:00', to: '10:00', activity: 'Sales Call / Closing', pillar: 'artha' },
    { from: '10:00', to: '10:30', activity: 'Afternoon Snack / Chai', pillar: 'dharma' },
    { from: '10:30', to: '12:00', activity: 'Follow-Up / Lead Nurturing', pillar: 'artha' },
    { from: '12:00', to: '12:30', activity: 'Lunch', pillar: 'dharma' },
    { from: '12:30', to: '14:00', activity: 'New Business Meeting', pillar: 'artha' },
    { from: '14:00', to: '16:00', activity: 'Networking / Collaboration', pillar: 'artha' },
    { from: '16:00', to: '17:00', activity: 'Invoice / Admin / Accounts', pillar: 'artha' },
    { from: '17:00', to: '18:00', activity: 'Marketing / Content Creation', pillar: 'artha' },
    { from: '18:00', to: '19:00', activity: 'Family Time', pillar: 'kama' },
    { from: '19:00', to: '19:30', activity: 'Dinner (Raat ka Khana)', pillar: 'dharma' },
    { from: '19:30', to: '20:00', activity: 'Gratitude Journaling', pillar: 'moksha' },
    { from: '20:00', to: '20:30', activity: 'Book Reading', pillar: 'dharma' },
    { from: '20:30', to: '04:30', activity: 'Sleep (Night / Main)', pillar: 'dharma' },
  ],
};
