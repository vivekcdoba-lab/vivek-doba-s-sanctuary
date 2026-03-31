import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Mail, Smartphone, Bell, Send, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Channel = 'whatsapp' | 'email' | 'sms' | 'in_app';
type TemplateKey = 'assignment_overdue' | 'session_tomorrow' | 'payment_due' | 'daily_log_missing' | 'general_checkin' | 'streak_congrats' | 'custom';

interface SendReminderModalProps {
  open: boolean;
  onClose: () => void;
  seekerName: string;
  seekerPhone: string;
  seekerEmail: string;
  context?: 'assignment' | 'session' | 'payment' | 'tracking' | 'general';
  contextData?: {
    assignmentTitle?: string;
    dueDate?: string;
    daysOverdue?: number;
    sessionNumber?: number;
    sessionDate?: string;
    sessionTime?: string;
    amount?: string;
    courseName?: string;
    daysMissed?: number;
    lastStreak?: number;
    streakCount?: number;
  };
}

const TEMPLATES: { key: TemplateKey; label: string; icon: string }[] = [
  { key: 'assignment_overdue', label: '⚠️ Assignment Overdue', icon: '⚠️' },
  { key: 'session_tomorrow', label: '📅 Session Tomorrow', icon: '📅' },
  { key: 'payment_due', label: '💰 Payment Due', icon: '💰' },
  { key: 'daily_log_missing', label: '🌅 Daily Log Missing', icon: '🌅' },
  { key: 'general_checkin', label: '🤝 General Check-in', icon: '🤝' },
  { key: 'streak_congrats', label: '🔥 Streak Congratulations', icon: '🔥' },
  { key: 'custom', label: '✍️ Custom Message', icon: '✍️' },
];

const CHANNELS: { key: Channel; label: string; icon: typeof MessageSquare; color: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-dharma-green/10 text-dharma-green border-dharma-green/30' },
  { key: 'email', label: 'Email', icon: Mail, color: 'bg-sky-blue/10 text-sky-blue border-sky-blue/30' },
  { key: 'sms', label: 'SMS', icon: Smartphone, color: 'bg-saffron/10 text-saffron border-saffron/30' },
  { key: 'in_app', label: 'In-App', icon: Bell, color: 'bg-primary/10 text-primary border-primary/30' },
];

function generateMessage(template: TemplateKey, seekerName: string, data?: SendReminderModalProps['contextData']): string {
  const sign = '\n\n🙏 Vivek Doba\nVivek Doba Training Solutions\nvivekdoba.in | 9607050111';

  switch (template) {
    case 'assignment_overdue':
      return `🙏 Namaste ${seekerName} ji,\n\nYour assignment "${data?.assignmentTitle || 'Assignment'}" was due on ${data?.dueDate || 'recently'} and is now ${data?.daysOverdue || 'a few'} days overdue.\n\nPlease complete and submit it at your earliest. If you need any help, I'm here for you.${sign}`;
    case 'session_tomorrow':
      return `🙏 Namaste ${seekerName} ji,\n\nReminder: Your coaching session #${data?.sessionNumber || ''} is scheduled for tomorrow (${data?.sessionDate || ''}) at ${data?.sessionTime || ''}.\n\nPlease prepare by reviewing your assignments and noting any questions. Be ready 5 minutes before.\n\nLooking forward to our session! 🙏\nVivek Doba`;
    case 'payment_due':
      return `🙏 Namaste ${seekerName} ji,\n\nThis is a gentle reminder that your payment of ${data?.amount || '₹'} for ${data?.courseName || 'your program'} is due on ${data?.dueDate || 'soon'}.\n\nPayment options:\n💳 UPI: vivekdoba@sbi\n🏦 Bank Transfer: SBI A/C XXXXXXXXXXXX, IFSC SBIN0001234\n\nThank you for your commitment to transformation!\nVivek Doba | 9607050111`;
    case 'daily_log_missing':
      return `🙏 Namaste ${seekerName} ji,\n\nI noticed your daily transformation log hasn't been submitted for ${data?.daysMissed || 'a few'} days. Your streak was at ${data?.lastStreak || 0} days!\n\nRemember — consistency is the bridge between your goals and achievements. Even 10 minutes of reflection counts.\n\nTake a moment today to log your practice. 🧘\nVivek Doba`;
    case 'general_checkin':
      return `🙏 Namaste ${seekerName} ji,\n\nJust checking in — how is your journey going? It's been a while since we connected.\n\nRemember: every step on this path counts, no matter how small. I'm here whenever you need guidance.${sign}`;
    case 'streak_congrats':
      return `🎉 Congratulations ${seekerName}!\n\nYou've hit an incredible ${data?.streakCount || ''}-day streak! 🔥🔥🔥\n\nThis kind of consistency is what separates seekers who transform from those who merely aspire. You are truly walking the path.\n\nKeep this fire burning! 🙏\nVivek Doba`;
    case 'custom':
      return '';
    default:
      return '';
  }
}

function getSubject(template: TemplateKey, data?: SendReminderModalProps['contextData']): string {
  switch (template) {
    case 'assignment_overdue': return `Reminder: Assignment Due — Vivek Doba Training Solutions`;
    case 'session_tomorrow': return `Session Reminder — Vivek Doba Training Solutions`;
    case 'payment_due': return `Payment Reminder — Vivek Doba Training Solutions`;
    case 'daily_log_missing': return `Daily Log Reminder — Vivek Doba Training Solutions`;
    case 'general_checkin': return `Checking In — Vivek Doba Training Solutions`;
    case 'streak_congrats': return `Congratulations on Your Streak! — Vivek Doba Training Solutions`;
    default: return `Message from Vivek Doba Training Solutions`;
  }
}

const SendReminderModal = ({ open, onClose, seekerName, seekerPhone, seekerEmail, context, contextData }: SendReminderModalProps) => {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [template, setTemplate] = useState<TemplateKey>(
    context === 'assignment' ? 'assignment_overdue' :
    context === 'session' ? 'session_tomorrow' :
    context === 'payment' ? 'payment_due' :
    context === 'tracking' ? 'daily_log_missing' : 'general_checkin'
  );
  const [message, setMessage] = useState(() => generateMessage(
    context === 'assignment' ? 'assignment_overdue' :
    context === 'session' ? 'session_tomorrow' :
    context === 'payment' ? 'payment_due' :
    context === 'tracking' ? 'daily_log_missing' : 'general_checkin',
    seekerName, contextData
  ));
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const { toast } = useToast();

  const handleTemplateChange = (key: TemplateKey) => {
    setTemplate(key);
    setMessage(generateMessage(key, seekerName, contextData));
  };

  const handleSend = () => {
    const phone = seekerPhone.replace(/\D/g, '');
    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
        toast({ title: '✅ WhatsApp opened', description: `Message prepared for ${seekerName}` });
        break;
      case 'email':
        window.location.href = `mailto:${seekerEmail}?subject=${encodeURIComponent(getSubject(template, contextData))}&body=${encodeURIComponent(message)}`;
        toast({ title: '✅ Email draft opened', description: `Email prepared for ${seekerName}` });
        break;
      case 'sms':
        window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
        toast({ title: '✅ SMS opened', description: `SMS prepared for ${seekerName}` });
        break;
      case 'in_app':
        toast({ title: '✅ In-app notification sent', description: `Notification sent to ${seekerName}` });
        break;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="w-5 h-5 text-primary" /> Send Reminder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* To */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">To</p>
            <p className="font-semibold text-foreground">{seekerName}</p>
            <p className="text-xs text-muted-foreground">{seekerPhone} · {seekerEmail}</p>
          </div>

          {/* Channel */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Channel</p>
            <div className="grid grid-cols-4 gap-2">
              {CHANNELS.map((c) => (
                <button key={c.key} onClick={() => setChannel(c.key)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${channel === c.key ? c.color + ' border-current' : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
                  <c.icon className="w-4 h-4" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Template</p>
            <select value={template} onChange={(e) => handleTemplateChange(e.target.value as TemplateKey)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              {TEMPLATES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Message Preview</p>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)}
              className="min-h-[160px] text-sm" placeholder="Type your message..." />
            <p className="text-[10px] text-muted-foreground mt-1">You can edit the message before sending</p>
          </div>

          {/* Schedule */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Schedule</p>
            <div className="flex gap-3">
              <button onClick={() => setScheduleMode('now')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${scheduleMode === 'now' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Send className="w-3 h-3" /> Send Now
              </button>
              <button onClick={() => setScheduleMode('later')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${scheduleMode === 'later' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Clock className="w-3 h-3" /> Schedule Later
              </button>
            </div>
            {scheduleMode === 'later' && (
              <div className="flex gap-2 mt-2">
                <input type="date" className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                <input type="time" className="w-28 rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSend} className="flex-1 gap-2">
              <Send className="w-4 h-4" /> Send Reminder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendReminderModal;
