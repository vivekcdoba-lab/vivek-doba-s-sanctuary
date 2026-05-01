import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Bug, Lightbulb, Loader2, Mail, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

type Ticket = {
  id: string;
  seeker_id: string;
  kind: 'issue' | 'feature';
  category: string | null;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_reply: string | null;
  created_at: string;
  resolved_at: string | null;
  seeker?: { full_name: string; email: string; phone: string | null } | null;
};

const STATUS_LABELS: Record<Ticket['status'], string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_VARIANT: Record<Ticket['status'], 'default' | 'secondary' | 'outline'> = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
  closed: 'outline',
};

export default function AdminSupportInbox() {
  const { profile } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tab, setTab] = useState<'issue' | 'feature' | 'resolved'>('issue');
  const [active, setActive] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [statusEdit, setStatusEdit] = useState<Ticket['status']>('open');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, seeker:profiles!support_tickets_seeker_id_fkey(full_name, email, phone)')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load tickets', variant: 'destructive' });
      return;
    }
    setTickets((data as any[]) as Ticket[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (tab === 'resolved') return tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    return tickets.filter(t => t.kind === tab && t.status !== 'resolved' && t.status !== 'closed');
  }, [tickets, tab]);

  const counts = useMemo(() => ({
    issue: tickets.filter(t => t.kind === 'issue' && t.status !== 'resolved' && t.status !== 'closed').length,
    feature: tickets.filter(t => t.kind === 'feature' && t.status !== 'resolved' && t.status !== 'closed').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  }), [tickets]);

  const openTicket = (t: Ticket) => {
    setActive(t);
    setReply(t.admin_reply || '');
    setStatusEdit(t.status);
  };

  const saveTicket = async () => {
    if (!active) return;
    setSaving(true);
    const update: any = {
      status: statusEdit,
      admin_reply: reply.trim() || null,
    };
    if ((statusEdit === 'resolved' || statusEdit === 'closed') && !active.resolved_at) {
      update.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from('support_tickets').update(update).eq('id', active.id);
    if (!error && reply.trim() && active.seeker) {
      // Notify seeker via bell
      const { data: seekerProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', active.seeker_id)
        .maybeSingle();
      if (seekerProfile?.user_id) {
        await supabase.from('notifications').insert({
          user_id: seekerProfile.user_id,
          type: 'system',
          title: `📬 Reply on your ${active.kind === 'issue' ? 'issue report' : 'suggestion'}`,
          message: reply.trim().slice(0, 240),
          action_url: '/seeker/help',
        });
      }
    }
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', variant: 'destructive' });
      return;
    }
    toast({ title: '✅ Ticket updated' });
    setActive(null);
    load();
  };

  if (!profile || profile.role !== 'admin') {
    return <div className="p-6 text-center text-muted-foreground">Admin access required.</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" /> Support Inbox
          </h1>
          <p className="text-sm text-muted-foreground">Issues and feature requests submitted by seekers.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="issue" className="gap-1">
            <Bug className="w-4 h-4 text-destructive" /> Issues
            {counts.issue > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{counts.issue}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="feature" className="gap-1">
            <Lightbulb className="w-4 h-4 text-primary" /> Feature Requests
            {counts.feature > 0 && <Badge className="ml-1 h-5 px-1.5 text-[10px]">{counts.feature}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-1">
            Resolved
            {counts.resolved > 0 && <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">{counts.resolved}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No tickets here. 🎉</p>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map(t => (
                    <li key={t.id}>
                      <button onClick={() => openTicket(t)} className="w-full text-left px-4 py-3 hover:bg-accent/40 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground">{t.seeker?.full_name || 'Unknown seeker'}</span>
                              {t.category && <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>}
                              <Badge variant={STATUS_VARIANT[t.status]} className="text-[10px]">{STATUS_LABELS[t.status]}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {t.seeker?.email} · {format(new Date(t.created_at), 'dd MMM yyyy, HH:mm')}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!active} onOpenChange={(open) => { if (!open) setActive(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {active.kind === 'issue' ? <Bug className="w-5 h-5 text-destructive" /> : <Lightbulb className="w-5 h-5 text-primary" />}
                  {active.kind === 'issue' ? 'Issue Report' : 'Feature Request'}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-1">
                  <p className="text-sm font-medium text-foreground">{active.seeker?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{active.seeker?.email}</p>
                  {active.seeker?.phone && <p className="text-xs text-muted-foreground">{active.seeker.phone}</p>}
                  <p className="text-[10px] text-muted-foreground pt-1">
                    Submitted {format(new Date(active.created_at), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>

                {active.category && (
                  <div>
                    <label className="text-xs text-muted-foreground">Category</label>
                    <p className="text-sm font-medium">{active.category}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground">Description</label>
                  <p className="text-sm whitespace-pre-wrap mt-1">{active.description}</p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <Select value={statusEdit} onValueChange={(v) => setStatusEdit(v as Ticket['status'])}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['open','in_progress','resolved','closed'] as const).map(s => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Reply to seeker (optional)</label>
                  <Textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    rows={4}
                    placeholder="Write a short update or resolution note. The seeker will see this in their notifications."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTicket} disabled={saving} className="flex-1 gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                  </Button>
                  <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
