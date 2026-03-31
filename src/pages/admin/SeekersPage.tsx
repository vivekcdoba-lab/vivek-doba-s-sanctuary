import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Grid3X3, List, Flame } from 'lucide-react';
import { SEEKERS, getHealthColor, getTierBadgeClass } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { calculateRiskScore, getRiskEmoji, getRiskColor } from '@/lib/riskEngine';
import { JOURNEY_STAGES } from '@/types';

const SeekersPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filtered = SEEKERS.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.enrollment?.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Seekers</h1>
          <p className="text-sm text-muted-foreground">{SEEKERS.length} seekers in your journey</p>
        </div>
        <button className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add New Seeker
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'paused', 'completed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div className="flex border border-border rounded-lg overflow-hidden ml-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map((seeker) => (
            <div key={seeker.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0 ${
                    seeker.enrollment?.tier === 'chakravartin' ? 'shimmer-gold' :
                    seeker.enrollment?.tier === 'platinum' ? 'bg-gradient-to-br from-gray-400 to-gray-200 text-foreground' :
                    seeker.enrollment?.tier === 'premium' ? 'gradient-sacred' : 'gradient-chakravartin'
                  }`}>
                    {seeker.full_name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/seekers/${seeker.id}`} className="font-semibold text-foreground truncate hover:text-primary">{seeker.full_name}</Link>
                    <p className="text-xs text-muted-foreground">{seeker.course?.name?.slice(0, 30)}</p>
                    <p className="text-xs text-muted-foreground">{seeker.city}</p>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${getHealthColor(seeker.health)}`} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTierBadgeClass(seeker.enrollment?.tier || '')}`}>
                    {seeker.enrollment?.tier === 'chakravartin' ? '✦ Chakravartin' : seeker.enrollment?.tier?.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    seeker.enrollment?.status === 'active' ? 'bg-dharma-green/10 text-dharma-green' :
                    seeker.enrollment?.status === 'paused' ? 'bg-warning-amber/10 text-warning-amber' :
                    seeker.enrollment?.status === 'completed' ? 'bg-sky-blue/10 text-sky-blue' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {seeker.enrollment?.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span>Sessions: {seeker.sessions_completed}/{seeker.total_sessions}</span>
                  <span>Growth: {seeker.growth_score}%</span>
                  {seeker.streak > 0 && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-saffron" />{seeker.streak}</span>}
                </div>

                <Link to={`/seekers/${seeker.id}`} className="block text-center py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
                  View Journey →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Course</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Tier</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Health</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Growth</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/seekers/${s.id}`}>
                  <td className="p-3 font-medium text-foreground"><Link to={`/seekers/${s.id}`} className="text-primary hover:underline">{s.full_name}</Link></td>
                  <td className="p-3 text-muted-foreground">{s.course?.name?.slice(0, 25)}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTierBadgeClass(s.enrollment?.tier || '')}`}>{s.enrollment?.tier}</span></td>
                  <td className="p-3 text-muted-foreground capitalize">{s.enrollment?.status}</td>
                  <td className="p-3"><div className={`w-2.5 h-2.5 rounded-full ${getHealthColor(s.health)}`} /></td>
                  <td className="p-3 text-foreground font-medium">{s.growth_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeekersPage;
