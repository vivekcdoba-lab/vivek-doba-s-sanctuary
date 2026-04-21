import { useState, useMemo } from 'react';
import { useDbLeads, useCreateLead, useUpdateLead } from '@/hooks/useDbLeads';
import { useDbCourses } from '@/hooks/useDbCourses';
import { Plus, ChevronLeft, ChevronRight, X, Phone, Mail, MessageSquare, Loader2, Search, Filter, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PhoneInput from '@/components/inputs/PhoneInput';
import { validatePhone, toE164, parseE164, DEFAULT_COUNTRY_CODE } from '@/lib/phoneValidation';

type LeadStage = 'new' | 'contacted' | 'discovery' | 'consultation_scheduled' | 'consultation_done' | 'proposal' | 'followup' | 'converted' | 'lost';

const STAGES: { key: LeadStage; label: string; color: string; bg: string }[] = [
  { key: 'new', label: 'Enquiry', color: 'bg-gray-400', bg: 'bg-muted/30' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-500', bg: 'bg-blue-500/5' },
  { key: 'discovery', label: 'Interested', color: 'bg-purple-600', bg: 'bg-purple-500/5' },
  { key: 'consultation_scheduled', label: 'Consult Scheduled', color: 'bg-indigo-500', bg: 'bg-indigo-500/5' },
  { key: 'consultation_done', label: 'Consult Done', color: 'bg-cyan-500', bg: 'bg-cyan-500/5' },
  { key: 'proposal', label: 'Proposal Sent', color: 'bg-orange-500', bg: 'bg-orange-500/5' },
  { key: 'followup', label: 'Follow-up', color: 'bg-yellow-500', bg: 'bg-yellow-500/5' },
  { key: 'converted', label: 'Won ✅', color: 'bg-green-500', bg: 'bg-green-500/5' },
  { key: 'lost', label: 'Lost ✗', color: 'bg-red-500', bg: 'bg-red-500/5' },
];

const CHART_COLORS = ['#6B7280', '#3B82F6', '#9333EA', '#6366F1', '#06B6D4', '#F97316', '#EAB308', '#22C55E', '#EF4444'];

const sourceIcons: Record<string, string> = { Website: '🌐', 'Social Media': '📱', Referral: '👥', 'Live Event': '🎪', 'Cold Call': '❄️', LinkedIn: '💼' };
const priorityDots: Record<string, string> = { hot: '🔴', warm: '🟡', cold: '❄️' };

const LeadsPage = () => {
  const { data: leads = [], isLoading } = useDbLeads();
  const { data: courses = [] } = useDbCourses();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [showReports, setShowReports] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phoneCode: DEFAULT_COUNTRY_CODE, phone: '', email: '', source: 'Website', interested_course_id: '', priority: 'warm', current_challenge: '', notes: '' });
  const { toast } = useToast();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'all' || l.priority === filterPriority;
      const matchSource = filterSource === 'all' || l.source === filterSource;
      return matchSearch && matchPriority && matchSource;
    });
  }, [leads, search, filterPriority, filterSource]);

  // Report data
  const funnelData = useMemo(() => STAGES.map((s, i) => ({
    name: s.label, count: leads.filter(l => (l.stage || 'new') === s.key).length, fill: CHART_COLORS[i],
  })), [leads]);

  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { const s = l.source || 'Unknown'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const sources = useMemo(() => [...new Set(leads.map(l => l.source).filter(Boolean))], [leads]);

  const moveLead = (leadId: string, direction: 'left' | 'right') => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const idx = STAGES.findIndex(s => s.key === (lead.stage || 'new'));
    const newIdx = direction === 'right' ? Math.min(idx + 1, STAGES.length - 1) : Math.max(idx - 1, 0);
    updateLead.mutate({ id: leadId, stage: STAGES[newIdx].key });
    toast({ title: 'Lead moved!' });
  };

  const convertLead = (leadId: string) => {
    updateLead.mutate({ id: leadId, stage: 'converted' });
    toast({ title: '✅ Lead converted to seeker!' });
  };

  const markLost = (leadId: string) => {
    updateLead.mutate({ id: leadId, stage: 'lost' });
    toast({ title: '❌ Lead marked as lost' });
  };

  const addLead = () => {
    if (!newLead.name || !newLead.phone) return;
    const err = validatePhone(newLead.phoneCode, newLead.phone);
    if (err) { toast({ title: err, variant: 'destructive' }); return; }
    createLead.mutate({
      name: newLead.name, phone: toE164(newLead.phoneCode, newLead.phone), email: newLead.email || undefined,
      source: newLead.source, interested_course_id: newLead.interested_course_id || undefined,
      priority: newLead.priority, current_challenge: newLead.current_challenge || undefined, notes: newLead.notes || undefined,
    }, {
      onSuccess: () => {
        setShowAdd(false);
        setNewLead({ name: '', phoneCode: DEFAULT_COUNTRY_CODE, phone: '', email: '', source: 'Website', interested_course_id: '', priority: 'warm', current_challenge: '', notes: '' });
        toast({ title: '✅ New lead added!' });
      },
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">{filteredLeads.length} of {leads.length} leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowReports(!showReports)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:bg-muted">
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
          <option value="all">All Priority</option>
          <option value="hot">🔴 Hot</option>
          <option value="warm">🟡 Warm</option>
          <option value="cold">❄️ Cold</option>
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s} value={s!}>{s}</option>)}
        </select>
      </div>

      {/* Reports Section */}
      {showReports && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">📊 Conversion Funnel</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">🥧 Leads by Source</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 md:col-span-2">
            <h3 className="text-sm font-bold text-foreground mb-3">📈 Pipeline Summary</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-600">{leads.filter(l => l.stage === 'converted').length}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <p className="text-2xl font-bold text-red-500">{leads.filter(l => l.stage === 'lost').length}</p>
                <p className="text-xs text-muted-foreground">Lost</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <p className="text-2xl font-bold text-primary">
                  {leads.length > 0 ? ((leads.filter(l => l.stage === 'converted').length / leads.length) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-500/10">
                <p className="text-2xl font-bold text-orange-500">
                  {leads.filter(l => (l.days_in_pipeline || 0) > 30 && l.stage !== 'converted' && l.stage !== 'lost').length}
                </p>
                <p className="text-xs text-muted-foreground">Stale (&gt;30d)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">➕ Add New Lead</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Name *" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <PhoneInput countryCode={newLead.phoneCode} phone={newLead.phone} onCountryCodeChange={v => setNewLead(p => ({ ...p, phoneCode: v }))} onPhoneChange={v => setNewLead(p => ({ ...p, phone: v }))} label="Phone *" />
              <input placeholder="Email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <select value={newLead.source} onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                {['Website', 'Social Media', 'Referral', 'Live Event', 'Cold Call', 'LinkedIn'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={newLead.interested_course_id} onChange={e => setNewLead(p => ({ ...p, interested_course_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={newLead.priority} onChange={e => setNewLead(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="hot">🔴 Hot</option><option value="warm">🟡 Warm</option><option value="cold">❄️ Cold</option>
              </select>
              <textarea placeholder="Current Challenge" value={newLead.current_challenge} onChange={e => setNewLead(p => ({ ...p, current_challenge: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
              <textarea placeholder="Notes" value={newLead.notes} onChange={e => setNewLead(p => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
              <button onClick={addLead} disabled={createLead.isPending} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
                {createLead.isPending ? 'Saving...' : 'Save Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageLeads = filteredLeads.filter(l => (l.stage || 'new') === stage.key);
          return (
            <div key={stage.key} className={`min-w-[240px] max-w-[260px] flex-shrink-0 rounded-xl ${stage.bg} border border-border`}>
              <div className="p-3 border-b border-border flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                <span className="ml-auto text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{stageLeads.length}</span>
              </div>
              <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                {stageLeads.map(lead => {
                  const course = courses.find(c => c.id === lead.interested_course_id);
                  return (
                    <div key={lead.id} className="bg-card rounded-xl p-3 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer" onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.phone}</p>
                        </div>
                        <span className="text-xs">{priorityDots[lead.priority || 'warm']}</span>
                      </div>
                      {course && <p className="text-xs text-muted-foreground mt-1">Interested: {course.name.split('—')[0].trim()}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">{sourceIcons[lead.source || ''] || '📋'} {lead.source}</span>
                      </div>
                      <p className={`text-[10px] mt-1 ${(lead.days_in_pipeline || 0) > 30 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>Day {lead.days_in_pipeline || 0}</p>

                      {expandedLead === lead.id && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2" onClick={e => e.stopPropagation()}>
                          {lead.current_challenge && <p className="text-xs text-foreground"><span className="font-medium">Challenge:</span> {lead.current_challenge}</p>}
                          {lead.notes && <p className="text-xs text-muted-foreground">{lead.notes}</p>}
                          {lead.next_followup_date && <p className="text-xs text-primary">📅 Follow-up: {lead.next_followup_date}</p>}
                          <div className="flex gap-1.5">
                            {lead.phone && <button onClick={() => window.open(`tel:${lead.phone}`)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10"><Phone className="w-3 h-3" /></button>}
                            {lead.phone && <button onClick={() => window.open(`https://wa.me/${lead.phone?.replace(/\D/g, '')}`)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10"><MessageSquare className="w-3 h-3" /></button>}
                            {lead.email && <button onClick={() => window.open(`mailto:${lead.email}`)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-primary/10"><Mail className="w-3 h-3" /></button>}
                          </div>
                          <div className="flex gap-1.5">
                            {stage.key !== 'new' && <button onClick={() => moveLead(lead.id, 'left')} className="flex-1 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted"><ChevronLeft className="w-3 h-3 inline" /> Back</button>}
                            {stage.key !== 'lost' && stage.key !== 'converted' && <button onClick={() => moveLead(lead.id, 'right')} className="flex-1 py-1 text-xs rounded-lg bg-primary/10 text-primary font-medium">Next <ChevronRight className="w-3 h-3 inline" /></button>}
                          </div>
                          {stage.key !== 'converted' && stage.key !== 'lost' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => convertLead(lead.id)} className="flex-1 py-1 text-xs rounded-lg bg-green-500/10 text-green-600 font-medium">✅ Convert</button>
                              <button onClick={() => markLost(lead.id)} className="flex-1 py-1 text-xs rounded-lg bg-destructive/10 text-destructive font-medium">❌ Lost</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {stageLeads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 italic">No leads</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsPage;
