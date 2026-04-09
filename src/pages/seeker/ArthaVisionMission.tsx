import { useState, useEffect } from 'react';
import BackToHome from '@/components/BackToHome';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const VISION_PROMPTS = ['Where do you see your business in 5 years?', 'What impact do you want to create?', 'What will success look like?'];
const MISSION_FORMULA = 'We [action] for [audience] by [method] so that [impact]';
const EMOJIS = ['⭐','🎯','💡','❤️','🔥','🛡️','🌱','💎','🤝','🏆','⚡','🌍'];

export default function ArthaVisionMission() {
  const { business, isLoading: bLoading } = useBusinessProfile();
  const qc = useQueryClient();

  const { data: mv } = useQuery({
    queryKey: ['mission-vision', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('business_mission_vision').select('*').eq('business_id', business!.id).maybeSingle();
      return data;
    },
  });

  const { data: values = [] } = useQuery({
    queryKey: ['business-values', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data } = await supabase.from('business_values').select('*').eq('business_id', business!.id).order('priority_order');
      return data || [];
    },
  });

  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [purpose, setPurpose] = useState('');
  const [newValue, setNewValue] = useState({ name: '', description: '', emoji: '⭐' });

  useEffect(() => {
    if (mv) { setVision(mv.vision_statement || ''); setMission(mv.mission_statement || ''); setPurpose(mv.purpose_statement || ''); }
  }, [mv]);

  const saveMV = useMutation({
    mutationFn: async () => {
      if (mv) {
        await supabase.from('business_mission_vision').update({ vision_statement: vision, mission_statement: mission, purpose_statement: purpose }).eq('id', mv.id);
      } else {
        await supabase.from('business_mission_vision').insert({ business_id: business!.id, vision_statement: vision, mission_statement: mission, purpose_statement: purpose });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mission-vision'] }); toast.success('Saved!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const addValue = useMutation({
    mutationFn: async () => {
      if (!newValue.name.trim()) return;
      await supabase.from('business_values').insert({
        business_id: business!.id, value_name: newValue.name, value_description: newValue.description,
        icon_emoji: newValue.emoji, priority_order: values.length,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business-values'] }); setNewValue({ name: '', description: '', emoji: '⭐' }); toast.success('Value added!'); },
  });

  const deleteValue = useMutation({
    mutationFn: async (id: string) => { await supabase.from('business_values').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business-values'] }),
  });

  if (bLoading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!business) return <div className="p-6 text-center"><BackToHome /><p className="mt-4 text-muted-foreground">Please set up your Business Profile first.</p></div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <h1 className="text-2xl font-bold text-foreground">🎯 Vision, Mission & Values</h1>

      {/* Vision */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground">🔭 Vision Statement</h2>
        <div className="space-y-1">
          {VISION_PROMPTS.map(p => <p key={p} className="text-xs text-muted-foreground italic">• {p}</p>)}
        </div>
        <Textarea value={vision} onChange={e => setVision(e.target.value)} placeholder="Our vision is..." rows={3} />
      </div>

      {/* Mission */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground">🚀 Mission Statement</h2>
        <p className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">{MISSION_FORMULA}</p>
        <Textarea value={mission} onChange={e => setMission(e.target.value)} placeholder="We help..." rows={3} />
      </div>

      {/* Purpose */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-foreground">💡 Purpose Statement</h2>
        <Textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="We exist because..." rows={2} />
      </div>

      <Button onClick={() => saveMV.mutate()} disabled={saveMV.isPending}><Save className="w-4 h-4 mr-1" /> Save Statements</Button>

      {/* Values */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-semibold text-foreground">💎 Core Values ({values.length}/7)</h2>
        {values.map((v: any) => (
          <div key={v.id} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
            <span className="text-2xl">{v.icon_emoji}</span>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{v.value_name}</p>
              {v.value_description && <p className="text-xs text-muted-foreground">{v.value_description}</p>}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteValue.mutate(v.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
        {values.length < 7 && (
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex gap-2">
              <div className="flex gap-1 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewValue(p => ({ ...p, emoji: e }))}
                    className={`text-lg p-1 rounded ${newValue.emoji === e ? 'bg-primary/20 ring-1 ring-primary' : ''}`}>{e}</button>
                ))}
              </div>
            </div>
            <Input placeholder="Value name (e.g., Integrity)" value={newValue.name} onChange={e => setNewValue(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Description (optional)" value={newValue.description} onChange={e => setNewValue(p => ({ ...p, description: e.target.value }))} />
            <Button size="sm" onClick={() => addValue.mutate()} disabled={addValue.isPending || !newValue.name.trim()}>
              <Plus className="w-4 h-4 mr-1" /> Add Value
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
