import { useState } from 'react';
import { Phone, MessageSquare, Mail, Check, X, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AppType = 'discovery' | 'workshop' | 'lgt';
type AppStatus = 'pending' | 'approved' | 'rejected' | 'follow_up';

interface Application {
  id: string;
  type: AppType;
  status: AppStatus;
  submittedAt: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  profession: string;
  revenue: string;
  details: Record<string, any>;
}

const MOCK_APPS: Application[] = [
  { id: 'app1', type: 'discovery', status: 'pending', submittedAt: '2026-03-29', name: 'Rajesh Mehta', phone: '9876501234', email: 'rajesh@email.com', city: 'Pune', profession: 'CEO', revenue: '₹5Cr-₹10Cr', details: { challenge: 'Looking for work-life balance and spiritual growth while managing rapid business expansion.', slot: 'Wed 02 Apr, 10:00 AM', source: 'YouTube' } },
  { id: 'app2', type: 'discovery', status: 'pending', submittedAt: '2026-03-30', name: 'Anjali Desai', phone: '9876505678', email: 'anjali@email.com', city: 'Mumbai', profession: 'HR Director', revenue: '₹1Cr-₹5Cr', details: { challenge: 'Team dynamics and personal leadership growth.', slot: 'Thu 03 Apr, 2:00 PM', source: 'LinkedIn' } },
  { id: 'app3', type: 'workshop', status: 'pending', submittedAt: '2026-03-28', name: 'Kiran Patil', phone: '9876509012', email: 'kiran@email.com', city: 'Pune', profession: 'Business Owner', revenue: '₹50L-₹1Cr', details: { workshop: 'Laws of Attraction through Ramayana', location: 'Pune', goals: 'Want to manifest better outcomes for my business using spiritual principles.' } },
  { id: 'app4', type: 'workshop', status: 'approved', submittedAt: '2026-03-25', name: 'Deepa Joshi', phone: '9876503456', email: 'deepa@email.com', city: 'Nagpur', profession: 'Teacher', revenue: 'Below ₹10 Lakhs', details: { workshop: 'Team Building', location: 'Online (Zoom)', goals: 'Learn team management skills for school administration.' } },
  { id: 'app5', type: 'lgt', status: 'pending', submittedAt: '2026-03-30', name: 'Vikrant Shah', phone: '9876507890', email: 'vikrant@email.com', city: 'Mumbai', profession: 'Founder & CEO', revenue: '₹10Cr-₹25Cr', details: { program: "Life's Golden Triangle — Business Owners", challenge1: 'Struggling with delegation and trust issues with team', challenge2: 'Marriage suffering due to overwork', challenge3: 'Lost connection with spiritual practice', wheelScores: [7,4,6,5,8,5,6,4,3,5], expectations: 'Complete transformation in personal, professional and spiritual life. Want to build a legacy, not just a business.' } },
  { id: 'app6', type: 'lgt', status: 'pending', submittedAt: '2026-03-31', name: 'Sunita Reddy', phone: '9876502345', email: 'sunita@email.com', city: 'Hyderabad', profession: 'Managing Director', revenue: '₹25Cr-₹50Cr', details: { program: 'Chakravartin — The Sovereign Leadership Program', challenge1: 'Need to transition from operations to visionary leadership', expectations: 'Become the kind of leader who inspires through dharma, not just authority.' } },
  { id: 'app7', type: 'discovery', status: 'approved', submittedAt: '2026-03-24', name: 'Mohan Kulkarni', phone: '9876506789', email: 'mohan@email.com', city: 'Pune', profession: 'Doctor', revenue: '₹50L-₹1Cr', details: { challenge: 'Burnout and finding deeper purpose in medical practice.', slot: 'Mon 31 Mar, 3:30 PM', source: 'Referral' } },
  { id: 'app8', type: 'workshop', status: 'pending', submittedAt: '2026-03-31', name: 'Prashant Gaikwad', phone: '9876504567', email: 'prashant@email.com', city: 'Pune', profession: 'Team Lead', revenue: '₹10L-₹50L', details: { workshop: 'Leadership through Mahabharata', location: 'Pune', goals: 'Develop strategic thinking and learn leadership lessons from Mahabharata.' } },
  { id: 'app9', type: 'lgt', status: 'rejected', submittedAt: '2026-03-20', name: 'Anil Verma', phone: '9876508901', email: 'anil@email.com', city: 'Delhi', profession: 'Student', revenue: 'Not Applicable', details: { program: "Life's Golden Triangle — Leaders Edition", reason: 'Not Ready — recommended to start with a workshop first.' } },
];

const typeBadge = (t: AppType) => {
  const map = { discovery: { label: '📞 Discovery Call', bg: '#DBEAFE', color: '#1D4ED8' }, workshop: { label: '🎯 Workshop', bg: '#FFF3CD', color: '#B8860B' }, lgt: { label: '👑 LGT Application', bg: '#FEF3C7', color: '#92400E' } };
  const s = map[t];
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
};

const statusBadge = (s: AppStatus) => {
  const map = { pending: { label: '⏳ Pending Review', bg: '#FEF3C7', color: '#92400E' }, approved: { label: '✅ Approved', bg: '#D1FAE5', color: '#065F46' }, rejected: { label: '❌ Rejected', bg: '#FEE2E2', color: '#991B1B' }, follow_up: { label: '🔄 Follow-up', bg: '#DBEAFE', color: '#1D4ED8' } };
  const st = map[s];
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>;
};

const daysAgo = (d: string) => { const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000); return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff} days ago`; };

const ApplicationsPage = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState(MOCK_APPS);
  const [filter, setFilter] = useState<'all' | AppType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AppStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = apps.filter(a => (filter === 'all' || a.type === filter) && (statusFilter === 'all' || a.status === statusFilter));
  const pendingCount = (t: AppType) => apps.filter(a => a.type === t && a.status === 'pending').length;

  const approve = (id: string) => {
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'approved' as AppStatus } : a));
    const app = apps.find(a => a.id === id);
    if (app?.type === 'lgt') {
      toast({ title: `✅ ${app.name} approved and added as a Seeker!`, description: 'Profile created with all application data.' });
      const msg = encodeURIComponent(`🙏 Namaste ${app.name} ji! Welcome to the Life's Golden Triangle family! Your application has been approved. You are now part of an extraordinary transformation journey. — Vivek Doba`);
      window.open(`https://wa.me/91${app.phone}?text=${msg}`, '_blank');
    } else if (app?.type === 'discovery') {
      toast({ title: `✅ Discovery call with ${app.name} confirmed!` });
    } else {
      toast({ title: `✅ ${app.name}'s workshop registration approved!` });
    }
  };

  const reject = (id: string) => {
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'rejected' as AppStatus, details: { ...a.details, reason: rejectReason } } : a));
    toast({ title: 'Application rejected' });
    setRejectId(null);
    setRejectReason('');
  };

  const markFollowUp = (id: string) => {
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'follow_up' as AppStatus } : a));
    toast({ title: 'Marked for follow-up' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📥 Incoming Applications</h1>
          <p className="text-sm text-muted-foreground">Review and manage all incoming registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">{apps.filter(a => a.status === 'pending').length} Pending</span>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all' as const, label: 'All', count: apps.length },
          { key: 'discovery' as const, label: '📞 Discovery Calls', count: pendingCount('discovery') },
          { key: 'workshop' as const, label: '🎯 Workshops', count: pendingCount('workshop') },
          { key: 'lgt' as const, label: '👑 LGT Applications', count: pendingCount('lgt') },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filter === t.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
            {t.label} {t.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-destructive/20 text-destructive">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {(['all','pending','approved','rejected','follow_up'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'}`}>
            {s === 'all' ? 'All' : s === 'pending' ? '⏳ Pending' : s === 'approved' ? '✅ Approved' : s === 'rejected' ? '❌ Rejected' : '🔄 Follow-up'}
          </button>
        ))}
      </div>

      {/* Application Cards */}
      <div className="space-y-3">
        {filtered.map(app => (
          <div key={app.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <button onClick={() => setExpanded(expanded === app.id ? null : app.id)} className="w-full p-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{app.name}</span>
                    {typeBadge(app.type)}
                    {statusBadge(app.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{app.city} · {app.profession} · {app.revenue}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{daysAgo(app.submittedAt)} · {app.phone} · {app.email}</p>
                  {app.type === 'discovery' && app.details.slot && <p className="text-xs text-primary mt-1">📅 Requested: {app.details.slot}</p>}
                  {app.type === 'workshop' && <p className="text-xs text-primary mt-1">🎯 {app.details.workshop}</p>}
                  {app.type === 'lgt' && <p className="text-xs text-primary mt-1">👑 {app.details.program}</p>}
                </div>
                {expanded === app.id ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
              </div>
            </button>

            {expanded === app.id && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Details */}
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                  {app.details.challenge && <p><strong>Challenge:</strong> {app.details.challenge}</p>}
                  {app.details.goals && <p><strong>Goals:</strong> {app.details.goals}</p>}
                  {app.details.expectations && <p><strong>Expectations:</strong> {app.details.expectations}</p>}
                  {app.details.challenge1 && <p><strong>Challenge 1:</strong> {app.details.challenge1}</p>}
                  {app.details.challenge2 && <p><strong>Challenge 2:</strong> {app.details.challenge2}</p>}
                  {app.details.challenge3 && <p><strong>Challenge 3:</strong> {app.details.challenge3}</p>}
                  {app.details.source && <p><strong>Source:</strong> {app.details.source}</p>}
                  {app.details.wheelScores && (
                    <div>
                      <strong>Wheel of Life (Pre-Intake):</strong>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {['Career','Finance','Health','Peace','Family','Marriage','Social','Spiritual','Fun','Purpose'].map((d, i) => (
                          <div key={d} className="flex justify-between">
                            <span className="text-muted-foreground">{d}:</span>
                            <span className={`font-medium ${app.details.wheelScores[i] < 5 ? 'text-destructive' : 'text-foreground'}`}>{app.details.wheelScores[i]}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {app.details.reason && <p className="text-destructive"><strong>Rejection Reason:</strong> {app.details.reason}</p>}
                </div>

                {/* Actions */}
                {app.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => approve(app.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setRejectId(app.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors">
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => markFollowUp(app.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/5 transition-colors">
                      <RefreshCw className="w-4 h-4" /> Follow-up
                    </button>
                    <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border"><Phone className="w-4 h-4" /></a>
                    <a href={`https://wa.me/91${app.phone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border"><MessageSquare className="w-4 h-4" /></a>
                    <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border"><Mail className="w-4 h-4" /></a>
                  </div>
                )}

                {/* Reject Modal Inline */}
                {rejectId === app.id && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Reason for rejection:</p>
                    <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                      <option value="">Select reason...</option>
                      <option>Not a Fit</option>
                      <option>Not Ready</option>
                      <option>Budget Mismatch</option>
                      <option>Insufficient Commitment</option>
                      <option>Other</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => reject(app.id)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-destructive">Confirm Reject</button>
                      <button onClick={() => setRejectId(null)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground border border-border">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">📭</p>
            <p>No applications match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
