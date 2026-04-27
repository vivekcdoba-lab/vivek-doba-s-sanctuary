import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, Mail, UserCheck, Copy, Check, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ApplyLGT from '../ApplyLGT';
import LgtReport from '@/components/lgt/LgtReport';
import { captureAndEmailLgtReport } from '@/lib/lgtReportEmail';

interface SeekerRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  dob: string | null;
  company: string | null;
  occupation: string | null;
  created_at: string;
}

interface AppRow {
  id: string;
  seeker_id: string;
  status: string;
  invite_token: string | null;
  invited_at: string | null;
  invite_email_sent_at: string | null;
  submitted_at: string | null;
  form_data: Record<string, any> | null;
  version: number | null;
  last_emailed_at: string | null;
}

interface LegacySubmission {
  email: string;
  form_data: any;
  created_at: string;
}

const AdminApplyLgt = () => {
  const { toast } = useToast();
  const [seekers, setSeekers] = useState<SeekerRow[]>([]);
  const [apps, setApps] = useState<Record<string, AppRow>>({});
  const [legacyByEmail, setLegacyByEmail] = useState<Record<string, LegacySubmission>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSubmitted, setShowSubmitted] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [emailingReportFor, setEmailingReportFor] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  // Hidden report render state (used after admin save AND when admin clicks "Email Report")
  const [reportTarget, setReportTarget] = useState<{ seeker: SeekerRow; data: Record<string, any> } | null>(null);
  const reportSentRef = useRef(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: seekerData, error: e1 }, { data: appData, error: e2 }, { data: legacyData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, phone, city, state, country, dob, company, occupation, created_at')
          .eq('role', 'seeker')
          .order('full_name', { ascending: true }),
        supabase
          .from('lgt_applications')
          .select('id, seeker_id, status, invite_token, invited_at, invite_email_sent_at'),
        supabase
          .from('submissions')
          .select('email, form_data, created_at')
          .eq('form_type', 'lgt_application')
          .order('created_at', { ascending: false }),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setSeekers((seekerData as SeekerRow[]) || []);
      const map: Record<string, AppRow> = {};
      ((appData as AppRow[]) || []).forEach(a => { map[a.seeker_id] = a; });
      setApps(map);
      const lmap: Record<string, LegacySubmission> = {};
      ((legacyData as LegacySubmission[]) || []).forEach(l => {
        if (!l.email) return;
        const k = l.email.trim().toLowerCase();
        if (!lmap[k]) lmap[k] = l; // keep most recent (data already sorted desc)
      });
      setLegacyByEmail(lmap);
    } catch (err: any) {
      toast({ title: 'Failed to load seekers', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const hasLegacy = (s: SeekerRow) => {
    const k = (s.email || '').trim().toLowerCase();
    return !!(k && legacyByEmail[k]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return seekers.filter(s => {
      const app = apps[s.id];
      const submitted = app?.status === 'submitted' || hasLegacy(s);
      if (!showSubmitted && submitted) return false;
      if (!q) return true;
      return (
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q)
      );
    });
  }, [seekers, apps, legacyByEmail, search, showSubmitted]);

  const selected = selectedId ? seekers.find(s => s.id === selectedId) : null;
  const selectedApp = selectedId ? apps[selectedId] : null;

  const handleSendInvite = async (seekerId: string) => {
    setSendingTo(seekerId);
    try {
      const { data, error } = await supabase.functions.invoke('send-lgt-invite', { body: { seekerId } });
      if (error) throw error;
      const result = data as any;
      if (result?.warning) {
        toast({ title: 'Invite created', description: result.warning, variant: 'default' });
      } else {
        toast({ title: '✅ Invite email sent', description: `Sent to ${result?.sentTo}` });
      }
      await loadData();
    } catch (err: any) {
      toast({ title: 'Failed to send invite', description: err.message, variant: 'destructive' });
    } finally {
      setSendingTo(null);
    }
  };

  const handleCopyLink = async (token: string) => {
    const link = `${window.location.origin}/lgt-form/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast({ title: '🔗 Link copied to clipboard' });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // ===== Filling form for selected seeker =====
  if (selected) {
    const legacy = legacyByEmail[(selected.email || '').trim().toLowerCase()];
    const initial: Record<string, any> = {
      ...((legacy as any)?.form_data || {}),
      ...((selectedApp as any)?.form_data || {}),
      fullName: selected.full_name || '',
      email: selected.email || '',
      mobile: (selected.phone || '').replace(/^\+\d+/, ''),
      mobileCode: '+91',
      city: selected.city || '',
      state: selected.state || '',
      country: selected.country || 'India',
      dob: selected.dob || '',
      company: selected.company || '',
      designation: selected.occupation || '',
    };
    return (
      <div className="-m-6">
        <div className="px-4 sm:px-6 pt-4 flex items-center justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to seeker list
          </button>
          <div className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
            Filling for: {selected.full_name}
          </div>
        </div>
        <ApplyLGT
          adminMode
          seekerId={selected.id}
          applicationId={selectedApp?.id}
          initialData={initial}
          onAdminSaved={() => {
            // Capture & email a beautiful PDF report to admin + seeker
            const merged = { ...initial };
            setReportTarget({ seeker: selected, data: merged });
            // The hidden <LgtReport> below will mount; capture after a short delay
            setTimeout(async () => {
              if (reportSentRef.current) return;
              reportSentRef.current = true;
              try {
                const { base64, filename } = await generateLgtReportPdf({
                  filename: `LGT-Report-${(selected.full_name || 'Seeker').replace(/\s+/g, '_')}.pdf`,
                });
                const { data, error } = await supabase.functions.invoke('send-lgt-report', {
                  body: { seekerId: selected.id, pdfBase64: base64, filename },
                });
                if (error) throw error;
                const r = data as any;
                if (r?.warning) toast({ title: '⚠️ ' + r.warning });
                else toast({ title: `📧 Report emailed to ${r?.recipients?.length || 0} recipient(s)` });
              } catch (err: any) {
                toast({ title: 'Report email failed', description: err?.message, variant: 'destructive' });
              } finally {
                reportSentRef.current = false;
                setReportTarget(null);
                setSelectedId(null);
                loadData();
              }
            }, 600);
          }}
        />
        {/* Hidden offscreen report for PDF capture */}
        {reportTarget && (
          <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '900px', background: '#fff' }}>
            <LgtReport
              seekerName={reportTarget.seeker.full_name}
              seekerEmail={reportTarget.seeker.email}
              submittedAt={new Date().toISOString()}
              filledByRole="admin"
              data={reportTarget.data}
            />
          </div>
        )}
      </div>
    );
  }

  // ===== Chooser screen =====
  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-foreground">👑 LGT Application — Admin Entry</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select an approved seeker to fill the detailed Life's Golden Triangle application in person, or email them a personal link to complete it themselves.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={showSubmitted}
              onChange={e => setShowSubmitted(e.target.checked)}
              className="accent-primary"
            />
            Show seekers who already submitted
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No seekers match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <th className="px-3 py-2 font-medium">Seeker</th>
                  <th className="px-3 py-2 font-medium hidden md:table-cell">Email</th>
                  <th className="px-3 py-2 font-medium hidden lg:table-cell">Phone</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const app = apps[s.id];
                  const legacy = legacyByEmail[(s.email || '').trim().toLowerCase()];
                  const submittedNew = app?.status === 'submitted';
                  const submittedLegacy = !submittedNew && !!legacy;
                  const submitted = submittedNew || submittedLegacy;
                  const invitedAt = app?.invite_email_sent_at || app?.invited_at;
                  const filledAt = submittedNew ? invitedAt : (submittedLegacy ? legacy?.created_at : invitedAt);
                  const hasActiveToken = !!app?.invite_token;
                  return (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30">
                      <td className="px-3 py-3">
                        <div className="font-medium text-foreground">{s.full_name || '—'}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{s.email}</div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{s.email || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{s.phone || '—'}</td>
                      <td className="px-3 py-3">
                        {submittedNew ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            <Check className="w-3 h-3" /> Submitted
                          </span>
                        ) : submittedLegacy ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800" title="Submitted via the old public form">
                            <Check className="w-3 h-3" /> Submitted (legacy)
                          </span>
                        ) : hasActiveToken ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            <Mail className="w-3 h-3" /> Invite sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            <X className="w-3 h-3" /> Not started
                          </span>
                        )}
                        {filledAt && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {submitted ? 'Filled' : 'Invited'} {new Date(filledAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {!submitted && (
                            <>
                              <button
                                onClick={() => setSelectedId(s.id)}
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-medium"
                              >
                                <UserCheck className="w-3 h-3" /> Fill in person
                              </button>
                              <button
                                onClick={() => handleSendInvite(s.id)}
                                disabled={sendingTo === s.id || !s.email}
                                title={!s.email ? 'Seeker has no email' : 'Email a personal link to seeker'}
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium disabled:opacity-50"
                              >
                                {sendingTo === s.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Mail className="w-3 h-3" />
                                )}
                                {hasActiveToken ? 'Resend invite' : 'Email invite'}
                              </button>
                              {hasActiveToken && app?.invite_token && (
                                <button
                                  onClick={() => handleCopyLink(app.invite_token!)}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-muted"
                                  title="Copy seeker link"
                                >
                                  {copiedToken === app.invite_token ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </>
                          )}
                          {submitted && (
                            <button
                              onClick={() => setSelectedId(s.id)}
                              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium"
                            >
                              View / Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 border border-border">
        💡 <strong>How it works:</strong> "Fill in person" opens the LGT form pre-filled with the seeker's profile data — for face-to-face intake. "Email invite" sends the seeker a personal one-time link valid for 14 days so they can complete it themselves at vivekdoba.com/lgt-form/&lt;token&gt;.
      </div>
    </div>
  );
};

export default AdminApplyLgt;
