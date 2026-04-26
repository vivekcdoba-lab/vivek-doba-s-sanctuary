import { useState } from 'react';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Mail, MapPin, Phone, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function CoachSeekersSearch() {
  const { data: seekers = [], isLoading } = useScopedSeekers();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const cities = [...new Set(seekers.map(s => s.city).filter(Boolean))];

  const filtered = seekers.filter(s => {
    const matchesSearch = !search ||
      (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.occupation || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.company || '').toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === 'all' || s.city === cityFilter;
    const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
    return matchesSearch && matchesCity && matchesGender;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Eye className="w-6 h-6 text-[#FF6B00]" /> Search Seekers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Advanced search across all seeker profiles</p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name, email, phone, city, company..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger><SelectValue placeholder="Filter by City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger><SelectValue placeholder="Filter by Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">{filtered.length} results found</p>

      <div className="space-y-2">
        {filtered.map(seeker => (
          <Card key={seeker.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9248] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(seeker.full_name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-1">
                <div>
                  <p className="font-semibold text-foreground">{seeker.full_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{seeker.email}</p>
                </div>
                <div>
                  {seeker.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{seeker.phone}</p>}
                  {seeker.city && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{seeker.city}</p>}
                </div>
                <div>
                  {seeker.occupation && <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />{seeker.occupation}</p>}
                  {seeker.company && <p className="text-xs text-muted-foreground">{seeker.company}</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined: {format(new Date(seeker.created_at), 'dd MMM yyyy')}
                  </p>
                  {seeker.gender && <p className="text-xs text-muted-foreground capitalize">{seeker.gender}</p>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No seekers match your search criteria</p>
        </div>
      )}
    </div>
  );
}
