import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Save, LogOut, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useBadges } from '@/hooks/useBadges';
import { format } from 'date-fns';

const SeekerProfile = () => {
  const { profile: authProfile, logout } = useAuthStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seekerProfileId, setSeekerProfileId] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    full_name: '', email: '', phone: '', city: '', state: '',
    occupation: '', company: '', dob: '', gender: '', pincode: '',
    whatsapp: '', hometown: '', linkedin_url: '',
    blood_group: '', designation: '', industry: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) {
        setSeekerProfileId(data.id);
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
          occupation: data.occupation || '',
          company: data.company || '',
          dob: data.dob || '',
          gender: data.gender || '',
          pincode: data.pincode || '',
          whatsapp: data.whatsapp || '',
          hometown: data.hometown || '',
          linkedin_url: data.linkedin_url || '',
          blood_group: data.blood_group || '',
          designation: data.designation || '',
          industry: data.industry || '',
        });
      }
    } catch {
      toast({ title: 'Failed to load profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!seekerProfileId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        occupation: profile.occupation,
        company: profile.company,
        dob: profile.dob || null,
        gender: profile.gender,
        pincode: profile.pincode,
        whatsapp: profile.whatsapp,
        hometown: profile.hometown,
        linkedin_url: profile.linkedin_url,
        blood_group: profile.blood_group,
        designation: profile.designation,
        industry: profile.industry,
      }).eq('id', seekerProfileId);
      if (error) throw error;
      toast({ title: '✅ Profile saved!' });
      setEditing(false);
    } catch {
      toast({ title: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const { progress, earnedBadges } = useBadges(seekerProfileId);

  const Field = ({ label, value, field, type = 'text' }: { label: string; value: string; field: string; type?: string }) => (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      {editing && field !== 'email' ? (
        <input type={type} value={value} onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm mt-0.5" />
      ) : (
        <p className="text-sm text-foreground font-medium">{value || '—'}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xl font-bold">
          {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">{profile.full_name}</h1>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { if (editing) { handleSave(); } else { setEditing(true); } }}
          disabled={saving}
          className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editing ? <><Save className="w-3.5 h-3.5" /> Save All</> : '✏️ Edit Profile'}
        </button>
        {editing && (
          <button onClick={() => { setEditing(false); loadProfile(); }}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        )}
      </div>

      {/* Personal Info */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Personal Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={profile.full_name} field="full_name" />
          <Field label="Email" value={profile.email} field="email" />
          <Field label="Phone" value={profile.phone} field="phone" />
          <Field label="WhatsApp" value={profile.whatsapp} field="whatsapp" />
          <Field label="City" value={profile.city} field="city" />
          <Field label="State" value={profile.state} field="state" />
          <Field label="Date of Birth" value={profile.dob} field="dob" type="date" />
          <Field label="Gender" value={profile.gender} field="gender" />
          <Field label="Pincode" value={profile.pincode} field="pincode" />
          <Field label="Hometown" value={profile.hometown} field="hometown" />
          <Field label="Blood Group" value={profile.blood_group} field="blood_group" />
        </div>
      </div>

      {/* Professional */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Professional Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Occupation" value={profile.occupation} field="occupation" />
          <Field label="Designation" value={profile.designation} field="designation" />
          <Field label="Company" value={profile.company} field="company" />
          <Field label="Industry" value={profile.industry} field="industry" />
          <Field label="LinkedIn" value={profile.linkedin_url} field="linkedin_url" />
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">🏅 Badges & Achievements</h3>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {earnedBadges.map(b => (
              <div key={b.id} className="text-center p-2 rounded-lg border border-primary/20 bg-primary/5">
                <span className="text-2xl block">{b.badge.emoji}</span>
                <p className="text-[10px] font-bold text-foreground mt-0.5">{b.badge.name}</p>
                <p className="text-[9px] text-muted-foreground">{format(new Date(b.earned_at), 'dd MMM')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">Complete streaks on your Daily Worksheet to earn badges! 🔥</p>
        )}

        {progress.filter(p => !p.isEarned && p.currentStreak > 0).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground">🔄 In Progress</p>
            {progress.filter(p => !p.isEarned && p.currentStreak > 0).slice(0, 3).map(p => (
              <div key={p.badge.id} className="flex items-center gap-2">
                <span className="text-lg">{p.badge.emoji}</span>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-foreground">{p.badge.name}</p>
                  <Progress value={p.progressPercent} className="h-1.5" />
                </div>
                <span className="text-[10px] text-muted-foreground">{p.currentStreak}/{p.requiredStreak}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={() => { logout().then(() => { window.location.href = '/login'; }); }} className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-medium text-sm flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" /> Logout
      </button>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Vivek Doba Training Solutions</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🙏 for seekers of transformation</p>
      </footer>
    </div>
  );
};

export default SeekerProfile;
