import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, Palette } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const PERSONALITIES = [
  ['Professional', 'Casual'], ['Innovative', 'Traditional'], ['Luxury', 'Affordable'],
  ['Playful', 'Serious'], ['Bold', 'Subtle'],
];
const ARCHETYPES = ['Hero', 'Sage', 'Creator', 'Caregiver', 'Explorer', 'Ruler', 'Magician', 'Lover', 'Jester', 'Everyman', 'Innocent', 'Outlaw'];

export default function ArthaBranding() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();

  const { data: branding } = useQuery({
    queryKey: ['branding-strategy', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('branding_strategy').select('*').eq('business_id', business!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    brand_personality: '', brand_voice: '', logo_description: '',
    brand_story: '', positioning_statement: '', tagline: '',
  });
  const [colors, setColors] = useState<string[]>(['#FF6B00', '#1a1a2e', '#FFD700']);

  useEffect(() => {
    if (branding) {
      setForm({
        brand_personality: branding.brand_personality || '',
        brand_voice: branding.brand_voice || '',
        logo_description: branding.logo_description || '',
        brand_story: branding.brand_story || '',
        positioning_statement: branding.positioning_statement || '',
        tagline: branding.tagline || '',
      });
      setColors((branding.brand_colors as string[]) || ['#FF6B00', '#1a1a2e', '#FFD700']);
    }
  }, [branding]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, brand_colors: colors, business_id: business!.id };
      if (branding) {
        await supabase.from('branding_strategy').update(payload).eq('id', branding.id);
      } else {
        await supabase.from('branding_strategy').insert(payload);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branding-strategy'] }); toast.success('Saved!'); },
    onError: (e: any) => toast.error(e.message),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Palette className="w-6 h-6" /> Branding Strategy</h1>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">🎭 Brand Personality</h2>
        {PERSONALITIES.map(([a, b]) => (
          <div key={a} className="flex items-center gap-2 text-xs">
            <button onClick={() => setForm(p => ({ ...p, brand_personality: p.brand_personality.includes(a) ? p.brand_personality.replace(a, '').trim() : `${p.brand_personality} ${a}`.trim() }))}
              className={`px-3 py-1.5 rounded-full border ${form.brand_personality.includes(a) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}>{a}</button>
            <span className="text-muted-foreground">vs</span>
            <button onClick={() => setForm(p => ({ ...p, brand_personality: p.brand_personality.includes(b) ? p.brand_personality.replace(b, '').trim() : `${p.brand_personality} ${b}`.trim() }))}
              className={`px-3 py-1.5 rounded-full border ${form.brand_personality.includes(b) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}>{b}</button>
          </div>
        ))}
        <h3 className="font-medium text-foreground text-xs mt-3">Brand Archetype</h3>
        <div className="flex flex-wrap gap-1.5">
          {ARCHETYPES.map(a => (
            <button key={a} onClick={() => setForm(p => ({ ...p, brand_personality: a }))}
              className={`px-2 py-1 text-xs rounded-full border ${form.brand_personality === a ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}>{a}</button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">🗣️ Brand Voice</h2>
        <Textarea value={form.brand_voice} onChange={e => setForm(p => ({ ...p, brand_voice: e.target.value }))}
          placeholder="Tone: Warm, Expert, Friendly..." rows={3} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">🎨 Brand Colors</h2>
        <div className="flex gap-3">
          {colors.map((c, i) => (
            <div key={i} className="space-y-1">
              <input type="color" value={c} onChange={e => { const n = [...colors]; n[i] = e.target.value; setColors(n); }}
                className="w-12 h-12 rounded-lg cursor-pointer border-0" />
              <p className="text-xs text-center text-muted-foreground">{c}</p>
            </div>
          ))}
          {colors.length < 5 && <button onClick={() => setColors(p => [...p, '#cccccc'])} className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">+</button>}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">📖 Brand Story</h2>
        <Textarea value={form.brand_story} onChange={e => setForm(p => ({ ...p, brand_story: e.target.value }))}
          placeholder="Our founder's story, why we started..." rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <label className="text-sm font-medium text-foreground">🏷️ Tagline</label>
          <Input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} placeholder="Your memorable tagline" />
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <label className="text-sm font-medium text-foreground">📍 Positioning</label>
          <Textarea value={form.positioning_statement} onChange={e => setForm(p => ({ ...p, positioning_statement: e.target.value }))}
            placeholder="For [audience] who [need]..." rows={2} />
        </div>
      </div>

      <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" /> Save Branding</Button>
    </div>
  );
}
