import { useMemo } from 'react';
import { useDbLeads, useUpdateLead } from '@/hooks/useDbLeads';
import { useDbCourses } from '@/hooks/useDbCourses';
import { Flame, Phone, Mail, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

const AdminHotLeads = () => {
  const { data: leads = [], isLoading } = useDbLeads();
  const { data: courses = [] } = useDbCourses();
  const updateLead = useUpdateLead();

  const hotLeads = useMemo(() =>
    leads.filter(l => l.priority === 'hot' && l.stage !== 'converted' && l.stage !== 'lost')
      .sort((a, b) => (a.days_in_pipeline || 0) - (b.days_in_pipeline || 0)),
  [leads]);

  const urgentLeads = useMemo(() =>
    leads.filter(l => {
      if (l.stage === 'converted' || l.stage === 'lost') return false;
      if (l.next_followup_date && new Date(l.next_followup_date) <= new Date()) return true;
      if ((l.days_in_pipeline || 0) > 14 && l.stage !== 'converted') return true;
      return false;
    }),
  [leads]);

  const getCourse = (id: string | null) => id ? courses.find(c => c.id === id) : null;

  const convertLead = (id: string) => {
    updateLead.mutate({ id, stage: 'converted' });
    toast.success('Lead converted!');
  };

  const moveForward = (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const stages = ['new', 'contacted', 'discovery', 'consultation_scheduled', 'consultation_done', 'proposal', 'followup', 'converted'];
    const idx = stages.indexOf(lead.stage || 'new');
    const next = stages[Math.min(idx + 1, stages.length - 1)];
    updateLead.mutate({ id, stage: next });
    toast.success('Lead advanced!');
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">🔥 Hot Leads</h1>
        <p className="text-sm text-muted-foreground">{hotLeads.length} hot leads requiring immediate action</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="w-6 h-6 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{hotLeads.length}</p>
            <p className="text-xs text-muted-foreground">Hot Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="w-6 h-6 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{urgentLeads.length}</p>
            <p className="text-xs text-muted-foreground">Overdue Follow-ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <ChevronRight className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{leads.filter(l => l.priority === 'hot' && l.stage === 'converted').length}</p>
            <p className="text-xs text-muted-foreground">Hot Converted</p>
          </CardContent>
        </Card>
      </div>

      {urgentLeads.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2"><CardTitle className="text-base text-destructive">⚠️ Needs Immediate Attention</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentLeads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5">
                  <div>
                    <span className="font-medium text-sm">{lead.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {lead.next_followup_date ? `Follow-up overdue: ${format(new Date(lead.next_followup_date), 'dd MMM')}` : `${lead.days_in_pipeline || 0} days in pipeline`}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => moveForward(lead.id)}>Action <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {hotLeads.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No hot leads currently. Great job! 🎉</CardContent></Card>
        ) : hotLeads.map(lead => {
          const course = getCourse(lead.interested_course_id);
          return (
            <Card key={lead.id} className="border-red-200/50">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{lead.name}</span>
                      <Badge className="bg-red-500/10 text-red-600 border-red-200 text-xs">🔴 HOT</Badge>
                      <Badge variant="outline" className="text-xs">{lead.stage || 'new'}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                      {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                      <span>Source: {lead.source || '—'}</span>
                      {course && <span>Interest: {course.name}</span>}
                      <span>{lead.days_in_pipeline || 0} days in pipeline</span>
                    </div>
                    {lead.current_challenge && <p className="text-xs text-muted-foreground mt-1 italic">"{lead.current_challenge}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => moveForward(lead.id)}>Advance <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button>
                    <Button size="sm" onClick={() => convertLead(lead.id)}>Convert</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHotLeads;
