import { useState, useMemo } from 'react';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Search, BookOpen, Star, ChevronRight, Sparkles, Award, ExternalLink, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface FrameworkLetter {
  letter: string;
  word: string;
  meaning: string;
}

interface Framework {
  id: string;
  name: string;
  acronym: string;
  tagline: string;
  category: string;
  description: string;
  letters: FrameworkLetter[];
  story: { title: string; source: string; lesson: string };
  application: string;
  color: string;
  emoji: string;
}

const FRAMEWORKS: Framework[] = [
  {
    id: 'kshama',
    name: 'K.S.H.A.M.A.™',
    acronym: 'KSHAMA',
    tagline: 'The Forgiveness Framework',
    category: 'Inner Growth',
    description: 'A powerful 6-step framework for releasing resentment and embracing forgiveness. KSHAMA transforms pain into wisdom, freeing seekers from emotional burdens that block growth across all four pillars of life.',
    letters: [
      { letter: 'K', word: 'Krodh Pahchano', meaning: 'Recognize the anger — identify the root cause of resentment without judgment.' },
      { letter: 'S', word: 'Samvedna Samjho', meaning: 'Understand the emotion — feel the pain fully before releasing it.' },
      { letter: 'H', word: 'Hriday Kholo', meaning: 'Open your heart — create space for compassion towards yourself and others.' },
      { letter: 'A', word: 'Apnao', meaning: 'Accept — embrace the experience as a teacher, not an enemy.' },
      { letter: 'M', word: 'Mukti Do', meaning: 'Grant liberation — release the other person and yourself from the chain of blame.' },
      { letter: 'A', word: 'Aagey Badho', meaning: 'Move forward — channel freed energy into positive growth and purpose.' },
    ],
    story: { title: 'Lord Ram\'s Forgiveness of Kaikeyi', source: 'Ramayana', lesson: 'Despite Kaikeyi\'s role in his exile, Ram never held bitterness. His forgiveness freed him to fulfill his dharma and become the ideal king.' },
    application: 'When feeling stuck in resentment, walk through each KSHAMA step. Journal on each letter. Most seekers report a breakthrough by step 4.',
    color: 'hsl(var(--dharma-green))',
    emoji: '🙏',
  },
  {
    id: 'ram',
    name: 'R.A.M.™',
    acronym: 'RAM',
    tagline: 'Desire Manifestation Framework',
    category: 'Manifestation',
    description: 'A 3-step process inspired by Lord Ram\'s life journey. RAM teaches seekers to align their deepest desires with righteous action to manifest outcomes that serve both self and society.',
    letters: [
      { letter: 'R', word: 'Resolve (Sankalp)', meaning: 'Set a clear, unwavering intention rooted in dharma. Your desire must align with your highest purpose.' },
      { letter: 'A', word: 'Action (Karma)', meaning: 'Take consistent, disciplined action without attachment to results. Trust the process.' },
      { letter: 'M', word: 'Manifest (Siddhi)', meaning: 'Receive the fruit of aligned intention and action. Gratitude completes the cycle.' },
    ],
    story: { title: 'Ram\'s Journey to Lanka', source: 'Ramayana', lesson: 'Ram\'s resolve to rescue Sita, his relentless action building the bridge, and the ultimate manifestation of victory — each step was dharma-aligned.' },
    application: 'Write your Sankalp clearly. Break it into daily Karma actions. Track progress and celebrate each Siddhi, no matter how small.',
    color: 'hsl(var(--saffron))',
    emoji: '🏹',
  },
  {
    id: 'tathastu',
    name: 'T.A.T.H.A.S.T.U.™',
    acronym: 'TATHASTU',
    tagline: 'The Manifestation Process',
    category: 'Manifestation',
    description: 'An 8-step cosmic manifestation process meaning "So Be It." TATHASTU bridges ancient Vedic wisdom with modern goal-setting, creating a complete system for turning vision into reality.',
    letters: [
      { letter: 'T', word: 'Think (Chintan)', meaning: 'Clarify what you truly want through deep reflection and meditation.' },
      { letter: 'A', word: 'Affirm (Dridh Sankalp)', meaning: 'Declare your intention with absolute conviction and emotional charge.' },
      { letter: 'T', word: 'Trust (Vishwas)', meaning: 'Develop unwavering faith in the process and in divine timing.' },
      { letter: 'H', word: 'Heal (Shuddhi)', meaning: 'Clear internal blocks, limiting beliefs, and emotional debris.' },
      { letter: 'A', word: 'Act (Karma)', meaning: 'Take inspired, consistent action aligned with your vision.' },
      { letter: 'S', word: 'Surrender (Samarpan)', meaning: 'Release control of the outcome. Let the universe orchestrate details.' },
      { letter: 'T', word: 'Transform (Parivartan)', meaning: 'Become the person who deserves the outcome. Grow into your vision.' },
      { letter: 'U', word: 'Unite (Ekta)', meaning: 'Merge intention, action, and faith into one unified force.' },
    ],
    story: { title: 'Arjuna\'s Mastery at Swayamvara', source: 'Mahabharata', lesson: 'Arjuna\'s years of practice (action), Krishna\'s guidance (trust), and the moment of divine precision — all eight elements converged.' },
    application: 'Use as a daily 8-minute meditation: spend 1 minute on each letter. Or use as a weekly planning framework.',
    color: 'hsl(var(--gold-bright))',
    emoji: '✨',
  },
  {
    id: 'sriram',
    name: 'S.R.I.R.A.M.™',
    acronym: 'SRIRAM',
    tagline: 'Goal Achievement System',
    category: 'Achievement',
    description: 'A structured 6-step goal achievement system that combines spiritual alignment with practical execution. SRIRAM ensures goals are not just achieved but fulfilled with meaning.',
    letters: [
      { letter: 'S', word: 'Set (Lakshya)', meaning: 'Define specific, measurable, dharma-aligned goals with clear timelines.' },
      { letter: 'R', word: 'Roadmap (Marg)', meaning: 'Create a detailed action plan with milestones and accountability.' },
      { letter: 'I', word: 'Implement (Amal)', meaning: 'Execute daily with discipline, tracking progress systematically.' },
      { letter: 'R', word: 'Review (Samikhsha)', meaning: 'Weekly review of progress, obstacles, and course corrections.' },
      { letter: 'A', word: 'Adapt (Anukul)', meaning: 'Adjust strategy based on feedback while keeping the goal steady.' },
      { letter: 'M', word: 'Master (Siddhi)', meaning: 'Achieve mastery through persistence. Celebrate and set the next goal.' },
    ],
    story: { title: 'Hanuman\'s Leap to Lanka', source: 'Ramayana', lesson: 'Hanuman set a clear goal (find Sita), created a plan (cross the ocean), adapted (overcame Surasa and Simhika), and achieved mastery.' },
    application: 'Map any 90-day goal using SRIRAM. Review weekly. Most seekers hit 80%+ completion using this structure.',
    color: 'hsl(var(--lotus-pink))',
    emoji: '🎯',
  },
  {
    id: 'lgt',
    name: 'LGT™',
    acronym: 'LGT',
    tagline: 'Life\'s Golden Triangle',
    category: 'Life Balance',
    description: 'The foundational framework of the entire coaching system. LGT maps all of life into four Purusharthas — Dharma, Artha, Kama, Moksha — creating a balanced, holistic approach to transformation.',
    letters: [
      { letter: 'L', word: 'Life (Jeevan)', meaning: 'Your complete life — encompassing purpose, wealth, pleasure, and liberation.' },
      { letter: 'G', word: 'Golden (Suvarna)', meaning: 'The precious balance point where all four pillars support each other.' },
      { letter: 'T', word: 'Triangle (Trikona)', meaning: 'The geometric harmony of Dharma-Artha-Kama, with Moksha at the center.' },
    ],
    story: { title: 'Krishna\'s Guidance to Arjuna', source: 'Bhagavad Gita', lesson: 'Krishna taught Arjuna to balance duty (Dharma), material needs (Artha), relationships (Kama), and spiritual freedom (Moksha).' },
    application: 'Score yourself 1-10 on each pillar daily in the worksheet. Track balance over time using the LGT radar chart.',
    color: 'hsl(var(--chakra-indigo))',
    emoji: '🔺',
  },
  {
    id: '7d',
    name: '7D Life Model™',
    acronym: '7D',
    tagline: 'Seven Dimensions of Life',
    category: 'Life Balance',
    description: 'An expanded life assessment model covering seven critical dimensions: Physical, Mental, Emotional, Spiritual, Financial, Social, and Professional. Used for comprehensive life audits.',
    letters: [
      { letter: '1', word: 'Physical (Sharir)', meaning: 'Health, fitness, energy, sleep, nutrition — your body as the vehicle.' },
      { letter: '2', word: 'Mental (Manas)', meaning: 'Clarity, focus, learning, creativity — sharpness of the mind.' },
      { letter: '3', word: 'Emotional (Bhavna)', meaning: 'Self-awareness, relationships, empathy — emotional intelligence.' },
      { letter: '4', word: 'Spiritual (Adhyatmik)', meaning: 'Purpose, meditation, connection to the divine — inner peace.' },
      { letter: '5', word: 'Financial (Vittiya)', meaning: 'Wealth creation, savings, investments — material security.' },
      { letter: '6', word: 'Social (Samajik)', meaning: 'Community, family, friendships — your support network.' },
      { letter: '7', word: 'Professional (Vyavasayik)', meaning: 'Career, business, skills — your contribution to the world.' },
    ],
    story: { title: 'Yudhishthira\'s Yaksha Prashna', source: 'Mahabharata', lesson: 'The Yaksha tested Yudhishthira across every dimension of life — only complete wisdom across all areas saved his brothers.' },
    application: 'Rate each dimension monthly. Identify the weakest two and create focused improvement plans for 30 days.',
    color: 'hsl(var(--wisdom-purple))',
    emoji: '🌀',
  },
  {
    id: 'bikri',
    name: 'BIKRI KA BRAHMASTRA™',
    acronym: 'BIKRI',
    tagline: 'The Ultimate Sales Weapon',
    category: 'Business',
    description: 'A battle-tested sales framework drawn from warrior wisdom. Transforms selling from pushy persuasion into dharmic service, making every transaction a win-win.',
    letters: [
      { letter: 'B', word: 'Believe (Vishwas)', meaning: 'Absolute faith in your product/service. You cannot sell what you don\'t believe in.' },
      { letter: 'I', word: 'Identify (Pahchan)', meaning: 'Identify the customer\'s real pain point, not what they say but what they need.' },
      { letter: 'K', word: 'Kindle (Prajwalit)', meaning: 'Spark desire by showing how life transforms after the purchase.' },
      { letter: 'R', word: 'Resolve (Samadhan)', meaning: 'Address objections with empathy. Every objection is an unexpressed need.' },
      { letter: 'I', word: 'Inspire (Prerit)', meaning: 'Close with inspiration, not pressure. Let the customer feel empowered.' },
    ],
    story: { title: 'Krishna\'s Diplomacy at Hastinapura', source: 'Mahabharata', lesson: 'Krishna\'s peace mission was the ultimate sales pitch — he believed in peace, identified needs, sparked desire, addressed objections, and inspired action.' },
    application: 'Before every sales call, run through BIKRI mentally. Track conversion rates before and after adopting this framework.',
    color: 'hsl(var(--saffron))',
    emoji: '⚡',
  },
  {
    id: 'panch-shakti',
    name: 'Panch Shakti Model™',
    acronym: 'PANCH',
    tagline: 'Five Powers of Transformation',
    category: 'Inner Growth',
    description: 'Five essential powers every seeker must develop for lasting transformation: Willpower, Knowledge, Action, Devotion, and Detachment.',
    letters: [
      { letter: 'P', word: 'Parakram Shakti', meaning: 'Willpower — the courage to start and persist despite obstacles.' },
      { letter: 'A', word: 'Adhyayan Shakti', meaning: 'Knowledge Power — continuous learning and seeking wisdom.' },
      { letter: 'N', word: 'Nishtha Shakti', meaning: 'Devotion Power — unwavering commitment to your path and purpose.' },
      { letter: 'C', word: 'Charitra Shakti', meaning: 'Character Power — integrity, honesty, and ethical strength.' },
      { letter: 'H', word: 'Hari Shakti', meaning: 'Divine Power — surrendering to a higher force and trusting the journey.' },
    ],
    story: { title: 'Hanuman\'s Five Powers', source: 'Ramayana', lesson: 'Hanuman embodied all five: willpower (crossing the ocean), knowledge (finding Sita), devotion (to Ram), character (refusing Lanka\'s temptations), divine power (expanding his form).' },
    application: 'Assess which Shakti is weakest. Focus on building that one power for 21 days before moving to the next.',
    color: 'hsl(var(--dharma-green))',
    emoji: '🖐️',
  },
  {
    id: 'safal',
    name: 'S.A.F.A.L.™',
    acronym: 'SAFAL',
    tagline: 'Success Framework',
    category: 'Achievement',
    description: 'A practical success framework meaning "Successful" in Hindi. SAFAL provides a clear roadmap from aspiration to achievement with built-in accountability.',
    letters: [
      { letter: 'S', word: 'Sapna (Dream)', meaning: 'Dare to dream big. Your vision must excite and slightly terrify you.' },
      { letter: 'A', word: 'Abhyas (Practice)', meaning: 'Daily deliberate practice. Mastery comes from consistent, focused effort.' },
      { letter: 'F', word: 'Focus (Dhyan)', meaning: 'Eliminate distractions. Direct all energy toward your primary goal.' },
      { letter: 'A', word: 'Accountability (Jimmedari)', meaning: 'Own your results. Have a coach or buddy who holds you accountable.' },
      { letter: 'L', word: 'Legacy (Virasat)', meaning: 'Build something that outlasts you. Success without meaning is empty.' },
    ],
    story: { title: 'Eklavya\'s Self-Mastery', source: 'Mahabharata', lesson: 'Eklavya dreamed of archery mastery, practiced relentlessly, focused exclusively, held himself accountable to his clay Guru, and left a legacy of dedication.' },
    application: 'Write your SAFAL plan for any major goal. Review the 5 elements weekly with your accountability partner.',
    color: 'hsl(var(--gold-bright))',
    emoji: '🏆',
  },
  {
    id: 'gyaan',
    name: 'G.Y.A.A.N.™',
    acronym: 'GYAAN',
    tagline: 'Knowledge Acquisition Model',
    category: 'Learning',
    description: 'A structured approach to deep learning and wisdom acquisition. GYAAN transforms information consumption into genuine understanding and applicable wisdom.',
    letters: [
      { letter: 'G', word: 'Gather (Sangrah)', meaning: 'Collect information from diverse sources with curiosity and openness.' },
      { letter: 'Y', word: 'Yield (Vichar)', meaning: 'Process and reflect on what you\'ve gathered. Extract core insights.' },
      { letter: 'A', word: 'Apply (Prayog)', meaning: 'Immediately apply one insight. Knowledge without action is wasted.' },
      { letter: 'A', word: 'Assess (Mulyankan)', meaning: 'Evaluate results. Did the application create the expected outcome?' },
      { letter: 'N', word: 'Nurture (Poshan)', meaning: 'Deepen understanding through teaching others and continued practice.' },
    ],
    story: { title: 'Vidura\'s Wisdom', source: 'Mahabharata', lesson: 'Vidura gathered knowledge from every source, reflected deeply, applied it as chief advisor, assessed outcomes, and nurtured wisdom across generations.' },
    application: 'After any learning session, immediately complete one GYAAN cycle. This 5-step loop turns 10 min of content into lasting wisdom.',
    color: 'hsl(var(--chakra-indigo))',
    emoji: '📚',
  },
];

const CATEGORIES = ['All', 'Inner Growth', 'Manifestation', 'Achievement', 'Life Balance', 'Business', 'Learning'];

export default function SeekerLearningFrameworks() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [selectedFw, setSelectedFw] = useState<Framework | null>(null);
  const [activeLetter, setActiveLetter] = useState<number | null>(null);
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set());

  const filtered = useMemo(() =>
    FRAMEWORKS.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.tagline.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== 'All' && f.category !== catFilter) return false;
      return true;
    }),
  [search, catFilter]);

  const openFramework = (fw: Framework) => {
    setSelectedFw(fw);
    setActiveLetter(null);
    setRevealedLetters(new Set());
  };

  const revealLetter = (idx: number) => {
    setActiveLetter(idx);
    setRevealedLetters(prev => new Set([...prev, idx]));
  };

  const handleShare = async (fw: Framework) => {
    const text = `${fw.emoji} ${fw.name} — ${fw.tagline}\n\n${fw.description}`;
    if (navigator.share) {
      await navigator.share({ title: fw.name, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <BackToHome />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[hsl(var(--gold-bright))]" /> Frameworks & Models
        </h1>
        <p className="text-sm text-muted-foreground">{FRAMEWORKS.length} proprietary frameworks for transformation</p>
      </div>

      {/* Search & Category */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search frameworks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${catFilter === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Framework Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(fw => (
          <Card
            key={fw.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group border-border hover:border-[hsl(var(--gold-bright))]/30"
            onClick={() => openFramework(fw)}
          >
            {/* Top accent */}
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${fw.color}, hsl(var(--gold-bright)))` }} />
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">{fw.emoji}</span>
                  <h3 className="text-base font-bold text-foreground mt-1" style={{ color: fw.color }}>{fw.name}</h3>
                  <p className="text-xs text-muted-foreground">{fw.tagline}</p>
                </div>
                <Badge className="bg-muted text-muted-foreground text-[10px]">{fw.category}</Badge>
              </div>

              {/* Letter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {fw.letters.map((l, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-lg font-bold text-sm flex items-center justify-center transition-all"
                    style={{
                      background: `${fw.color}20`,
                      color: fw.color,
                      border: `1px solid ${fw.color}40`,
                    }}
                  >
                    {l.letter}
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{fw.description}</p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{fw.story.source}</span>
                </div>
                <span className="text-xs text-primary font-medium flex items-center gap-0.5 group-hover:underline">
                  Explore <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-muted-foreground">No frameworks match your search.</p>
        </div>
      )}

      {/* Framework Detail Dialog */}
      <Dialog open={!!selectedFw} onOpenChange={open => { if (!open) setSelectedFw(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFw && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: selectedFw.color }}>
                      {selectedFw.emoji} {selectedFw.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm">{selectedFw.tagline}</DialogDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare(selectedFw)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">{selectedFw.description}</p>

              {/* Interactive Letters */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">🔤 Tap each letter to reveal</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedFw.letters.map((l, i) => (
                    <button
                      key={i}
                      onClick={() => revealLetter(i)}
                      className={`h-11 w-11 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                        revealedLetters.has(i)
                          ? 'scale-110 shadow-lg'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        background: revealedLetters.has(i) ? selectedFw.color : `${selectedFw.color}15`,
                        color: revealedLetters.has(i) ? 'white' : selectedFw.color,
                        border: `2px solid ${selectedFw.color}${revealedLetters.has(i) ? '' : '40'}`,
                      }}
                    >
                      {l.letter}
                    </button>
                  ))}
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <Progress value={(revealedLetters.size / selectedFw.letters.length) * 100} className="flex-1 h-1.5" />
                  <span className="text-[10px] text-muted-foreground">{revealedLetters.size}/{selectedFw.letters.length}</span>
                </div>

                {/* Active letter detail */}
                {activeLetter !== null && (
                  <div
                    className="rounded-xl p-4 animate-fade-in"
                    style={{ background: `${selectedFw.color}10`, border: `1px solid ${selectedFw.color}30` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold" style={{ color: selectedFw.color }}>
                        {selectedFw.letters[activeLetter].letter}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedFw.letters[activeLetter].word}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedFw.letters[activeLetter].meaning}</p>
                  </div>
                )}

                {/* All letters summary */}
                {revealedLetters.size === selectedFw.letters.length && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Award className="h-4 w-4 text-[hsl(var(--gold-bright))]" />
                      All letters revealed! Full breakdown:
                    </div>
                    {selectedFw.letters.map((l, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setActiveLetter(i)}
                      >
                        <span
                          className="h-7 w-7 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0"
                          style={{ background: `${selectedFw.color}20`, color: selectedFw.color }}
                        >
                          {l.letter}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">{l.word}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{l.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Story */}
              <div className="rounded-xl p-4 bg-[hsl(var(--saffron))]/5 border border-[hsl(var(--saffron))]/20">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-2">
                  📖 Story: {selectedFw.story.title}
                </h3>
                <Badge variant="outline" className="text-[10px] mb-2">{selectedFw.story.source}</Badge>
                <p className="text-xs text-muted-foreground">{selectedFw.story.lesson}</p>
              </div>

              {/* Application */}
              <div className="rounded-xl p-4 bg-primary/5 border border-primary/20">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-2">
                  💡 How to Apply
                </h3>
                <p className="text-xs text-muted-foreground">{selectedFw.application}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
