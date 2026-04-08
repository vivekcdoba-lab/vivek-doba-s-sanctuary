import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Shield, AlertTriangle, Target, Zap, Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type SwotCategory = 'strength' | 'weakness' | 'opportunity' | 'threat';

interface SwotEntry {
  id: string;
  category: SwotCategory;
  text: string;
  sort_order: number;
}

interface Competitor {
  id: string;
  name: string;
  description: string | null;
  strengths: string[];
  weaknesses: string[];
  opportunity_for_vdts: string[];
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH';
  sort_order: number;
}

const iconMap = {
  strength: <Shield className="h-5 w-5 text-emerald-600" />,
  weakness: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  opportunity: <Target className="h-5 w-5 text-blue-500" />,
  threat: <Zap className="h-5 w-5 text-red-500" />,
};

const emojiMap: Record<SwotCategory, string> = {
  strength: '✅', weakness: '⚠️', opportunity: '🎯', threat: '⚡',
};

const labelMap: Record<SwotCategory, { label: string; color: string }> = {
  strength: { label: 'Strengths', color: 'bg-emerald-50 border-emerald-200' },
  weakness: { label: 'Weaknesses', color: 'bg-amber-50 border-amber-200' },
  opportunity: { label: 'Opportunities', color: 'bg-blue-50 border-blue-200' },
  threat: { label: 'Threats', color: 'bg-red-50 border-red-200' },
};

const threatColors: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function SwotPage() {
  const qc = useQueryClient();

  // ---- Data fetching ----
  const { data: entries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ['swot-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swot_entries')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as SwotEntry[];
    },
  });

  const { data: competitors = [], isLoading: loadingComp } = useQuery({
    queryKey: ['swot-competitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swot_competitors')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        strengths: Array.isArray(c.strengths) ? c.strengths : [],
        weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : [],
        opportunity_for_vdts: Array.isArray(c.opportunity_for_vdts) ? c.opportunity_for_vdts : [],
      })) as Competitor[];
    },
  });

  // ---- SWOT entry CRUD ----
  const [entryDialog, setEntryDialog] = useState(false);
  const [editEntry, setEditEntry] = useState<SwotEntry | null>(null);
  const [entryForm, setEntryForm] = useState({ category: 'strength' as SwotCategory, text: '' });

  const upsertEntry = useMutation({
    mutationFn: async () => {
      if (editEntry) {
        const { error } = await supabase.from('swot_entries').update({ text: entryForm.text, category: entryForm.category } as any).eq('id', editEntry.id);
        if (error) throw error;
      } else {
        const maxOrder = entries.filter(e => e.category === entryForm.category).length;
        const { error } = await supabase.from('swot_entries').insert({ category: entryForm.category, text: entryForm.text, sort_order: maxOrder + 1 } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot-entries'] }); setEntryDialog(false); toast.success(editEntry ? 'Updated' : 'Added'); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('swot_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot-entries'] }); toast.success('Deleted'); },
  });

  // ---- Competitor CRUD ----
  const [compDialog, setCompDialog] = useState(false);
  const [editComp, setEditComp] = useState<Competitor | null>(null);
  const [compForm, setCompForm] = useState({
    name: '', description: '', strengths: '', weaknesses: '', opportunity_for_vdts: '', threat_level: 'MEDIUM' as string,
  });

  const upsertComp = useMutation({
    mutationFn: async () => {
      const payload = {
        name: compForm.name,
        description: compForm.description || null,
        strengths: compForm.strengths.split('\n').filter(Boolean),
        weaknesses: compForm.weaknesses.split('\n').filter(Boolean),
        opportunity_for_vdts: compForm.opportunity_for_vdts.split('\n').filter(Boolean),
        threat_level: compForm.threat_level,
      };
      if (editComp) {
        const { error } = await supabase.from('swot_competitors').update(payload as any).eq('id', editComp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('swot_competitors').insert({ ...payload, sort_order: competitors.length + 1 } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot-competitors'] }); setCompDialog(false); toast.success(editComp ? 'Updated' : 'Added'); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteComp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('swot_competitors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['swot-competitors'] }); toast.success('Deleted'); },
  });

  const openAddEntry = (cat: SwotCategory) => {
    setEditEntry(null);
    setEntryForm({ category: cat, text: '' });
    setEntryDialog(true);
  };
  const openEditEntry = (e: SwotEntry) => {
    setEditEntry(e);
    setEntryForm({ category: e.category, text: e.text });
    setEntryDialog(true);
  };
  const openAddComp = () => {
    setEditComp(null);
    setCompForm({ name: '', description: '', strengths: '', weaknesses: '', opportunity_for_vdts: '', threat_level: 'MEDIUM' });
    setCompDialog(true);
  };
  const openEditComp = (c: Competitor) => {
    setEditComp(c);
    setCompForm({
      name: c.name,
      description: c.description || '',
      strengths: c.strengths.join('\n'),
      weaknesses: c.weaknesses.join('\n'),
      opportunity_for_vdts: c.opportunity_for_vdts.join('\n'),
      threat_level: c.threat_level,
    });
    setCompDialog(true);
  };

  const grouped = {
    strength: entries.filter(e => e.category === 'strength'),
    weakness: entries.filter(e => e.category === 'weakness'),
    opportunity: entries.filter(e => e.category === 'opportunity'),
    threat: entries.filter(e => e.category === 'threat'),
  };

  if (loadingEntries || loadingComp) return <div className="p-8 text-center text-muted-foreground">Loading SWOT data…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SWOT Analysis</h1>
        <p className="text-muted-foreground">VDTS competitive positioning & market analysis</p>
      </div>

      <Tabs defaultValue="vdts">
        <TabsList>
          <TabsTrigger value="vdts">VDTS SWOT</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
        </TabsList>

        {/* VDTS SWOT Grid */}
        <TabsContent value="vdts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['strength', 'weakness', 'opportunity', 'threat'] as const).map(cat => (
              <Card key={cat} className={`border ${labelMap[cat].color}`}>
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  {iconMap[cat]}
                  <CardTitle className="text-lg">{labelMap[cat].label}</CardTitle>
                  <Badge variant="secondary" className="ml-auto">{grouped[cat].length}</Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openAddEntry(cat)}><Plus className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {grouped[cat].map(item => (
                      <li key={item.id} className="text-sm flex items-start gap-2 group">
                        <span className="mt-0.5 shrink-0">{emojiMap[cat]}</span>
                        <span className="flex-1">{item.text}</span>
                        <span className="opacity-0 group-hover:opacity-100 flex gap-0.5 shrink-0 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEditEntry(item)}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteEntry.mutate(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </span>
                      </li>
                    ))}
                    {grouped[cat].length === 0 && <li className="text-sm text-muted-foreground italic">No entries yet</li>}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Competitors */}
        <TabsContent value="competitors" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddComp} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Competitor</Button>
          </div>
          {competitors.map(c => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={threatColors[c.threat_level]}>Threat: {c.threat_level}</Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditComp(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteComp.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-emerald-700">Their Strengths</h4>
                    <ul className="space-y-1">{c.strengths.map((s, i) => <li key={i} className="text-xs flex items-start gap-1"><span>✅</span>{s}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-amber-700">Their Weaknesses</h4>
                    <ul className="space-y-1">{c.weaknesses.map((w, i) => <li key={i} className="text-xs flex items-start gap-1"><span>⚠️</span>{w}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-blue-700">Our Advantage</h4>
                    <ul className="space-y-1">{c.opportunity_for_vdts.map((o, i) => <li key={i} className="text-xs flex items-start gap-1"><span>→</span>{o}</li>)}</ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {competitors.length === 0 && <p className="text-center text-muted-foreground py-8">No competitors added yet</p>}
        </TabsContent>
      </Tabs>

      {/* SWOT Entry Dialog */}
      <Dialog open={entryDialog} onOpenChange={setEntryDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editEntry ? 'Edit' : 'Add'} SWOT Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={entryForm.category} onValueChange={v => setEntryForm(f => ({ ...f, category: v as SwotCategory }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="weakness">Weakness</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="threat">Threat</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Entry text" value={entryForm.text} onChange={e => setEntryForm(f => ({ ...f, text: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryDialog(false)}>Cancel</Button>
            <Button onClick={() => upsertEntry.mutate()} disabled={!entryForm.text.trim() || upsertEntry.isPending}>
              {upsertEntry.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Competitor Dialog */}
      <Dialog open={compDialog} onOpenChange={setCompDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editComp ? 'Edit' : 'Add'} Competitor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Competitor name *" value={compForm.name} onChange={e => setCompForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Description" value={compForm.description} onChange={e => setCompForm(f => ({ ...f, description: e.target.value }))} />
            <div>
              <label className="text-sm font-medium">Threat Level</label>
              <Select value={compForm.threat_level} onValueChange={v => setCompForm(f => ({ ...f, threat_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Their Strengths (one per line)</label>
              <Textarea rows={4} value={compForm.strengths} onChange={e => setCompForm(f => ({ ...f, strengths: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Their Weaknesses (one per line)</label>
              <Textarea rows={4} value={compForm.weaknesses} onChange={e => setCompForm(f => ({ ...f, weaknesses: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Our Advantage (one per line)</label>
              <Textarea rows={3} value={compForm.opportunity_for_vdts} onChange={e => setCompForm(f => ({ ...f, opportunity_for_vdts: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompDialog(false)}>Cancel</Button>
            <Button onClick={() => upsertComp.mutate()} disabled={!compForm.name.trim() || upsertComp.isPending}>
              {upsertComp.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
