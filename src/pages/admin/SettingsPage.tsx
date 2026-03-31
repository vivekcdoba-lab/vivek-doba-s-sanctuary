import { useState } from 'react';
import { Bell, Save, Settings, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AutoRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  timing: number;
  timingUnit: 'hours' | 'days';
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app';
}

const DEFAULT_RULES: AutoRule[] = [
  { id: 'r1', label: 'Session Reminder — 24 hours before', description: 'Automatically remind seekers about upcoming sessions', enabled: true, timing: 24, timingUnit: 'hours', channel: 'whatsapp' },
  { id: 'r2', label: 'Session Reminder — 1 hour before', description: 'Last-minute session reminder', enabled: true, timing: 1, timingUnit: 'hours', channel: 'in_app' },
  { id: 'r3', label: 'Daily Log Not Submitted — by 9 PM', description: 'Remind if daily log not submitted by evening', enabled: true, timing: 21, timingUnit: 'hours', channel: 'whatsapp' },
  { id: 'r4', label: 'Assignment Overdue — 1 day after', description: 'Remind when assignment becomes overdue', enabled: true, timing: 1, timingUnit: 'days', channel: 'whatsapp' },
  { id: 'r5', label: 'Payment Due — 3 days before', description: 'Payment reminder before due date', enabled: true, timing: 3, timingUnit: 'days', channel: 'email' },
  { id: 'r6', label: 'Inactive Seeker — 7+ days', description: 'Check-in with inactive seekers', enabled: true, timing: 7, timingUnit: 'days', channel: 'whatsapp' },
  { id: 'r7', label: 'Streak Milestone — 7, 14, 30, 60, 90 days', description: 'Congratulate seekers on streak milestones', enabled: true, timing: 0, timingUnit: 'days', channel: 'in_app' },
];

const channelIcons: Record<string, typeof MessageSquare> = { whatsapp: MessageSquare, email: Mail, sms: Smartphone, in_app: Bell };
const channelColors: Record<string, string> = { whatsapp: 'text-dharma-green', email: 'text-sky-blue', sms: 'text-saffron', in_app: 'text-primary' };

const tabs = ['General', 'Notifications', 'Business Info', 'Appearance'];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Notifications');
  const [rules, setRules] = useState<AutoRule[]>(() => {
    const saved = localStorage.getItem('vdts_auto_rules');
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });
  const { toast } = useToast();

  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const updateChannel = (id: string, channel: AutoRule['channel']) => setRules(prev => prev.map(r => r.id === id ? { ...r, channel } : r));
  const updateTiming = (id: string, timing: number) => setRules(prev => prev.map(r => r.id === id ? { ...r, timing } : r));

  const saveRules = () => {
    localStorage.setItem('vdts_auto_rules', JSON.stringify(rules));
    toast({ title: '✅ Settings saved', description: 'Auto-reminder rules updated successfully' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Auto-Reminder Rules
              </h2>
              <p className="text-sm text-muted-foreground">Configure automatic reminders for seekers</p>
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
                      {rule.enabled && (
                        <div className="flex items-center gap-3 mt-2">
                          {rule.id !== 'r7' && (
                            <div className="flex items-center gap-1">
                              <input type="number" value={rule.timing} onChange={e => updateTiming(rule.id, Number(e.target.value))}
                                className="w-14 rounded border border-input bg-background px-2 py-1 text-xs" min={0} />
                              <span className="text-xs text-muted-foreground">{rule.timingUnit}</span>
                            </div>
                          )}
                          <select value={rule.channel} onChange={e => updateChannel(rule.id, e.target.value as AutoRule['channel'])}
                            className="rounded border border-input bg-background px-2 py-1 text-xs">
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="in_app">In-App</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <ChannelIcon className={`w-4 h-4 flex-shrink-0 ${channelColors[rule.channel]}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground italic">
            Auto-reminders create scheduled entries. For WhatsApp/Email/SMS, you'll be prompted to send when the time arrives.
          </p>
        </div>
      )}

      {activeTab === 'General' && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">App Name</label>
              <input defaultValue="Vivek Doba Training Solutions" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Timezone</label>
              <select defaultValue="IST" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option>IST (Asia/Kolkata)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Date Format</label>
              <select defaultValue="DD/MM/YYYY" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Currency</label>
              <input defaultValue="₹ (INR)" disabled className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm opacity-60" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Business Info' && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Business Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-foreground">Business Name</label><input defaultValue="Vivek Doba Training Solutions" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Phone</label><input defaultValue="9607050111" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Email</label><input defaultValue="info@vivekdoba.in" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-sm font-medium text-foreground">Website</label><input defaultValue="vivekdoba.in" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
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
    </div>
  );
};

export default SettingsPage;
