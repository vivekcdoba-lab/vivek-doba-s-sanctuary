import { useState, useEffect } from 'react';
import { SEEKERS, COURSES } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Save, LogOut } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useBadges } from '@/hooks/useBadges';
import { format } from 'date-fns';

const SeekerProfile = () => {
  const seeker = SEEKERS[0];
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [seekerProfileId, setSeekerProfileId] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (data) setSeekerProfileId(data.id);
    };
    getProfile();
  }, []);

  const { progress, earnedBadges } = useBadges(seekerProfileId);
  const [profile, setProfile] = useState({
    full_name: seeker.full_name, email: seeker.email, phone: seeker.phone,
    city: seeker.city, state: seeker.state || 'Maharashtra',
    occupation: seeker.occupation || '', company: seeker.company || '',
    dob: '1990-05-15', gender: 'Male', pincode: '411001',
    vision: 'To become India\'s leading spiritual business coach, running a world-class ashram that transforms 1 million lives.',
    mantra: 'मी माझ्या नशिबाचा शिल्पकार आहे / I am the architect of my destiny',
    why: 'To break free from limiting beliefs, build a legacy business, and achieve soul satisfaction through balanced living.',
    values: ['Integrity', 'Courage', 'Compassion', 'Growth', 'Dharma'],
  });

  const Field = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      {editing ? (
        <input value={value} onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm mt-0.5" />
      ) : (
        <p className="text-sm text-foreground font-medium">{value || '—'}</p>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xl font-bold">
          {seeker.full_name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">{seeker.full_name}</h1>
          <p className="text-xs text-muted-foreground">{seeker.course?.name?.split('—')[0]}</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{seeker.enrollment?.tier}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { if (editing) { toast({ title: '✅ Profile saved!' }); } setEditing(!editing); }}
          className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1">
          {editing ? <><Save className="w-3.5 h-3.5" /> Save All</> : '✏️ Edit Profile'}
        </button>
      </div>

      {/* Personal Info */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Personal Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={profile.full_name} field="full_name" />
          <Field label="Email" value={profile.email} field="email" />
          <Field label="Phone" value={profile.phone} field="phone" />
          <Field label="City" value={profile.city} field="city" />
          <Field label="State" value={profile.state} field="state" />
          <Field label="Date of Birth" value={profile.dob} field="dob" />
          <Field label="Gender" value={profile.gender} field="gender" />
          <Field label="Pincode" value={profile.pincode} field="pincode" />
        </div>
      </div>

      {/* Professional */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Professional Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Occupation" value={profile.occupation} field="occupation" />
          <Field label="Company" value={profile.company} field="company" />
        </div>
      </div>

      {/* Goals & Vision */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Goals & Vision</h3>
        <div>
          <label className="text-xs text-muted-foreground">10-Year Vision</label>
          {editing ? <textarea value={profile.vision} onChange={e => setProfile(p => ({ ...p, vision: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mt-0.5" rows={3} /> : <p className="text-sm text-foreground italic">{profile.vision}</p>}
        </div>
        <div className="border-2 border-primary/20 rounded-xl p-3 bg-primary/5">
          <p className="text-xs text-primary font-semibold">ॐ My Sankalpa (संकल्प)</p>
          {editing ? <textarea value={profile.mantra} onChange={e => setProfile(p => ({ ...p, mantra: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mt-1" rows={2} /> : <p className="text-sm text-foreground mt-1 font-medium">{profile.mantra}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Why am I on this journey?</label>
          {editing ? <textarea value={profile.why} onChange={e => setProfile(p => ({ ...p, why: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mt-0.5" rows={2} /> : <p className="text-sm text-foreground">{profile.why}</p>}
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">Core Values</h3>
        <div className="flex flex-wrap gap-2">
          {profile.values.map(v => (
            <span key={v} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{v}</span>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button onClick={() => { logout(); window.location.href = '/login'; }} className="w-full py-3 rounded-xl bg-destructive/10 text-destructive font-medium text-sm flex items-center justify-center gap-2">
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
