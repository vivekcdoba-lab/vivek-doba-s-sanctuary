import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useDbCourses } from '@/hooks/useDbCourses';
import { Loader2 } from 'lucide-react';

const SeekersPage = () => {
  const { data: seekers = [], isLoading } = useSeekerProfiles();
  const { data: courses = [] } = useDbCourses();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSeeker, setNewSeeker] = useState({ full_name: '', email: '', phone: '', city: '' });

  const handleAddSeeker = () => {
    if (!newSeeker.full_name || !newSeeker.email) { toast.error('Please fill name and email'); return; }
    toast.success(`Seeker "${newSeeker.full_name}" — please register them via the signup page`);
    setShowAddDialog(false);
    setNewSeeker({ full_name: '', email: '', phone: '', city: '' });
  };

  const filtered = seekers.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Seekers</h1>
          <p className="text-sm text-muted-foreground">{seekers.length} seekers in your journey</p>
        </div>
        <button onClick={() => setShowAddDialog(true)} className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add New Seeker
        </button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Seeker</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name *</Label><Input value={newSeeker.full_name} onChange={e => setNewSeeker({ ...newSeeker, full_name: e.target.value })} placeholder="Full name" /></div>
            <div><Label>Email *</Label><Input type="email" value={newSeeker.email} onChange={e => setNewSeeker({ ...newSeeker, email: e.target.value })} placeholder="Email" /></div>
            <div><Label>Phone</Label><Input value={newSeeker.phone} onChange={e => setNewSeeker({ ...newSeeker, phone: e.target.value })} placeholder="Phone" /></div>
            <div><Label>City</Label><Input value={newSeeker.city} onChange={e => setNewSeeker({ ...newSeeker, city: e.target.value })} placeholder="City" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddSeeker}>Add Seeker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16"><span className="text-5xl block mb-4">🧘</span><p className="text-muted-foreground">No seekers found.</p></div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map(seeker => (
            <div key={seeker.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden card-hover">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0 gradient-chakravartin">
                    {seeker.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/seekers/${seeker.id}`} className="font-semibold text-foreground truncate hover:text-primary block">{seeker.full_name}</Link>
                    <p className="text-xs text-muted-foreground">{seeker.email}</p>
                    <p className="text-xs text-muted-foreground">{seeker.city || 'No city'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <span>{seeker.phone || 'No phone'}</span>
                  <span>•</span>
                  <span>{seeker.company || 'No company'}</span>
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
            <thead><tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
              <th className="text-left p-3 font-medium text-muted-foreground">City</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3"><Link to={`/seekers/${s.id}`} className="text-primary hover:underline font-medium">{s.full_name}</Link></td>
                  <td className="p-3 text-muted-foreground">{s.email}</td>
                  <td className="p-3 text-muted-foreground">{s.phone || '—'}</td>
                  <td className="p-3 text-muted-foreground">{s.city || '—'}</td>
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
