import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Bell, Globe, Moon, Sun, Phone, Mail, Shield, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useTrainerPrograms } from '@/hooks/useProgramTrainers';

const ROLE_LABEL: Record<string, string> = { lead: 'Lead', co_coach: 'Co-coach', assistant: 'Assistant' };
const ROLE_COLOR: Record<string, string> = {
  lead: 'bg-[#FF6B00] text-white',
  co_coach: 'bg-amber-100 text-amber-900',
  assistant: 'bg-slate-100 text-slate-800',
};

export default function CoachSettings() {
  const { profile, darkMode, toggleDarkMode } = useAuthStore();
  const { data: myPrograms = [] } = useTrainerPrograms(profile?.id);
  const [notifications, setNotifications] = useState({
    worksheetReminder: true,
    sessionAlert: true,
    assignmentDue: true,
    seekerActivity: false,
    weeklyReport: true,
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#FF6B00]" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <Card className="p-5">
        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4"><User className="w-4 h-4" /> Profile</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Full Name</span>
            <span className="text-sm font-medium text-foreground">{profile?.full_name || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
            <span className="text-sm font-medium text-foreground">{profile?.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span>
            <span className="text-sm font-medium text-foreground">—</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Role</span>
            <Badge className="bg-[#FF6B00] text-white">{profile?.role || 'coach'}</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4" /> My Programs</h3>
        {myPrograms.length === 0 ? (
          <p className="text-sm text-muted-foreground">You are not assigned to any programs yet. Ask an admin to assign you on the Program Coaches page.</p>
        ) : (
          <div className="space-y-2">
            {myPrograms.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.program?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{p.program?.tier}</p>
                </div>
                <Badge className={`${ROLE_COLOR[p.role] || ''} border-0`}>{ROLE_LABEL[p.role] || p.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4"><Bell className="w-4 h-4" /> Notifications</h3>
        <div className="space-y-3">
          {[
            { key: 'worksheetReminder', label: '📝 Worksheet Submission Reminders', desc: 'Get notified when seekers miss worksheets' },
            { key: 'sessionAlert', label: '📅 Session Alerts', desc: 'Reminders before scheduled sessions' },
            { key: 'assignmentDue', label: '✅ Assignment Due Dates', desc: 'Alerts when assignments are due' },
            { key: 'seekerActivity', label: '👥 Seeker Activity Updates', desc: 'Real-time seeker activity notifications' },
            { key: 'weeklyReport', label: '📊 Weekly Report', desc: 'Auto-generated weekly performance summary' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4"><Globe className="w-4 h-4" /> Preferences</h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground flex items-center gap-1">
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} Dark Mode
            </p>
            <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        </div>
      </Card>
    </div>
  );
}
