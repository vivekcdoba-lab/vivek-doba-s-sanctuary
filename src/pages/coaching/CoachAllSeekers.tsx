import { useState } from 'react';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { useDbSessions } from '@/hooks/useDbSessions';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Users, Search, MessageSquare, Calendar, Phone, MapPin, Mail, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CoachAllSeekers() {
  const { data: seekers = [], isLoading } = useScopedSeekers();
  const { data: sessions = [] } = useDbSessions();
  const { data: assignments = [] } = useDbAssignments();
  const [search, setSearch] = useState('');

  const filtered = seekers.filter(s =>
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  const getSeekerStats = (seekerId: string) => {
    const seekerSessions = sessions.filter(s => s.seeker_id === seekerId);
    const seekerAssignments = assignments.filter(a => a.seeker_id === seekerId);
    const completedAssignments = seekerAssignments.filter(a => a.status === 'completed' || a.status === 'reviewed');
    return {
      totalSessions: seekerSessions.length,
      completedSessions: seekerSessions.filter(s => s.status === 'completed').length,
      totalAssignments: seekerAssignments.length,
      completedAssignments: completedAssignments.length,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FF6B00]" /> All Seekers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{seekers.length} seekers assigned to you</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, city, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(seeker => {
          const stats = getSeekerStats(seeker.id);
          const initials = (seeker.full_name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <Card key={seeker.id} className="p-4 hover:shadow-lg transition-shadow border border-border">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9248] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{seeker.full_name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" /> {seeker.email}
                  </p>
                  {seeker.city && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {seeker.city}{seeker.state ? `, ${seeker.state}` : ''}
                    </p>
                  )}
                  {seeker.occupation && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {seeker.occupation}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-foreground">{stats.completedSessions}</p>
                  <p className="text-[10px] text-muted-foreground">Sessions</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-foreground">{stats.completedAssignments}/{stats.totalAssignments}</p>
                  <p className="text-[10px] text-muted-foreground">Assignments</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {seeker.whatsapp && (
                  <a href={`https://wa.me/${seeker.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-xs hover:bg-green-500/20 transition-colors">
                    <Phone className="w-3 h-3" /> WhatsApp
                  </a>
                )}
                <Link to="/coaching/messages"
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-xs hover:bg-blue-500/20 transition-colors">
                  <MessageSquare className="w-3 h-3" /> Message
                </Link>
                <Link to="/coaching/schedule"
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] text-xs hover:bg-[#FF6B00]/20 transition-colors">
                  <Calendar className="w-3 h-3" /> Schedule
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No seekers found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
