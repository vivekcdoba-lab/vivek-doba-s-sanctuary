import { useState } from 'react';
import { useCoachingLang } from '@/components/CoachingLayout';
import { useCreateAssignment } from '@/hooks/useDbAssignments';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardPlus, Loader2, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const L = {
  title: { en: 'Create Assignment', hi: 'कार्य बनाएं' },
  step1: { en: 'Assignment Details', hi: 'कार्य विवरण' },
  step2: { en: 'Assign To', hi: 'किसे सौंपें' },
  step3: { en: 'Review & Create', hi: 'समीक्षा व बनाएं' },
  titleLabel: { en: 'Title', hi: 'शीर्षक' },
  description: { en: 'Description', hi: 'विवरण' },
  category: { en: 'Category', hi: 'श्रेणी' },
  type: { en: 'Type', hi: 'प्रकार' },
  dueDate: { en: 'Due Date', hi: 'नियत तिथि' },
  priority: { en: 'Priority', hi: 'प्राथमिकता' },
  assignTo: { en: 'Assign To', hi: 'किसे सौंपें' },
  individual: { en: 'Individual Seeker', hi: 'व्यक्तिगत साधक' },
  allSeekers: { en: 'All Seekers', hi: 'सभी साधक' },
  courseBatch: { en: 'Course Batch', hi: 'कोर्स बैच' },
  template: { en: 'Use Template', hi: 'टेम्पलेट उपयोग करें' },
  next: { en: 'Next', hi: 'अगला' },
  back: { en: 'Back', hi: 'पीछे' },
  create: { en: 'Create Assignment', hi: 'कार्य बनाएं' },
  creating: { en: 'Creating...', hi: 'बना रहे हैं...' },
  success: { en: 'Assignment created!', hi: 'कार्य बनाया गया!' },
  none: { en: 'None', hi: 'कोई नहीं' },
};

const CATEGORIES = [
  { value: 'reading', label: '📖 Reading', hi: '📖 पढ़ना' },
  { value: 'watching', label: '🎬 Watching', hi: '🎬 देखना' },
  { value: 'writing', label: '✍️ Reflection', hi: '✍️ चिंतन' },
  { value: 'action', label: '🎯 Action', hi: '🎯 कार्य' },
  { value: 'business', label: '💼 Business', hi: '💼 व्यापार' },
  { value: 'spiritual', label: '🧘 Spiritual', hi: '🧘 आध्यात्मिक' },
  { value: 'challenge', label: '💪 Challenge', hi: '💪 चुनौती' },
];

const TYPES = [
  { value: 'one_time', label: 'One Time', hi: 'एक बार' },
  { value: 'daily', label: 'Daily', hi: 'दैनिक' },
  { value: 'weekly', label: 'Weekly', hi: 'साप्ताहिक' },
  { value: 'ongoing', label: 'Ongoing', hi: 'निरंतर' },
];

const PRIORITIES = [
  { value: 'low', label: '🟢 Low', hi: '🟢 कम' },
  { value: 'medium', label: '🟡 Medium', hi: '🟡 मध्यम' },
  { value: 'high', label: '🔴 High', hi: '🔴 उच्च' },
];

const TEMPLATES = [
  { title: 'Read Chapter & Reflect', description: 'Read the assigned chapter and write a 200-word reflection on key takeaways.', category: 'reading', type: 'one_time', priority: 'medium' },
  { title: 'Daily Gratitude Journal', description: 'Write 3 things you are grateful for each day this week.', category: 'spiritual', type: 'daily', priority: 'medium' },
  { title: 'Business SWOT Analysis', description: 'Complete a detailed SWOT analysis for your business and identify top 3 action items.', category: 'business', type: 'one_time', priority: 'high' },
  { title: '30-Day Meditation Challenge', description: 'Meditate for at least 15 minutes daily for 30 days. Track your progress.', category: 'spiritual', type: 'ongoing', priority: 'medium' },
  { title: 'Weekly Review & Planning', description: 'Review the past week achievements and plan priorities for the upcoming week.', category: 'action', type: 'weekly', priority: 'high' },
  { title: 'Watch TED Talk & Summary', description: 'Watch the assigned TED Talk and write a summary with 3 key learnings.', category: 'watching', type: 'one_time', priority: 'low' },
];

type AssignMode = 'individual' | 'all' | 'course';

export default function CoachCreateAssignment() {
  const { lang } = useCoachingLang();
  const t = (key: keyof typeof L) => L[key][lang];
  const { data: seekers = [] } = useScopedSeekers();
  const { data: courses = [] } = useDbCourses();
  const createAssignment = useCreateAssignment();

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments-for-assign'],
    queryFn: async () => {
      const { data } = await supabase.from('enrollments').select('seeker_id, course_id').eq('status', 'active');
      return (data || []) as { seeker_id: string; course_id: string }[];
    },
  });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', category: 'action', type: 'one_time', due_date: '', priority: 'medium',
  });
  const [assignMode, setAssignMode] = useState<AssignMode>('individual');
  const [selectedSeeker, setSelectedSeeker] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setForm(p => ({ ...p, title: tpl.title, description: tpl.description, category: tpl.category, type: tpl.type, priority: tpl.priority }));
    toast.success('Template applied');
  };

  const getTargetSeekers = (): string[] => {
    if (assignMode === 'individual') return selectedSeeker ? [selectedSeeker] : [];
    if (assignMode === 'all') return seekers.map(s => s.id);
    if (assignMode === 'course' && selectedCourse) {
      return enrollments.filter(e => e.course_id === selectedCourse).map(e => e.seeker_id);
    }
    return [];
  };

  const handleCreate = async () => {
    const targets = getTargetSeekers();
    if (!form.title.trim() || !form.due_date || targets.length === 0) {
      toast.error('Please fill all required fields and select at least one seeker');
      return;
    }
    // Confirm bulk operations
    if (targets.length > 10) {
      const ok = window.confirm(`This will create ${targets.length} assignments — one for each seeker. Continue?`);
      if (!ok) return;
    }
    setIsCreating(true);
    try {
      for (const seekerId of targets) {
        await createAssignment.mutateAsync({
          seeker_id: seekerId,
          title: form.title.trim(),
          due_date: form.due_date,
          description: form.description.trim() || undefined,
          type: form.type,
          priority: form.priority,
          course_id: assignMode === 'course' ? selectedCourse : undefined,
        });
      }
      toast.success(`${targets.length} assignment(s) created!`);
      setForm({ title: '', description: '', category: 'action', type: 'one_time', due_date: '', priority: 'medium' });
      setSelectedSeeker('');
      setSelectedCourse('');
      setStep(0);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create');
    } finally {
      setIsCreating(false);
    }
  };

  const seekerNameById = (id: string) => seekers.find(s => s.id === id)?.full_name || id;
  const courseNameById = (id: string) => courses.find(c => c.id === id)?.name || id;

  const steps = [t('step1'), t('step2'), t('step3')];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ClipboardPlus className="w-6 h-6 text-saffron" /> {t('title')}
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button onClick={() => i < step && setStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-dharma-green text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('step1')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Templates */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('template')}</label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tpl, i) => (
                  <button key={i} onClick={() => applyTemplate(tpl)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-input bg-background hover:bg-muted transition-colors text-foreground">
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('titleLabel')} *</label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Complete SWOT Analysis" className="mt-1" maxLength={200} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">{t('description')}</label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Detailed instructions for the assignment..." className="mt-1 min-h-[120px]" maxLength={2000} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('category')}</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{lang === 'hi' ? c.hi : c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('type')}</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{lang === 'hi' ? t.hi : t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('dueDate')} *</label>
                <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t('priority')}</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{lang === 'hi' ? p.hi : p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!form.title.trim() || !form.due_date}>
                {t('next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Assign To */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('step2')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {([
                { mode: 'individual' as AssignMode, label: t('individual'), emoji: '👤' },
                { mode: 'all' as AssignMode, label: t('allSeekers'), emoji: '👥' },
                { mode: 'course' as AssignMode, label: t('courseBatch'), emoji: '📚' },
              ]).map(opt => (
                <button key={opt.mode} onClick={() => setAssignMode(opt.mode)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    assignMode === opt.mode ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'
                  }`}>
                  <div className="text-2xl mb-1">{opt.emoji}</div>
                  <div className="text-xs font-medium text-foreground">{opt.label}</div>
                </button>
              ))}
            </div>

            {assignMode === 'individual' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Select Seeker *</label>
                <select value={selectedSeeker} onChange={e => setSelectedSeeker(e.target.value)}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="">Choose a seeker</option>
                  {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
            )}

            {assignMode === 'all' && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-foreground">This will create an assignment for <strong>{seekers.length} seekers</strong></p>
              </div>
            )}

            {assignMode === 'course' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Select Course *</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full mt-1 border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="">Choose a course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {selectedCourse && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {enrollments.filter(e => e.course_id === selectedCourse).length} seekers enrolled
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>{t('back')}</Button>
              <Button onClick={() => setStep(2)} disabled={getTargetSeekers().length === 0}>
                {t('next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('step3')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('titleLabel')}</span>
                <span className="text-sm font-semibold text-foreground">{form.title}</span>
              </div>
              {form.description && (
                <div>
                  <span className="text-xs text-muted-foreground">{t('description')}</span>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{form.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-xs text-muted-foreground">{t('category')}:</span> <Badge variant="outline">{form.category}</Badge></div>
                <div><span className="text-xs text-muted-foreground">{t('type')}:</span> <Badge variant="outline">{form.type}</Badge></div>
                <div><span className="text-xs text-muted-foreground">{t('dueDate')}:</span> <span className="font-medium">{form.due_date}</span></div>
                <div><span className="text-xs text-muted-foreground">{t('priority')}:</span> <Badge variant={form.priority === 'high' ? 'destructive' : 'outline'}>{form.priority}</Badge></div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('assignTo')}:</span>
                <div className="mt-1">
                  {assignMode === 'individual' && <Badge>{seekerNameById(selectedSeeker)}</Badge>}
                  {assignMode === 'all' && <Badge>{seekers.length} seekers</Badge>}
                  {assignMode === 'course' && <Badge>{courseNameById(selectedCourse)} ({enrollments.filter(e => e.course_id === selectedCourse).length} seekers)</Badge>}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>{t('back')}</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardPlus className="w-4 h-4 mr-2" />}
                {isCreating ? t('creating') : t('create')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
