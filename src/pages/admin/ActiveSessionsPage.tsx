import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, LogOut, Clock, Users, Filter, RefreshCw, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface SessionRow {
  id: string;
  user_id: string;
  profile_id: string | null;
  role: string | null;
  status: string;
  login_at: string;
  last_activity_at: string;
  logout_at: string | null;
  logout_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  duration_seconds: number | null;
  profiles?: { full_name: string; email: string } | null;
}

function parseDevice(ua: string | null) {
  if (!ua) return 'Unknown';
  if (/Mobile|Android|iPhone/i.test(ua)) return '📱 Mobile';
  if (/Tablet|iPad/i.test(ua)) return '📱 Tablet';
  return '💻 Desktop';
}

function liveDuration(loginAt: string) {
  const seconds = Math.floor((Date.now() - new Date(loginAt).getTime()) / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ActiveSessionsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [, setTick] = useState(0);

  // Tick every 30s to update live durations
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Active sessions (real-time)
  const { data: activeSessions = [], refetch: refetchActive } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_sessions')
        .select('*, profiles!user_sessions_profile_id_fkey(full_name, email)')
        .eq('status', 'active')
        .order('login_at', { ascending: false });
      return (data || []) as SessionRow[];
    },
    refetchInterval: 15000,
  });

  // Session history
  const { data: historyData = [], refetch: refetchHistory } = useQuery({
    queryKey: ['session-history', statusFilter, reasonFilter, searchQuery, dateFilter?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('user_sessions')
        .select('*, profiles!user_sessions_profile_id_fkey(full_name, email)')
        .order('login_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (reasonFilter !== 'all') query = query.eq('logout_reason', reasonFilter);
      if (dateFilter) {
        const start = new Date(dateFilter);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateFilter);
        end.setHours(23, 59, 59, 999);
        query = query.gte('login_at', start.toISOString()).lte('login_at', end.toISOString());
      }

      const { data } = await query;
      let results = (data || []) as SessionRow[];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = results.filter(s =>
          s.profiles?.full_name?.toLowerCase().includes(q) ||
          s.profiles?.email?.toLowerCase().includes(q) ||
          s.role?.toLowerCase().includes(q)
        );
      }
      return results;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('user_sessions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_sessions' }, () => {
        refetchActive();
        refetchHistory();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleForceLogout = async (sessionId: string) => {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        status: 'closed',
        logout_reason: 'forced',
        logout_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      toast.error('Failed to force logout');
    } else {
      toast.success('User session terminated');
      refetchActive();
      refetchHistory();
    }
  };

  const reasonBadge = (reason: string | null) => {
    const colors: Record<string, string> = {
      manual: 'bg-muted text-muted-foreground',
      auto: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      forced: 'bg-destructive/10 text-destructive',
      system: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    if (!reason) return <span className="text-muted-foreground">—</span>;
    return <Badge className={colors[reason] || ''}>{reason}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Monitor className="w-6 h-6 text-primary" /> Active Sessions
          </h1>
          <p className="text-sm text-muted-foreground">Real-time user session monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchActive(); refetchHistory(); }}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Currently Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{activeSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Sessions Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {historyData.filter(s => new Date(s.login_at).toDateString() === new Date().toDateString()).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Auto-Expired Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {historyData.filter(s =>
                s.logout_reason === 'auto' &&
                new Date(s.login_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Currently Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active sessions right now</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{s.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.role === 'admin' ? '👑 Admin' : '👤 Seeker'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(s.login_at), 'MMM dd, hh:mm a')}</TableCell>
                    <TableCell className="text-sm">{formatDistanceToNow(new Date(s.last_activity_at), { addSuffix: true })}</TableCell>
                    <TableCell className="font-mono text-sm">{liveDuration(s.login_at)}</TableCell>
                    <TableCell className="text-sm">{parseDevice(s.user_agent)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{s.ip_address}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleForceLogout(s.id)}
                      >
                        <LogOut className="w-3 h-3 mr-1" /> Force Logout
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" /> Session History
          </CardTitle>
          <div className="flex flex-wrap gap-3 mt-3">
            <Input
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Reason" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="forced">Forced</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-44 justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "MMM dd, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {dateFilter && (
              <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)}>
                Clear date
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Logout</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{s.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{s.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.role === 'admin' ? '👑' : '👤'} {s.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(s.login_at), 'MMM dd, hh:mm a')}</TableCell>
                  <TableCell className="text-sm">
                    {s.logout_at ? format(new Date(s.logout_at), 'MMM dd, hh:mm a') : <Badge className="bg-green-100 text-green-800">Active</Badge>}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {s.status === 'active' ? liveDuration(s.login_at) : formatDuration(s.duration_seconds)}
                  </TableCell>
                  <TableCell>{reasonBadge(s.logout_reason)}</TableCell>
                  <TableCell className="text-sm">{parseDevice(s.user_agent)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{s.ip_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {historyData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No session history found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveSessionsPage;
