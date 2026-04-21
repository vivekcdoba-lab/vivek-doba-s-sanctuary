import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Save, Settings, MessageSquare, Mail, Smartphone, Zap, FileSignature, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import ChangeOwnPasswordForm from '@/components/admin/ChangeOwnPasswordForm';
import type { AutomationRule } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const channelIcons: Record<string, typeof MessageSquare> = { whatsapp: MessageSquare, email: Mail, sms: Smartphone, in_app: Bell, dashboard: Settings };
const channelColors: Record<string, string> = { whatsapp: 'text-dharma-green', email: 'text-sky-blue', sms: 'text-saffron', in_app: 'text-primary', dashboard: 'text-muted-foreground' };

const AUTOMATION_RULES: AutomationRule[] = [
  { id: 'ar1', label: 'Session Confirmation (24hr)', description: 'Show confirm card on seeker dashboard + WhatsApp', enabled: true, trigger: '24 hours before session', channel: 'whatsapp', message_template: '🙏 Namaste {name} ji, your session with Vivek Sir is tomorrow at {time}. Please confirm.' },
  { id: 'ar2', label: 'Session Reminder (1hr)', description: 'Last-minute reminder before session', enabled: true, trigger: '1 hour before confirmed session', channel: 'whatsapp', message_template: '🙏 Reminder: Your session starts in 1 hour at {time}. Be prepared with your notes.' },
  { id: 'ar3', label: 'Missed Session Alert', description: '15 min after start, no Start clicked → auto-mark missed', enabled: true, trigger: '15 min after session start', channel: 'dashboard' },
  { id: 'ar4', label: 'Post-Session Feedback', description: 'Show feedback form 1 hour after session completion', enabled: true, trigger: '1 hour after session completed', channel: 'in_app' },
  { id: 'ar5', label: 'Daily Log Reminder (Evening)', description: 'Remind if daily log not submitted by 9 PM', enabled: true, trigger: '9:00 PM IST, no log today', channel: 'whatsapp', message_template: '🌙 {name}, your daily transformation log is waiting. Even 5 minutes of reflection matters. 🙏' },
  { id: 'ar6', label: 'Daily Log Reminder (Morning)', description: 'Remind if yesterday log not submitted', enabled: true, trigger: '8:00 AM IST, yesterday log missing', channel: 'in_app' },
  { id: 'ar7', label: 'Streak Warning', description: 'Alert when streak at risk (8 PM, no log today)', enabled: true, trigger: '8:00 PM, streak at risk', channel: 'whatsapp', message_template: '🔥 {name}, your {streak}-day streak is at risk! Don\'t break the chain. Log now! 💪' },
  { id: 'ar8', label: 'Streak Celebration', description: 'Celebrate at 7, 14, 30, 60, 90 days', enabled: true, trigger: 'Streak hits milestone', channel: 'in_app' },
  { id: 'ar9', label: 'Assignment Due Tomorrow', description: 'Remind 24hr before assignment due', enabled: true, trigger: '24 hours before due date', channel: 'whatsapp', message_template: '📝 Reminder: Your assignment \'{title}\' is due tomorrow. Submit when ready!' },
  { id: 'ar10', label: 'Assignment Overdue', description: 'Alert seeker + coach when overdue', enabled: true, trigger: '1 day after due, not submitted', channel: 'whatsapp' },
  { id: 'ar11', label: 'Payment Due Reminder', description: 'Remind 3 days before payment due', enabled: true, trigger: '3 days before payment due', channel: 'whatsapp', message_template: '💰 {name} ji, your payment of ₹{amount} is due on {date}. UPI: vivekdoba@sbi. Thank you! 🙏' },
  { id: 'ar12', label: 'Inactive Seeker Detection', description: 'Alert after 5 days no activity', enabled: true, trigger: 'No activity for 5 days', channel: 'dashboard' },
  { id: 'ar13', label: 'Risk Level Change', description: 'Notify when risk crosses threshold', enabled: true, trigger: 'Risk score crosses level boundary', channel: 'dashboard' },
  { id: 'ar14', label: 'Journey Stage Stagnation', description: 'Alert when stuck in same stage 45+ days', enabled: true, trigger: '45+ days in same journey stage', channel: 'dashboard' },
  { id: 'ar15', label: 'New Application Received', description: 'Notify on new form submission', enabled: true, trigger: 'Any form submitted', channel: 'dashboard' },
];

const BASE_TABS = ['General', 'Email Sender', 'Notifications', 'Automation Rules', 'Business Info', 'Appearance'];

const SettingsPage = () => {
  const profile = useAuthStore(s => s.profile);
  const isSuperAdmin = profile?.role === 'admin' && profile?.admin_level === 'super_admin';
  const tabs = isSuperAdmin ? [...BASE_TABS, 'Security'] : BASE_TABS;
  const [activeTab, setActiveTab] = useState('Automation Rules');
  const [rules, setRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem('vdts_automation_rules');
    return saved ? JSON.parse(saved) : AUTOMATION_RULES;
  });
  const { toast } = useToast();

  // Email sender configuration
  const [emailFrom, setEmailFrom] = useState<string>('');
  const [emailFromLoading, setEmailFromLoading] = useState(true);
  const [emailFromSaving, setEmailFromSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'email_from')
          .maybeSingle();
        const v = data?.value;
        setEmailFrom(typeof v === 'string' ? v : 'VDTS <info@vivekdoba.com>');
      } catch {
        setEmailFrom('VDTS <info@vivekdoba.com>');
      } finally {
        setEmailFromLoading(false);
      }
    })();
  }, []);

  const saveEmailFrom = async () => {
    const trimmed = emailFrom.trim();
    if (!trimmed) {
      toast({ title: 'Sender required', description: 'Please enter an email sender address.', variant: 'destructive' });
      return;
    }
    setEmailFromSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'email_from', value: trimmed, updated_by: userData.user?.id ?? null }, { onConflict: 'key' });
    setEmailFromSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Email sender updated', description: 'All outgoing emails will use this sender.' });
    }
  };

  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const updateChannel = (id: string, channel: AutomationRule['channel']) => setRules(prev => prev.map(r => r.id === id ? { ...r, channel } : r));

  const saveRules = () => {
    localStorage.setItem('vdts_automation_rules', JSON.stringify(rules));
    toast({ title: '✅ Settings saved', description: 'Automation rules updated successfully' });
  };

  const { data: automationHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['admin-automation-history'],
    queryFn: async () => {
      const [notifRes, auditRes, sigRes] = await Promise.all([
        supabase.from('notifications').select('id,type,title,message,created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('session_audit_log').select('id,action,created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('signature_requests').select('id,status,signer_name,sent_at,signed_at,cancelled_at,created_at').order('created_at', { ascending: false }).limit(20),
      ]);
      const items: { id: string; emoji: string; action: string; ts: string }[] = [];
      const emojiFor = (t?: string) => {
        const k = (t || '').toLowerCase();
        if (k.includes('payment')) return '💰';
        if (k.includes('reminder')) return '⏰';
        if (k.includes('celebr') || k.includes('streak')) return '🔥';
        if (k.includes('application') || k.includes('enrol')) return '📝';
        if (k.includes('missed')) return '⚠️';
        return '🔔';
      };
      (notifRes.data || []).forEach((n: any) => items.push({
        id: `n-${n.id}`,
        emoji: emojiFor(n.type),
        action: n.title || n.message || 'Notification sent',
        ts: n.created_at,
      }));
      (auditRes.data || []).forEach((a: any) => items.push({
        id: `a-${a.id}`,
        emoji: '🛠️',
        action: a.action ? a.action.replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'System action',
        ts: a.created_at,
      }));
      (sigRes.data || []).forEach((s: any) => {
        const status = s.status || 'pending';
        const verb = status === 'signed' ? 'signed' : status === 'cancelled' ? 'cancelled' : status === 'expired' ? 'expired' : 'sent';
        items.push({
          id: `s-${s.id}`,
          emoji: status === 'signed' ? '✍️' : status === 'cancelled' ? '🚫' : '📄',
          action: `Document ${verb}${s.signer_name ? ` — ${s.signer_name}` : ''}`,
          ts: s.signed_at || s.cancelled_at || s.sent_at || s.created_at,
        });
      });
      return items
        .filter(i => i.ts)
        .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
        .slice(0, 20);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {t === 'Automation Rules' ? '🤖 ' + t : t === 'Security' ? '🔐 ' + t : t}
          </button>
        ))}
      </div>

      {activeTab === 'Automation Rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Automation Engine — 15 Rules
              </h2>
              <p className="text-sm text-muted-foreground">Toggle rules ON/OFF. Customize channels and timing.</p>
            </div>
            <Button onClick={saveRules} className="gap-2">
              <Save className="w-4 h-4" /> Save Rules
            </Button>
          </div>

          <div className="space-y-3">
            {rules.map(rule => {
              const ChannelIcon = channelIcons[rule.channel] || Bell;
              return (
                <div key={rule.id} className={`bg-card rounded-xl p-4 shadow-sm border transition-all ${rule.enabled ? 'border-primary/20' : 'border-border opacity-60'}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleRule(rule.id)}
                      className={`mt-0.5 w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${rule.enabled ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{rule.label}</p>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                      <p className="text-[10px] text-primary/60 mt-0.5">Trigger: {rule.trigger}</p>
                      {rule.enabled && (
                        <div className="flex items-center gap-3 mt-2">
                          <select value={rule.channel} onChange={e => updateChannel(rule.id, e.target.value as AutomationRule['channel'])}
                            className="rounded border border-input bg-background px-2 py-1 text-xs">
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="in_app">In-App</option>
                            <option value="dashboard">Dashboard</option>
                          </select>
                          {rule.message_template && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[300px]">
                              📝 {rule.message_template.slice(0, 60)}...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChannelIcon className={`w-4 h-4 flex-shrink-0 ${channelColors[rule.channel]}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Documents & Signatures helper banner */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileSignature className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Need to send a document for signature?</p>
                <p className="text-xs text-muted-foreground">Open a seeker's profile → Documents &amp; Signatures tab, or manage the library.</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button asChild size="sm" variant="default">
                <Link to="/admin/documents"><FileSignature className="w-3.5 h-3.5 mr-1" /> Document Library</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/seekers"><Users className="w-3.5 h-3.5 mr-1" /> Find a Seeker</Link>
              </Button>
            </div>
          </div>

          {/* Automation History */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-3">📜 Recent Automation History</h3>
            <div className="space-y-2">
              {historyLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : automationHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No automation activity yet — events will appear here as the system runs.</p>
              ) : (
                automationHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0">{h.emoji}</span>
                      <p className="text-sm text-foreground truncate">{h.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{formatDistanceToNow(new Date(h.ts), { addSuffix: true })}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Notifications' && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground">Notification preferences are now managed through the Automation Rules tab. Each rule controls its own channel (WhatsApp, Email, SMS, In-App).</p>
        </div>
      )}

      {activeTab === 'Email Sender' && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Email Sender Configuration</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            This address is used as the <strong>From</strong> for every email the platform sends — OTPs,
            credentials, application updates, daily reports, and notifications. The domain must be verified in Resend.
          </p>

          <div className="space-y-2">
            <Label htmlFor="email_from">From Address</Label>
            <Input
              id="email_from"
              placeholder="VDTS <info@vivekdoba.com>"
              value={emailFrom}
              disabled={emailFromLoading || emailFromSaving}
              onChange={(e) => setEmailFrom(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Format: <code className="bg-muted px-1 rounded">Display Name &lt;email@domain.com&gt;</code> (e.g.
              <code className="bg-muted px-1 rounded ml-1">VDTS &lt;info@vivekdoba.com&gt;</code>)
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={saveEmailFrom} disabled={emailFromLoading || emailFromSaving} className="gap-2">
              <Save className="w-4 h-4" /> {emailFromSaving ? 'Saving…' : 'Save Sender'}
            </Button>
            <span className="text-xs text-muted-foreground">
              Changes take effect immediately for all emails.
            </span>
          </div>
        </div>
      )}

      {activeTab === 'General' && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-foreground">App Name</label><input defaultValue="Vivek Doba Training Solutions" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Timezone</label><select defaultValue="IST" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option>IST (Asia/Kolkata)</option></select></div>
            <div><label className="text-sm font-medium text-foreground">Date Format</label><select defaultValue="DD/MM/YYYY" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option></select></div>
            <div><label className="text-sm font-medium text-foreground">Currency</label><input defaultValue="₹ (INR)" disabled className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm opacity-60" /></div>
          </div>
        </div>
      )}

      {activeTab === 'Business Info' && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Business Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-foreground">Business Name</label><input defaultValue="Vivek Doba Training Solutions" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Phone</label><input defaultValue="9607050111" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Email</label><input defaultValue="info@vivekdoba.com" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Website</label><input defaultValue="vivekdoba.com" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">GSTIN</label><input defaultValue="27XXXXXXXXXXXZX" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">PAN</label><input defaultValue="XXXXX1234X" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Bank Name</label><input defaultValue="State Bank of India" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">UPI ID</label><input defaultValue="vivekdoba@sbi" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
          </div>
        </div>
      )}

      {activeTab === 'Appearance' && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          <p className="text-sm text-muted-foreground">Dark mode toggle is available in the sidebar. Additional theme customization coming soon. 🙏</p>
        </div>
      )}

      {activeTab === 'Security' && isSuperAdmin && (
        <ChangeOwnPasswordForm />
      )}
    </div>
  );
};

export default SettingsPage;
