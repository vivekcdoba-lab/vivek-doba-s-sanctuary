import { useState } from 'react';
import BackToHome from '@/components/BackToHome';
import EmptyState from '@/components/EmptyState';
import { Building2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';

export default function ArthaBusinessProfile() {
  const { business, isLoading, createBusiness, updateBusiness } = useBusinessProfile();
  const [form, setForm] = useState({
    business_name: '', industry: '', tagline: '', founded_year: '', team_size: '', revenue_range: '', website: '',
  });
  const [editing, setEditing] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  if (!business && !editing) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <BackToHome />
        <EmptyState
          emoji="💼"
          title="Set up your business"
          description="Start tracking your Artha growth by creating your business profile."
          actionLabel="Create Business Profile"
          onAction={() => setEditing(true)}
        />
      </div>
    );
  }

  const handleSave = () => {
    if (business) {
      updateBusiness.mutate({
        business_name: form.business_name || business.business_name,
        industry: form.industry || business.industry,
        tagline: form.tagline || business.tagline,
        founded_year: form.founded_year ? parseInt(form.founded_year) : business.founded_year,
        team_size: form.team_size ? parseInt(form.team_size) : business.team_size,
        revenue_range: form.revenue_range || business.revenue_range,
        website: form.website || business.website,
      });
      setEditing(false);
    } else {
      if (!form.business_name.trim()) return;
      createBusiness.mutate({
        business_name: form.business_name,
        industry: form.industry || undefined,
        tagline: form.tagline || undefined,
        founded_year: form.founded_year ? parseInt(form.founded_year) : undefined,
        team_size: form.team_size ? parseInt(form.team_size) : undefined,
        revenue_range: form.revenue_range || undefined,
        website: form.website || undefined,
      });
      setEditing(false);
    }
  };

  const isEditing = editing || !business;
  const vals = isEditing ? form : {
    business_name: business?.business_name || '',
    industry: business?.industry || '',
    tagline: business?.tagline || '',
    founded_year: business?.founded_year?.toString() || '',
    team_size: business?.team_size?.toString() || '',
    revenue_range: business?.revenue_range || '',
    website: business?.website || '',
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <BackToHome />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">🏢 Business Profile</h1>
        {business && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => { setForm({
            business_name: business.business_name, industry: business.industry || '',
            tagline: business.tagline || '', founded_year: business.founded_year?.toString() || '',
            team_size: business.team_size?.toString() || '', revenue_range: business.revenue_range || '',
            website: business.website || '',
          }); setEditing(true); }}>Edit</Button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        {[
          ['business_name', 'Business Name *', 'text'],
          ['industry', 'Industry', 'text'],
          ['tagline', 'Tagline', 'text'],
          ['founded_year', 'Founded Year', 'number'],
          ['team_size', 'Team Size', 'number'],
          ['revenue_range', 'Revenue Range', 'text'],
          ['website', 'Website', 'url'],
        ].map(([key, label, type]) => (
          <div key={key}>
            <label className="text-sm font-medium text-foreground">{label}</label>
            {isEditing ? (
              <Input type={type as string} value={(isEditing ? form : vals)[key as keyof typeof form]} onChange={e => set(key as string, e.target.value)} className="mt-1" />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">{vals[key as keyof typeof vals] || '—'}</p>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={createBusiness.isPending || updateBusiness.isPending}>
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            {business && <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
