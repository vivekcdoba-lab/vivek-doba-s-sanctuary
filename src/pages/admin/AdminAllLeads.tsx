import { useState, useMemo } from 'react';
import { useDbLeads, useUpdateLead } from '@/hooks/useDbLeads';
import { useDbCourses } from '@/hooks/useDbCourses';
import { Search, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STAGES = [
  { key: 'new', label: 'Enquiry' }, { key: 'contacted', label: 'Contacted' }, { key: 'discovery', label: 'Interested' },
  { key: 'consultation_scheduled', label: 'Consult Scheduled' }, { key: 'consultation_done', label: 'Consult Done' },
  { key: 'proposal', label: 'Proposal' }, { key: 'followup', label: 'Follow-up' },
  { key: 'converted', label: 'Won ✅' }, { key: 'lost', label: 'Lost ✗' },
];

const priorityBadge = (p: string) => {
  if (p === 'hot') return <Badge className="bg-red-500/10 text-red-600 border-red-200">🔴 Hot</Badge>;
  if (p === 'warm') return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">🟡 Warm</Badge>;
  return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">❄️ Cold</Badge>;
};

const stageBadge = (stage: string) => {
  const s = STAGES.find(x => x.key === stage) || STAGES[0];
  const colors: Record<string, string> = {
    new: 'bg-muted text-muted-foreground', contacted: 'bg-blue-500/10 text-blue-600', discovery: 'bg-purple-500/10 text-purple-600',
    consultation_scheduled: 'bg-indigo-500/10 text-indigo-600', consultation_done: 'bg-cyan-500/10 text-cyan-600',
    proposal: 'bg-orange-500/10 text-orange-600', followup: 'bg-yellow-500/10 text-yellow-600',
    converted: 'bg-green-500/10 text-green-600', lost: 'bg-red-500/10 text-red-600',
  };
  return <Badge className={colors[stage] || 'bg-muted text-muted-foreground'}>{s.label}</Badge>;
};

const AdminAllLeads = () => {
  const { data: leads = [], isLoading } = useDbLeads();
  const { data: courses = [] } = useDbCourses();
  const updateLead = useUpdateLead();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const sources = useMemo(() => [...new Set(leads.map(l => l.source).filter(Boolean) as string[])], [leads]);

  const filtered = useMemo(() => leads.filter(l => {
    const ms = !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search) || (l.email || '').toLowerCase().includes(search.toLowerCase());
    const mst = stageFilter === 'all' || (l.stage || 'new') === stageFilter;
    const mp = priorityFilter === 'all' || l.priority === priorityFilter;
    const mso = sourceFilter === 'all' || l.source === sourceFilter;
    return ms && mst && mp && mso;
  }), [leads, search, stageFilter, priorityFilter, sourceFilter]);

  const moveLead = (id: string, dir: 'left' | 'right') => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const idx = STAGES.findIndex(s => s.key === (lead.stage || 'new'));
    const ni = dir === 'right' ? Math.min(idx + 1, STAGES.length - 1) : Math.max(idx - 1, 0);
    updateLead.mutate({ id, stage: STAGES[ni].key });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Source', 'Stage', 'Priority', 'Created'];
    const rows = filtered.map(l => [l.name, l.phone || '', l.email || '', l.source || '', l.stage || 'new', l.priority || '', format(new Date(l.created_at), 'yyyy-MM-dd')]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `leads_${format(new Date(), 'yyyyMMdd')}.csv`; a.click();
    toast.success(`Exported ${filtered.length} leads`);
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Leads</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {leads.length} leads</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="w-4 h-4" /> Export</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Stages</SelectItem>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="hot">🔴 Hot</SelectItem><SelectItem value="warm">🟡 Warm</SelectItem><SelectItem value="cold">❄️ Cold</SelectItem></SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Sources</SelectItem>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leads found</TableCell></TableRow>
              ) : filtered.slice(0, 50).map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.phone && <div>{lead.phone}</div>}
                    {lead.email && <div className="text-xs">{lead.email}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{lead.source || '—'}</TableCell>
                  <TableCell>{stageBadge(lead.stage || 'new')}</TableCell>
                  <TableCell>{priorityBadge(lead.priority || 'warm')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lead.days_in_pipeline || 0}d</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveLead(lead.id, 'left')} title="Move back">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => moveLead(lead.id, 'right')} title="Move forward">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAllLeads;
