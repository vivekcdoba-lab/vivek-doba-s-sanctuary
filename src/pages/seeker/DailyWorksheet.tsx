import { useState, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Save, Check, Copy, Flame, Star, Plus, Trash2, Sparkles, ChevronDown, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ACTIVITY_GROUPS, DEFAULT_NON_NEGOTIABLES, MOOD_OPTIONS, PILLAR_CONFIG,
  DAY_NAMES, MONEY_AFFIRMATIONS, generateTimeSlots, getPhaseForTime,
  getPillarForActivity, type PillarKey,
} from '@/data/worksheetData';
import { toast } from 'sonner';

interface TimeSlotData {
  activity: string;
  pillar: PillarKey | '';
  energy: string;
  notes: string;
  actualStatus: string;
  skipReason: string;
}

const DailyWorksheet = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [intention, setIntention] = useState('');
  const [morningMood, setMorningMood] = useState('');
  const [clarity, setClarity] = useState([5]);
  const [energy, setEnergy] = useState([5]);
  const [peace, setPeace] = useState([5]);
  const [actualsMode, setActualsMode] = useState(false);
  const [nonNegotiables, setNonNegotiables] = useState<Record<number, boolean>>(
    Object.fromEntries(DEFAULT_NON_NEGOTIABLES.map((_, i) => [i, false]))
  );
  const [timeSlots, setTimeSlots] = useState<Record<string, TimeSlotData>>({});

  // Section 5 — Financial Log
  interface FinancialEntry { source: string; amount: string; category: string; }
  const [incomeEntries, setIncomeEntries] = useState<FinancialEntry[]>([{ source: '', amount: '', category: '' }]);
  const [expenseEntries, setExpenseEntries] = useState<FinancialEntry[]>([{ source: '', amount: '', category: '' }]);

  // Section 6 — Health Metrics
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [stepsTaken, setStepsTaken] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [supplementsTaken, setSupplementsTaken] = useState(false);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [screenTime, setScreenTime] = useState('');
  const [endEnergyLevel, setEndEnergyLevel] = useState([5]);

  // Section 7 — Wins & AHA
  const [wins, setWins] = useState(['']);
  const [ahaMoment, setAhaMoment] = useState('');

  const slots = useMemo(() => generateTimeSlots(), []);
  const dayInfo = DAY_NAMES[selectedDate.getDay()];
  const morningReadiness = ((clarity[0] + energy[0] + peace[0]) / 3).toFixed(1);
  const readinessNum = parseFloat(morningReadiness);
  const nnCompleted = Object.values(nonNegotiables).filter(Boolean).length;
  const nnTotal = DEFAULT_NON_NEGOTIABLES.length;
  const allNNDone = nnCompleted === nnTotal;
  const todayAffirmation = MONEY_AFFIRMATIONS[selectedDate.getDate() % MONEY_AFFIRMATIONS.length];

  // Pillar hour calculation
  const pillarHours = useMemo(() => {
    const hours: Record<PillarKey, number> = { dharma: 0, artha: 0, kama: 0, moksha: 0 };
    Object.entries(timeSlots).forEach(([, slot]) => {
      if (slot.pillar && slot.activity) {
        hours[slot.pillar as PillarKey] += 0.5;
      }
    });
    return hours;
  }, [timeSlots]);

  const totalPlanned = Object.values(pillarHours).reduce((a, b) => a + b, 0);

  const updateSlot = (key: string, field: keyof TimeSlotData, value: string) => {
    setTimeSlots(prev => {
      const current = prev[key] || { activity: '', pillar: '', energy: '', notes: '', actualStatus: '', skipReason: '' };
      const updated = { ...current, [field]: value };
      if (field === 'activity' && value) {
        const autoPillar = getPillarForActivity(value);
        if (autoPillar) updated.pillar = autoPillar;
      }
      return { ...prev, [key]: updated };
    });
  };

  const handleSave = () => {
    toast.success('Worksheet saved as draft!');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
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

      {/* Streak Counter */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> Streak: <strong>15 days</strong></span>
        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> Best: <strong>42 days</strong></span>
        <span className="text-muted-foreground">📅 Total: <strong>68</strong></span>
      </div>

      {/* Sankalp */}
      <div className="bg-card rounded-xl border border-border p-4">
        <label className="text-sm font-semibold text-foreground block mb-2">🕉️ Aaj Ka Sankalp (Today's Intention)</label>
        <Input
          placeholder="Main aaj... (My intention today is...)"
          value={intention}
          onChange={e => setIntention(e.target.value)}
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
                onClick={() => setMorningMood(m.label)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm border transition-all',
                  morningMood === m.label ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:bg-muted'
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
              <span>Mental Clarity</span><span>{clarity[0]}/10</span>
            </div>
            <Slider value={clarity} onValueChange={setClarity} max={10} min={1} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Physical Energy</span><span>{energy[0]}/10</span>
            </div>
            <Slider value={energy} onValueChange={setEnergy} max={10} min={1} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Emotional Peace</span><span>{peace[0]}/10</span>
            </div>
            <Slider value={peace} onValueChange={setPeace} max={10} min={1} step={1} />
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
                checked={nonNegotiables[i]}
                onCheckedChange={(c) => setNonNegotiables(prev => ({ ...prev, [i]: !!c }))}
              />
              <span className={cn('text-sm', nonNegotiables[i] && 'line-through text-muted-foreground')}>
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
            {/* Header */}
            <div className="grid grid-cols-[80px_1fr_100px_60px_80px] gap-1 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border">
              <span>Time</span>
              <span>Activity</span>
              <span>Pillar</span>
              <span>Energy</span>
              {actualsMode ? <span>Status</span> : <span>Notes</span>}
            </div>

            {/* Slots */}
            <div className="max-h-[500px] overflow-y-auto">
              {slots.map(slot => {
                const key = slot.start;
                const data = timeSlots[key] || { activity: '', pillar: '', energy: '', notes: '', actualStatus: '', skipReason: '' };
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

                    {/* Pillar */}
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

                    {/* Energy */}
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

                    {/* Notes or Status */}
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

        {/* Timesheet Summary */}
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
            {incomeEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Source (e.g., Client payment)"
                  value={entry.source}
                  onChange={e => { const arr = [...incomeEntries]; arr[i] = { ...arr[i], source: e.target.value }; setIncomeEntries(arr); }}
                  className="flex-1"
                />
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={entry.amount}
                    onChange={e => { const arr = [...incomeEntries]; arr[i] = { ...arr[i], amount: e.target.value }; setIncomeEntries(arr); }}
                    className="w-28 pl-6"
                  />
                </div>
                <Select value={entry.category} onValueChange={v => { const arr = [...incomeEntries]; arr[i] = { ...arr[i], category: v }; setIncomeEntries(arr); }}>
                  <SelectTrigger className="w-32 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coaching_fee">Coaching Fee</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="product_sale">Product Sale</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="other_income">Other</SelectItem>
                  </SelectContent>
                </Select>
                {incomeEntries.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setIncomeEntries(incomeEntries.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setIncomeEntries([...incomeEntries, { source: '', amount: '', category: '' }])} className="gap-1">
              <Plus className="w-3 h-3" /> Add Income
            </Button>
          </div>
        </div>

        {/* Expense */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">📤 Expense / Investment Today</p>
          <div className="space-y-2">
            {expenseEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Source (e.g., Venue booking)"
                  value={entry.source}
                  onChange={e => { const arr = [...expenseEntries]; arr[i] = { ...arr[i], source: e.target.value }; setExpenseEntries(arr); }}
                  className="flex-1"
                />
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={entry.amount}
                    onChange={e => { const arr = [...expenseEntries]; arr[i] = { ...arr[i], amount: e.target.value }; setExpenseEntries(arr); }}
                    className="w-28 pl-6"
                  />
                </div>
                <Select value={entry.category} onValueChange={v => { const arr = [...expenseEntries]; arr[i] = { ...arr[i], category: v }; setExpenseEntries(arr); }}>
                  <SelectTrigger className="w-32 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_investment">Business Investment</SelectItem>
                    <SelectItem value="personal_need">Personal Need</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="charity">Charity / Daan</SelectItem>
                    <SelectItem value="other_expense">Other</SelectItem>
                  </SelectContent>
                </Select>
                {expenseEntries.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setExpenseEntries(expenseEntries.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setExpenseEntries([...expenseEntries, { source: '', amount: '', category: '' }])} className="gap-1">
              <Plus className="w-3 h-3" /> Add Expense
            </Button>
          </div>
        </div>

        {/* Daily Totals */}
        {(() => {
          const totalIncome = incomeEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
          const totalExpense = expenseEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
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
          {/* Water Intake */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">💧 Water (glasses)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}>-</Button>
              <span className={cn('text-xl font-bold', waterGlasses >= 8 ? 'text-green-600' : 'text-foreground')}>{waterGlasses}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWaterGlasses(waterGlasses + 1)}>+</Button>
              <span className="text-xs text-muted-foreground">/8</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }} />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">👣 Steps</p>
            <Input placeholder="0" type="number" value={stepsTaken} onChange={e => setStepsTaken(e.target.value)} className="h-9" />
            <p className="text-[10px] text-muted-foreground">Goal: 10,000</p>
          </div>

          {/* Sleep */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">😴 Sleep (hrs)</p>
            <Input placeholder="0" type="number" step="0.5" value={sleepHours} onChange={e => setSleepHours(e.target.value)} className="h-9" />
            <Select value={sleepQuality} onValueChange={setSleepQuality}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Quality" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="deep">😴 Deep</SelectItem>
                <SelectItem value="restless">😵 Restless</SelectItem>
                <SelectItem value="interrupted">🌀 Interrupted</SelectItem>
                <SelectItem value="refreshed">🌟 Refreshed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Body Weight */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">⚖️ Weight (kg)</p>
            <Input placeholder="Optional" type="number" step="0.1" value={bodyWeight} onChange={e => setBodyWeight(e.target.value)} className="h-9" />
          </div>

          {/* Supplements */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">💊 Supplements</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={supplementsTaken} onCheckedChange={(c) => setSupplementsTaken(!!c)} />
              <span className="text-sm">{supplementsTaken ? 'Taken ✅' : 'Not yet'}</span>
            </label>
          </div>

          {/* Workout */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">🏋️ Workout</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={workoutDone} onCheckedChange={(c) => setWorkoutDone(!!c)} />
              <span className="text-sm">{workoutDone ? 'Done ✅' : 'Not yet'}</span>
            </label>
            {workoutDone && (
              <div className="flex gap-1">
                <Input placeholder="Type" value={workoutType} onChange={e => setWorkoutType(e.target.value)} className="h-8 text-xs flex-1" />
                <Input placeholder="Min" type="number" value={workoutDuration} onChange={e => setWorkoutDuration(e.target.value)} className="h-8 text-xs w-16" />
              </div>
            )}
          </div>

          {/* Screen Time */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">📱 Screen Time (hrs)</p>
            <Input placeholder="0" type="number" step="0.5" value={screenTime} onChange={e => setScreenTime(e.target.value)} className="h-9" />
          </div>

          {/* End Energy */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">⚡ Energy at Day End</p>
            <Slider value={endEnergyLevel} onValueChange={setEndEnergyLevel} max={10} min={1} step={1} />
            <p className="text-xs text-center">
              {endEnergyLevel[0] <= 3 ? '🔴' : endEnergyLevel[0] <= 6 ? '🟡' : '🟢'} {endEnergyLevel[0]}/10
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 7 — Aaj Ki Jeet & AHA Moment */}
      <div className="space-y-4">
        {/* Wins */}
        <div className="bg-card rounded-xl border-2 border-green-200 dark:border-green-800 p-5">
          <h2 className="text-lg font-bold mb-3">🏆 Aaj Ki Jeet (Today's Win)</h2>
          <p className="text-xs text-muted-foreground mb-3">At least 1 win is required — har jeet celebrate hoti hai!</p>
          <div className="space-y-2">
            {wins.map((win, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm">🏆</span>
                <Textarea
                  placeholder="Aaj maine kya achieve kiya, bada ya chhota..."
                  value={win}
                  onChange={e => { const arr = [...wins]; arr[i] = e.target.value; setWins(arr); }}
                  className="min-h-[60px] flex-1"
                />
                {wins.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setWins(wins.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            {wins.length < 3 && (
              <Button variant="outline" size="sm" onClick={() => setWins([...wins, ''])} className="gap-1">
                <Plus className="w-3 h-3" /> Add Another Win
              </Button>
            )}
          </div>
        </div>

        {/* AHA Moment */}
        <div className="bg-card rounded-xl border-2 border-amber-200 dark:border-amber-800 p-5 relative overflow-hidden">
          {ahaMoment && (
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
            value={ahaMoment}
            onChange={e => setAhaMoment(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-border p-3 -mx-4 flex flex-wrap gap-2 justify-center">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Save Draft
        </Button>
        <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
          <Check className="w-4 h-4" /> Submit Day
        </Button>
        <Button variant="outline" className="gap-2">
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
    </div>
  );
};

export default DailyWorksheet;
