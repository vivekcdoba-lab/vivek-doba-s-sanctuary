import { useState, useMemo, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Save, Check, Copy, Flame, Star, Plus, Trash2, Sparkles, ChevronDown, LayoutTemplate, Loader2, Award, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import {
  ACTIVITY_GROUPS, DEFAULT_NON_NEGOTIABLES, MOOD_OPTIONS, PILLAR_CONFIG,
  DAY_NAMES, MONEY_AFFIRMATIONS, generateTimeSlots, getPhaseForTime,
  type PillarKey,
} from '@/data/worksheetData';
import { useWorksheet } from '@/hooks/useWorksheet';
import { useBadges } from '@/hooks/useBadges';
import { toast } from 'sonner';
import { playPreset, stopAll, MOOD_PRESETS, type SoundId } from '@/lib/sacredAudioEngine';
import { useAudioStore } from '@/store/audioStore';
import BackToHome from '@/components/BackToHome';

const DailyWorksheet = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [actualsMode, setActualsMode] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [showExtraGratitude, setShowExtraGratitude] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);

  const [worksheetMusic, setWorksheetMusic] = useState<string | null>(null);
  const { setPlaying } = useAudioStore();

  const { state, updateField, updateSlot, saveWorksheet, copyYesterday, seekerProfileId } = useWorksheet(selectedDate);
  const { progress, earnedBadges, nextBadge, checkAndAwardBadges } = useBadges(seekerProfileId);

  // Page visibility — pause music when tab hidden
  useEffect(() => {
    const handler = () => {
      if (document.hidden && worksheetMusic) {
        stopAll();
      } else if (!document.hidden && worksheetMusic) {
        playPreset(worksheetMusic);
        const preset = MOOD_PRESETS[worksheetMusic];
        if (preset) setPlaying(preset.sounds.map(s => s.id));
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [worksheetMusic, setPlaying]);

  const slots = useMemo(() => generateTimeSlots(), []);
  const dayInfo = DAY_NAMES[selectedDate.getDay()];
  const morningReadiness = ((state.clarity[0] + state.energy[0] + state.peace[0]) / 3).toFixed(1);
  const readinessNum = parseFloat(morningReadiness);
  const nnCompleted = Object.values(state.nonNegotiables).filter(Boolean).length;
  const nnTotal = DEFAULT_NON_NEGOTIABLES.length;
  const allNNDone = nnCompleted === nnTotal;
  const todayAffirmation = MONEY_AFFIRMATIONS[selectedDate.getDate() % MONEY_AFFIRMATIONS.length];

  const pillarHours = useMemo(() => {
    const hours: Record<PillarKey, number> = { dharma: 0, artha: 0, kama: 0, moksha: 0 };
    Object.entries(state.timeSlots).forEach(([, slot]) => {
      if (slot.pillar && slot.activity) {
        hours[slot.pillar as PillarKey] += 0.5;
      }
    });
    return hours;
  }, [state.timeSlots]);

  const totalPlanned = Object.values(pillarHours).reduce((a, b) => a + b, 0);

  const TOMORROW_PREP_ITEMS = [
    'Tomorrow\'s outfit/clothes ready',
    'Tomorrow\'s schedule reviewed',
    'Tomorrow\'s MIT (3 tasks) identified',
    'Phone charged / workspace clean',
    'Alarm set for Brahma Muhurta',
    'Tomorrow\'s meals planned',
    'Pending calls/messages responded to',
  ];
  const tomorrowPrepDone = Object.values(state.tomorrowPrep).filter(Boolean).length;

  const SCHEDULE_TEMPLATES = [
    { emoji: '🧘', name: 'Sadhak Day', desc: 'Spirituality-heavy day', pillar: 'moksha' },
    { emoji: '💼', name: 'Arjun Day', desc: 'Business-heavy high performance', pillar: 'artha' },
    { emoji: '❤️', name: 'Grihastha Day', desc: 'Family & relationships focused', pillar: 'kama' },
    { emoji: '⚖️', name: 'Sampoorna Din', desc: 'Balanced LGT ideal day', pillar: 'all' },
    { emoji: '📚', name: 'Vidyarthi Day', desc: 'Learning & growth focused', pillar: 'dharma' },
    { emoji: '😴', name: 'Rest & Recovery', desc: 'Low activity recovery day', pillar: 'dharma' },
    { emoji: '🔥', name: 'Brahmastra Day', desc: 'Maximum productivity war mode', pillar: 'artha' },
    { emoji: '💰', name: 'Lakshmi Day', desc: 'Money, sales & Artha-focused', pillar: 'artha' },
  ];

  const eveningFulfillmentScore = ((state.evMentalPeace[0] + state.evEmotionalSat[0] + state.evFulfillment[0]) / 3).toFixed(1);
  const eveningNum = parseFloat(eveningFulfillmentScore);
  const lgtBalanceScore = ((state.dharmaScore[0] + state.arthaScore[0] + state.kamaScore[0] + state.mokshaScore[0]) / 4).toFixed(1);

  const handleSave = () => saveWorksheet(false);
  const handleSubmit = async () => {
    await saveWorksheet(true);
    // Check badge streaks after submit
    const totalIncome = state.incomeEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const newlyEarned = await checkAndAwardBadges(format(selectedDate, 'yyyy-MM-dd'), {
      is_submitted: true,
      water_intake_glasses: state.waterGlasses,
      sampoorna_din_score: null,
      non_negotiables_completed: Object.values(state.nonNegotiables).filter(Boolean).length,
      non_negotiables_total: DEFAULT_NON_NEGOTIABLES.length,
      has_positive_income: totalIncome > 0,
    });
    if (newlyEarned.length) {
      toast.success(`🏅 New Badge Earned: ${newlyEarned.join(', ')}!`, { duration: 5000 });
    }
  };

  const applyTemplate = (templateName: string) => {
    toast.success(`"${templateName}" template applied!`);
    setTemplatesOpen(false);
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading worksheet...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Focus Music Bar */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
        <Music className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Focus music:</span>
        {[
          { key: null, label: '🔕 Off' },
          { key: 'meditate', label: '🧘 Meditate' },
          { key: 'focus', label: '🔥 Focus' },
          { key: 'pray', label: '🙏 Pray' },
        ].map(opt => (
          <button key={opt.key || 'off'} onClick={() => {
            if (opt.key === worksheetMusic || (!opt.key && !worksheetMusic)) return;
            if (!opt.key) { stopAll(); setPlaying([]); setWorksheetMusic(null); }
            else { playPreset(opt.key); const p = MOOD_PRESETS[opt.key]; if (p) { setPlaying(p.sounds.map(s => s.id)); p.sounds.forEach(s => { /* volume set by preset */ }); } setWorksheetMusic(opt.key); }
          }}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${(opt.key === worksheetMusic || (!opt.key && !worksheetMusic)) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* SECTION 1 — Header & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🗓️ Daily Dharmic Worksheet</h1>
          <p className="text-sm text-muted-foreground">{dayInfo.hi}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => subDays(d, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[180px]">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, 'dd MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => addDays(d, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
        </div>
      </div>

      {/* Auto-save indicator */}
      {state.lastSaved && (
        <div className="text-xs text-muted-foreground text-right">
          💾 Last saved: {format(state.lastSaved, 'HH:mm:ss')}
          {state.isSaving && <span className="ml-2"><Loader2 className="w-3 h-3 inline animate-spin" /> Saving...</span>}
        </div>
      )}

      {/* Streak Counter & Badge Preview */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> Streak: <strong>15 days</strong></span>
        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> Best: <strong>42 days</strong></span>
        <span className="text-muted-foreground">📅 Total: <strong>68</strong></span>
        {earnedBadges.length > 0 && (
          <button onClick={() => setBadgesOpen(true)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
            <Award className="w-3.5 h-3.5" /> {earnedBadges.length} Badges
          </button>
        )}
      </div>

      {/* Next Badge Progress */}
      {nextBadge && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-3 flex items-center gap-3">
          <span className="text-2xl">{nextBadge.badge.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">
              🔥 {nextBadge.daysRemaining} more days to earn <strong>{nextBadge.badge.name}</strong> badge!
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={nextBadge.progressPercent} className="h-2 flex-1" />
              <span className="text-[10px] text-muted-foreground font-mono">{nextBadge.currentStreak}/{nextBadge.requiredStreak}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sankalp */}
      <div className="bg-card rounded-xl border border-border p-4">
        <label className="text-sm font-semibold text-foreground block mb-2">🕉️ Aaj Ka Sankalp (Today's Intention)</label>
        <Input
          placeholder="Main aaj... (My intention today is...)"
          value={state.intention}
          onChange={e => updateField('intention', e.target.value)}
          className="bg-background"
        />
      </div>

      {/* Mood & EQ Morning Pulse */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-semibold mb-3">😊 Mood at Start of Day</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map(m => (
              <button
                key={m.label}
                onClick={() => updateField('morningMood', m.label)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm border transition-all',
                  state.morningMood === m.label ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:bg-muted'
                )}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <p className="text-sm font-semibold">🧠 EQ Morning Pulse</p>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Mental Clarity</span><span>{state.clarity[0]}/10</span>
            </div>
            <Slider value={state.clarity} onValueChange={v => updateField('clarity', v)} max={10} min={1} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Physical Energy</span><span>{state.energy[0]}/10</span>
            </div>
            <Slider value={state.energy} onValueChange={v => updateField('energy', v)} max={10} min={1} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Emotional Peace</span><span>{state.peace[0]}/10</span>
            </div>
            <Slider value={state.peace} onValueChange={v => updateField('peace', v)} max={10} min={1} step={1} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Readiness:</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-bold text-white',
              readinessNum >= 7 ? 'bg-green-500' : readinessNum >= 5 ? 'bg-yellow-500' : 'bg-red-500'
            )}>
              {morningReadiness}
            </span>
          </div>
        </div>
      </div>

      {/* LGT Pillar Balance Bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-sm font-semibold mb-3">⚖️ LGT Pillar Balance (Hours Planned)</p>
        <div className="flex h-6 rounded-full overflow-hidden bg-muted">
          {(Object.keys(PILLAR_CONFIG) as PillarKey[]).map(key => {
            const pct = totalPlanned > 0 ? (pillarHours[key] / 24) * 100 : 0;
            return pct > 0 ? (
              <div
                key={key}
                className="h-full flex items-center justify-center text-[9px] text-white font-bold"
                style={{ width: `${pct}%`, backgroundColor: PILLAR_CONFIG[key].color }}
                title={`${PILLAR_CONFIG[key].label}: ${pillarHours[key]}h`}
              >
                {pillarHours[key] > 1 && `${pillarHours[key]}h`}
              </div>
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          {(Object.keys(PILLAR_CONFIG) as PillarKey[]).map(key => (
            <span key={key}>{PILLAR_CONFIG[key].icon} {PILLAR_CONFIG[key].label}: {pillarHours[key]}h</span>
          ))}
          <span className="ml-auto font-medium text-foreground">Total: {totalPlanned}/24h</span>
        </div>
      </div>

      {/* SECTION 0 — Non-Negotiables */}
      <div className="bg-card rounded-xl border-2 border-orange-200 dark:border-orange-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">🔱 Pratah Sankalp Checklist</h2>
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-bold',
            allNNDone ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
          )}>
            {nnCompleted}/{nnTotal}
          </span>
        </div>

        {allNNDone && (
          <div className="mb-4 p-3 rounded-lg text-center font-bold text-white" style={{ backgroundColor: '#F97316' }}>
            🔱 Tera Pratah Siddha Hai — Jai Shriram! 🔱
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEFAULT_NON_NEGOTIABLES.map((nn, i) => (
            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Checkbox
                checked={state.nonNegotiables[i] || false}
                onCheckedChange={(c) => updateField('nonNegotiables', { ...state.nonNegotiables, [i]: !!c })}
              />
              <span className={cn('text-sm', state.nonNegotiables[i] && 'line-through text-muted-foreground')}>
                {nn.habit_name}
              </span>
              <span className="ml-auto text-xs">{PILLAR_CONFIG[nn.lgt_pillar as PillarKey]?.icon}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 2 — 24-Hour Timesheet */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">📋 24-Hour Sacred Timesheet</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Plan</span>
            <button
              onClick={() => setActualsMode(!actualsMode)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                actualsMode ? 'bg-green-500' : 'bg-muted'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                actualsMode ? 'translate-x-6' : 'translate-x-0.5'
              )} />
            </button>
            <span className="text-xs text-muted-foreground">Actuals</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[80px_1fr_100px_60px_80px] gap-1 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border">
              <span>Time</span>
              <span>Activity</span>
              <span>Pillar</span>
              <span>Energy</span>
              {actualsMode ? <span>Status</span> : <span>Notes</span>}
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {slots.map(slot => {
                const key = slot.start;
                const data = state.timeSlots[key] || { activity: '', pillar: '', energy: '', notes: '', actualStatus: '', skipReason: '' };
                const phaseBg = getPhaseForTime(slot.start);

                return (
                  <div key={key} className={cn('grid grid-cols-[80px_1fr_100px_60px_80px] gap-1 px-4 py-1.5 border-b border-border/50 items-center text-sm', phaseBg)}>
                    <span className="text-xs font-mono text-muted-foreground">{slot.display}</span>

                    <Select value={data.activity} onValueChange={(v) => updateSlot(key, 'activity', v)}>
                      <SelectTrigger className="h-8 text-xs bg-background/80">
                        <SelectValue placeholder="Select activity..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {ACTIVITY_GROUPS.map(g => (
                          <SelectGroup key={g.group}>
                            <SelectLabel className="text-xs">{g.group}</SelectLabel>
                            {g.items.map(item => (
                              <SelectItem key={item} value={item} className="text-xs">{item}</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                        <SelectItem value="Custom" className="text-xs">⭕ Custom</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={data.pillar} onValueChange={(v) => updateSlot(key, 'pillar', v)}>
                      <SelectTrigger className="h-8 text-xs bg-background/80">
                        <SelectValue placeholder="Pillar" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PILLAR_CONFIG) as PillarKey[]).map(p => (
                          <SelectItem key={p} value={p} className="text-xs">
                            {PILLAR_CONFIG[p].icon} {PILLAR_CONFIG[p].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={data.energy} onValueChange={(v) => updateSlot(key, 'energy', v)}>
                      <SelectTrigger className="h-8 text-xs bg-background/80">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-xs">🔴 Low</SelectItem>
                        <SelectItem value="medium" className="text-xs">🟡 Med</SelectItem>
                        <SelectItem value="high" className="text-xs">🟢 High</SelectItem>
                      </SelectContent>
                    </Select>

                    {actualsMode ? (
                      <Select value={data.actualStatus} onValueChange={(v) => updateSlot(key, 'actualStatus', v)}>
                        <SelectTrigger className="h-8 text-xs bg-background/80">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="done" className="text-xs">✅ Done</SelectItem>
                          <SelectItem value="modified" className="text-xs">🔄 Modified</SelectItem>
                          <SelectItem value="skipped" className="text-xs">❌ Skipped</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="..."
                        value={data.notes}
                        onChange={e => updateSlot(key, 'notes', e.target.value)}
                        className="h-8 text-xs bg-background/80"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/30 flex flex-wrap gap-4 text-sm">
          <span>Planned: <strong>{totalPlanned}h</strong>/24h</span>
          <span>Free: <strong>{24 - totalPlanned}h</strong></span>
        </div>
      </div>

      {/* SECTION 3 — Pillar Summary */}
      <div>
        <h2 className="text-lg font-bold mb-3">📊 Pillar-Wise Daily Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(PILLAR_CONFIG) as PillarKey[]).map(key => {
            const cfg = PILLAR_CONFIG[key];
            const hrs = pillarHours[key];
            const pct = totalPlanned > 0 ? ((hrs / totalPlanned) * 100).toFixed(0) : '0';
            return (
              <div key={key} className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl mb-1">{cfg.icon}</p>
                <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: cfg.color }}>{hrs}h</p>
                <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(hrs / 24) * 100}%`, backgroundColor: cfg.color }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pct}% of plan</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4 — MIT Priorities */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-lg font-bold mb-3">🎯 Aaj Ke Teen Kaam (MIT)</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{n}</span>
              <Input placeholder={`Priority task ${n}...`} className="flex-1" />
              <Select>
                <SelectTrigger className="w-24 h-9 text-xs">
                  <SelectValue placeholder="Pillar" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PILLAR_CONFIG) as PillarKey[]).map(p => (
                    <SelectItem key={p} value={p} className="text-xs">{PILLAR_CONFIG[p].icon} {PILLAR_CONFIG[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Checkbox />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5 — Daily Financial Log */}
      <div className="bg-card rounded-xl border-2 border-yellow-200 dark:border-yellow-800 p-5 space-y-5">
        <h2 className="text-lg font-bold">💰 Aaj Ka Artha (Daily Financial Log)</h2>

        {/* Income */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">📥 Income Received Today</p>
          <div className="space-y-2">
            {state.incomeEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Source (e.g., Client payment)"
                  value={entry.source}
                  onChange={e => { const arr = [...state.incomeEntries]; arr[i] = { ...arr[i], source: e.target.value }; updateField('incomeEntries', arr); }}
                  className="flex-1"
                />
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={entry.amount}
                    onChange={e => { const arr = [...state.incomeEntries]; arr[i] = { ...arr[i], amount: e.target.value }; updateField('incomeEntries', arr); }}
                    className="w-28 pl-6"
                  />
                </div>
                <Select value={entry.category} onValueChange={v => { const arr = [...state.incomeEntries]; arr[i] = { ...arr[i], category: v }; updateField('incomeEntries', arr); }}>
                  <SelectTrigger className="w-32 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coaching_fee">Coaching Fee</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="product_sale">Product Sale</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="other_income">Other</SelectItem>
                  </SelectContent>
                </Select>
                {state.incomeEntries.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateField('incomeEntries', state.incomeEntries.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => updateField('incomeEntries', [...state.incomeEntries, { source: '', amount: '', category: '' }])} className="gap-1">
              <Plus className="w-3 h-3" /> Add Income
            </Button>
          </div>
        </div>

        {/* Expense */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">📤 Expense / Investment Today</p>
          <div className="space-y-2">
            {state.expenseEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Source (e.g., Venue booking)"
                  value={entry.source}
                  onChange={e => { const arr = [...state.expenseEntries]; arr[i] = { ...arr[i], source: e.target.value }; updateField('expenseEntries', arr); }}
                  className="flex-1"
                />
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={entry.amount}
                    onChange={e => { const arr = [...state.expenseEntries]; arr[i] = { ...arr[i], amount: e.target.value }; updateField('expenseEntries', arr); }}
                    className="w-28 pl-6"
                  />
                </div>
                <Select value={entry.category} onValueChange={v => { const arr = [...state.expenseEntries]; arr[i] = { ...arr[i], category: v }; updateField('expenseEntries', arr); }}>
                  <SelectTrigger className="w-32 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_investment">Business Investment</SelectItem>
                    <SelectItem value="personal_need">Personal Need</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="charity">Charity / Daan</SelectItem>
                    <SelectItem value="other_expense">Other</SelectItem>
                  </SelectContent>
                </Select>
                {state.expenseEntries.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateField('expenseEntries', state.expenseEntries.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => updateField('expenseEntries', [...state.expenseEntries, { source: '', amount: '', category: '' }])} className="gap-1">
              <Plus className="w-3 h-3" /> Add Expense
            </Button>
          </div>
        </div>

        {/* Daily Totals */}
        {(() => {
          const totalIncome = state.incomeEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
          const totalExpense = state.expenseEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
          const net = totalIncome - totalExpense;
          return (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="text-lg font-bold text-green-600">₹{totalIncome.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                <p className="text-xs text-muted-foreground">Total Expense</p>
                <p className="text-lg font-bold text-red-500">₹{totalExpense.toLocaleString('en-IN')}</p>
              </div>
              <div className={cn('text-center p-3 rounded-lg', net >= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10')}>
                <p className="text-xs text-muted-foreground">Net for Day</p>
                <p className={cn('text-lg font-bold', net >= 0 ? 'text-green-600' : 'text-red-500')}>₹{net.toLocaleString('en-IN')}</p>
              </div>
            </div>
          );
        })()}

        {/* Money Affirmation */}
        <div className="p-3 rounded-lg text-center italic text-sm border border-yellow-200 dark:border-yellow-800" style={{ backgroundColor: 'rgba(234,179,8,0.06)' }}>
          <p className="text-muted-foreground">💛 "{todayAffirmation}"</p>
        </div>
      </div>

      {/* SECTION 6 — Body & Health Metrics */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-lg font-bold">🏥 Sharir Ka Haal (Body Dashboard)</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">💧 Water (glasses)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateField('waterGlasses', Math.max(0, state.waterGlasses - 1))}>-</Button>
              <span className={cn('text-xl font-bold', state.waterGlasses >= 8 ? 'text-green-600' : 'text-foreground')}>{state.waterGlasses}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateField('waterGlasses', state.waterGlasses + 1)}>+</Button>
              <span className="text-xs text-muted-foreground">/8</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (state.waterGlasses / 8) * 100)}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">👣 Steps</p>
            <Input placeholder="0" type="number" value={state.stepsTaken} onChange={e => updateField('stepsTaken', e.target.value)} className="h-9" />
            <p className="text-[10px] text-muted-foreground">Goal: 10,000</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">😴 Sleep (hrs)</p>
            <Input placeholder="0" type="number" step="0.5" value={state.sleepHours} onChange={e => updateField('sleepHours', e.target.value)} className="h-9" />
            <Select value={state.sleepQuality} onValueChange={v => updateField('sleepQuality', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Quality" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="deep">😴 Deep</SelectItem>
                <SelectItem value="restless">😵 Restless</SelectItem>
                <SelectItem value="interrupted">🌀 Interrupted</SelectItem>
                <SelectItem value="refreshed">🌟 Refreshed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">⚖️ Weight (kg)</p>
            <Input placeholder="Optional" type="number" step="0.1" value={state.bodyWeight} onChange={e => updateField('bodyWeight', e.target.value)} className="h-9" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">💊 Supplements</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={state.supplementsTaken} onCheckedChange={(c) => updateField('supplementsTaken', !!c)} />
              <span className="text-sm">{state.supplementsTaken ? 'Taken ✅' : 'Not yet'}</span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">🏋️ Workout</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={state.workoutDone} onCheckedChange={(c) => updateField('workoutDone', !!c)} />
              <span className="text-sm">{state.workoutDone ? 'Done ✅' : 'Not yet'}</span>
            </label>
            {state.workoutDone && (
              <div className="flex gap-1">
                <Input placeholder="Type" value={state.workoutType} onChange={e => updateField('workoutType', e.target.value)} className="h-8 text-xs flex-1" />
                <Input placeholder="Min" type="number" value={state.workoutDuration} onChange={e => updateField('workoutDuration', e.target.value)} className="h-8 text-xs w-16" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">📱 Screen Time (hrs)</p>
            <Input placeholder="0" type="number" step="0.5" value={state.screenTime} onChange={e => updateField('screenTime', e.target.value)} className="h-9" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">⚡ Energy at Day End</p>
            <Slider value={state.endEnergyLevel} onValueChange={v => updateField('endEnergyLevel', v)} max={10} min={1} step={1} />
            <p className="text-xs text-center">
              {state.endEnergyLevel[0] <= 3 ? '🔴' : state.endEnergyLevel[0] <= 6 ? '🟡' : '🟢'} {state.endEnergyLevel[0]}/10
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 7 — Aaj Ki Jeet & AHA Moment */}
      <div className="space-y-4">
        <div className="bg-card rounded-xl border-2 border-green-200 dark:border-green-800 p-5">
          <h2 className="text-lg font-bold mb-3">🏆 Aaj Ki Jeet (Today's Win)</h2>
          <p className="text-xs text-muted-foreground mb-3">At least 1 win is required — har jeet celebrate hoti hai!</p>
          <div className="space-y-2">
            {state.wins.map((win, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm">🏆</span>
                <Textarea
                  placeholder="Aaj maine kya achieve kiya, bada ya chhota..."
                  value={win}
                  onChange={e => { const arr = [...state.wins]; arr[i] = e.target.value; updateField('wins', arr); }}
                  className="min-h-[60px] flex-1"
                />
                {state.wins.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateField('wins', state.wins.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            {state.wins.length < 3 && (
              <Button variant="outline" size="sm" onClick={() => updateField('wins', [...state.wins, ''])} className="gap-1">
                <Plus className="w-3 h-3" /> Add Another Win
              </Button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border-2 border-amber-200 dark:border-amber-800 p-5 relative overflow-hidden">
          {state.ahaMoment && (
            <div className="absolute inset-0 pointer-events-none">
              <Sparkles className="absolute top-2 right-3 w-5 h-5 text-amber-400 animate-pulse" />
              <Sparkles className="absolute bottom-4 left-5 w-4 h-4 text-amber-300 animate-pulse delay-300" />
              <Sparkles className="absolute top-8 right-12 w-3 h-3 text-yellow-400 animate-pulse delay-700" />
            </div>
          )}
          <h2 className="text-lg font-bold mb-2">💡 AHA Moment (Breakthrough Insight)</h2>
          <p className="text-xs text-muted-foreground mb-3">Optional but encouraged — capture your breakthroughs!</p>
          <Textarea
            placeholder="Aaj kuch aisa hua ya socha jo pehle kabhi nahin hua..."
            value={state.ahaMoment}
            onChange={e => updateField('ahaMoment', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* SECTION 8 — End of Day Reflection */}
      <Collapsible open={reflectionOpen} onOpenChange={setReflectionOpen}>
        <div className="bg-card rounded-xl border-2 border-violet-200 dark:border-violet-800 overflow-hidden">
          <CollapsibleTrigger className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <h2 className="text-lg font-bold">🌙 Sham Ka Chintan (Evening Reflection)</h2>
            <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', reflectionOpen && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
              <div>
                <p className="text-sm font-semibold mb-2">😊 Mood at End of Day</p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m.label} onClick={() => updateField('eveningMood', m.label)}
                      className={cn('px-3 py-2 rounded-lg text-sm border transition-all',
                        state.eveningMood === m.label ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:bg-muted'
                      )}>
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold">🧠 EQ Evening Pulse</p>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Mental Peace — "Mera mann aaj kitna shant raha?"</span><span>{state.evMentalPeace[0]}/10</span>
                  </div>
                  <Slider value={state.evMentalPeace} onValueChange={v => updateField('evMentalPeace', v)} max={10} min={1} step={1} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Emotional Satisfaction — "Andar se kitna bhar hua feel?"</span><span>{state.evEmotionalSat[0]}/10</span>
                  </div>
                  <Slider value={state.evEmotionalSat} onValueChange={v => updateField('evEmotionalSat', v)} max={10} min={1} step={1} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Overall Fulfillment — "Din kitna meaningful laga?"</span><span>{state.evFulfillment[0]}/10</span>
                  </div>
                  <Slider value={state.evFulfillment} onValueChange={v => updateField('evFulfillment', v)} max={10} min={1} step={1} />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-muted-foreground">Evening Score:</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold text-white',
                    eveningNum >= 7 ? 'bg-green-500' : eveningNum >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                  )}>{eveningFulfillmentScore}</span>
                  <span className="text-xs text-muted-foreground">
                    vs Morning {morningReadiness} → {eveningNum > readinessNum ? '📈 Improved' : eveningNum < readinessNum ? '📉 Declined' : '➡️ Same'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-1">✅ What went well today?</p>
                  <Textarea placeholder="Aaj kya accha hua..." value={state.whatWentWell} onChange={e => updateField('whatWentWell', e.target.value)} className="min-h-[60px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">📚 What did I learn today?</p>
                  <Textarea placeholder="Aaj maine kya seekha..." value={state.whatLearned} onChange={e => updateField('whatLearned', e.target.value)} className="min-h-[60px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">🔄 What will I do differently tomorrow?</p>
                  <Textarea placeholder="Kal main differently karunga..." value={state.doDifferently} onChange={e => updateField('doDifferently', e.target.value)} className="min-h-[60px]" />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">🙏 Gratitude</p>
                <div className="space-y-2">
                  {state.gratitudes.map((g, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm">🙏</span>
                      <Input placeholder={`Gratitude ${i + 1}...`} value={g}
                        onChange={e => { const arr = [...state.gratitudes]; arr[i] = e.target.value; updateField('gratitudes', arr); }} />
                    </div>
                  ))}
                  {!showExtraGratitude && state.gratitudes.length <= 3 && (
                    <Button variant="outline" size="sm" onClick={() => { updateField('gratitudes', [...state.gratitudes, '', '']); setShowExtraGratitude(true); }} className="gap-1">
                      <Plus className="w-3 h-3" /> Add More Gratitude
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold">📊 Self-Rating (LGT Pillars)</p>
                {([
                  { label: '🟠 Dharma', val: state.dharmaScore, set: (v: number[]) => updateField('dharmaScore', v) },
                  { label: '💛 Artha', val: state.arthaScore, set: (v: number[]) => updateField('arthaScore', v) },
                  { label: '🩷 Kama', val: state.kamaScore, set: (v: number[]) => updateField('kamaScore', v) },
                  { label: '🟣 Moksha', val: state.mokshaScore, set: (v: number[]) => updateField('mokshaScore', v) },
                ]).map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{s.label} Score</span><span>{s.val[0]}/10</span>
                    </div>
                    <Slider value={[...s.val]} onValueChange={s.set} max={10} min={1} step={1} />
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">LGT Balance Score:</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold text-white',
                    parseFloat(lgtBalanceScore) >= 7 ? 'bg-green-500' : parseFloat(lgtBalanceScore) >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                  )}>{lgtBalanceScore}/10</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">🌅 Tomorrow's Sankalp</p>
                <Input placeholder="Kal ka sankalp..." value={state.tomorrowSankalp} onChange={e => updateField('tomorrowSankalp', e.target.value)} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">📋 Tomorrow's Preparation</p>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold',
                    tomorrowPrepDone === TOMORROW_PREP_ITEMS.length ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    {tomorrowPrepDone}/{TOMORROW_PREP_ITEMS.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TOMORROW_PREP_ITEMS.map((item, i) => (
                    <label key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox checked={!!state.tomorrowPrep[i]} onCheckedChange={(c) => updateField('tomorrowPrep', { ...state.tomorrowPrep, [i]: !!c })} />
                      <span className={cn('text-sm', state.tomorrowPrep[i] && 'line-through text-muted-foreground')}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* SECTION 9 — Quick Templates Modal */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>📋 Quick-Fill Templates</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">Choose a template to pre-fill your 24-hour timesheet:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCHEDULE_TEMPLATES.map(t => (
              <button key={t.name} onClick={() => applyTemplate(t.name)}
                className="text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all">
                <span className="text-2xl block mb-1">{t.emoji}</span>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-border p-3 -mx-4 flex flex-wrap gap-2 justify-center">
        <Button variant="outline" className="gap-2" onClick={() => setTemplatesOpen(true)}>
          <LayoutTemplate className="w-4 h-4" /> Templates
        </Button>
        <Button onClick={handleSave} disabled={state.isSaving} className="gap-2">
          {state.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </Button>
        <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={state.isSaving}>
          <Check className="w-4 h-4" /> Submit Day
        </Button>
        <Button variant="outline" className="gap-2" onClick={copyYesterday}>
          <Copy className="w-4 h-4" /> Copy Yesterday
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => subDays(d, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => addDays(d, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Badges Dialog */}
      <Dialog open={badgesOpen} onOpenChange={setBadgesOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🏅 My Badges & Achievements</DialogTitle>
          </DialogHeader>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">✅ Earned ({earnedBadges.length})</p>
              <div className="grid grid-cols-2 gap-2">
                {earnedBadges.map(b => (
                  <div key={b.id} className="p-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-center">
                    <span className="text-3xl block">{b.badge.emoji}</span>
                    <p className="text-xs font-bold text-foreground mt-1">{b.badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">{b.badge.description}</p>
                    <p className="text-[10px] text-primary mt-1">
                      Earned {format(new Date(b.earned_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          <div className="space-y-2 mt-4">
            <p className="text-sm font-semibold text-foreground">🔄 In Progress</p>
            <div className="space-y-2">
              {progress.filter(p => !p.isEarned).map(p => (
                <div key={p.badge.id} className="p-3 rounded-xl border border-border flex items-center gap-3">
                  <span className="text-2xl opacity-50">{p.badge.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">{p.badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.badge.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={p.progressPercent} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {p.currentStreak}/{p.requiredStreak}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyWorksheet;
