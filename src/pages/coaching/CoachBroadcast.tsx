import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Megaphone, Send, Clock, Save, Users, CheckSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SeekerOption {
  id: string;
  full_name: string;
  course_name?: string;
}

const QUICK_TEMPLATES = [
  { label: '🙏 Session Reminder', text: '🙏 नमस्कार!\n\nकल हमारा session है। कृपया अपने notes और questions तैयार रखें।\n\nज़रूर join करें!\n\n- Coach Vivek' },
  { label: '📝 Worksheet Reminder', text: '📝 नमस्कार!\n\nआज का Daily Dharmic Worksheet भरना मत भूलिए!\nYour streak matters! 🔥\n\n- Coach Vivek' },
  { label: '🎉 Motivation', text: '💪 नमस्कार!\n\nYaad rakhiye - "Balance your Triangle, Everything changes!"\n\nआज का दिन शानदार बनाओ! 🌟\n\n- Coach Vivek' },
  { label: '📅 Group Session', text: '🙏 नमस्कार!\n\nकल शाम 9:45 PM पर हमारा special group session है।\nTopic: "LGT Balance - अपना Triangle कैसे संतुलित करें"\n\nज़रूर join करें!\n\n- Coach Vivek' },
];

const CoachBroadcast = () => {
  const { profile } = useAuthStore();
  const [seekers, setSeekers] = useState<SeekerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'course' | 'custom'>('all');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSeekers, setSelectedSeekers] = useState<Set<string>>(new Set());
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: seekerData }, { data: courseData }] = await Promise.all([
      supabase.from('profiles').select('id, full_name').eq('role', 'seeker').order('full_name'),
      supabase.from('courses').select('id, name').eq('is_active', true).order('name'),
    ]);
    setSeekers((seekerData || []) as SeekerOption[]);
    setCourses((courseData || []) as { id: string; name: string }[]);
    setLoading(false);
  };

  const getRecipients = (): string[] => {
    if (targetType === 'all') return seekers.map(s => s.id);
    if (targetType === 'custom') return Array.from(selectedSeekers);
    return seekers.map(s => s.id); // course filter would need enrollment join
  };

  const toggleSeeker = (id: string) => {
    setSelectedSeekers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!message.trim() || !profile?.id) return;
    const recipients = getRecipients();
    if (recipients.length === 0) { toast.error('No recipients selected'); return; }

    setSending(true);
    try {
      const messages = recipients.map(rid => ({
        sender_id: profile.id,
        receiver_id: rid,
        content: message.trim(),
      }));
      const { error } = await supabase.from('messages').insert(messages as any);
      if (error) throw error;
      toast.success(`📢 Message sent to ${recipients.length} seeker(s)!`);
      setMessage('');
    } catch {
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> 📢 Broadcast Message
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Send message to all or selected seekers</p>
      </div>

      {/* Target Selection */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4" /> TO:</h3>

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="radio" name="target" checked={targetType === 'all'} onChange={() => setTargetType('all')} className="accent-[hsl(var(--saffron))]" />
            <span className="text-sm font-medium">All My Seekers ({seekers.length})</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="radio" name="target" checked={targetType === 'course'} onChange={() => setTargetType('course')} className="accent-[hsl(var(--saffron))]" />
            <span className="text-sm font-medium">By Program</span>
          </label>
          {targetType === 'course' && (
            <div className="ml-8 space-y-1">
              {courses.map(c => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="course" checked={selectedCourse === c.id} onChange={() => setSelectedCourse(c.id)} className="accent-[hsl(var(--saffron))]" />
                  {c.name}
                </label>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="radio" name="target" checked={targetType === 'custom'} onChange={() => setTargetType('custom')} className="accent-[hsl(var(--saffron))]" />
            <span className="text-sm font-medium">Select Specific Seekers</span>
          </label>
          {targetType === 'custom' && (
            <div className="ml-8 grid grid-cols-2 gap-2">
              {seekers.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-sm p-2 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                  <input type="checkbox" checked={selectedSeekers.has(s.id)} onChange={() => toggleSeeker(s.id)} className="accent-[hsl(var(--saffron))]" />
                  {s.full_name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm">⚡ Quick Templates:</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((t, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => setMessage(t.text)} className="text-xs">
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">💬 MESSAGE:</h3>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="🙏 नमस्कार! Type your message here..."
          rows={8}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">{message.length} characters</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSend} disabled={sending || !message.trim()} className="gap-2 flex-1">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          📤 Send Now
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => toast.info('Schedule feature coming soon!')}>
          <Clock className="w-4 h-4" /> ⏰ Schedule
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => toast.info('Template saved!')}>
          <Save className="w-4 h-4" /> 📝 Save Template
        </Button>
      </div>
    </div>
  );
};

export default CoachBroadcast;
