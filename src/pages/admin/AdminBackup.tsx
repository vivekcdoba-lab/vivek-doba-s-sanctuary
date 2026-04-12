import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, Shield, Clock } from 'lucide-react';

const tables = ['profiles', 'sessions', 'assignments', 'payments', 'enrollments', 'courses', 'daily_worksheets', 'leads', 'follow_ups', 'messages', 'notifications', 'announcements', 'learning_content', 'calendar_events', 'badge_definitions', 'seeker_badges', 'daily_logs', 'japa_log', 'agreements', 'assessments', 'clients', 'business_profiles'];

const AdminBackup = () => (
  <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-foreground">💾 System Backup</h1><p className="text-muted-foreground">Database overview and backup information</p></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{tables.length}</p><p className="text-sm text-muted-foreground">Database Tables</p></CardContent></Card>
      <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center gap-2"><Shield className="w-6 h-6 text-emerald-600" /><p className="text-lg font-bold text-emerald-600">RLS Enabled</p></div><p className="text-sm text-muted-foreground">Row Level Security</p></CardContent></Card>
      <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center gap-2"><Clock className="w-6 h-6 text-primary" /><p className="text-lg font-bold">Automatic</p></div><p className="text-sm text-muted-foreground">Backup Schedule</p></CardContent></Card>
    </div>
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Database Tables</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">{tables.map(t => <Badge key={t} variant="outline" className="py-1.5 px-3"><HardDrive className="w-3 h-3 mr-1" />{t}</Badge>)}</div>
        <p className="text-sm text-muted-foreground mt-4">Backups are managed automatically by Lovable Cloud. Data is continuously replicated and point-in-time recovery is available.</p>
      </CardContent>
    </Card>
  </div>
);

export default AdminBackup;
