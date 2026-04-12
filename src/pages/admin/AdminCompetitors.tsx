import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Swords, Globe } from 'lucide-react';

const threatColor: Record<string, string> = { high: 'destructive', medium: 'default', low: 'secondary' };

const AdminCompetitors = () => {
  const { data: competitors = [], isLoading } = useQuery({ queryKey: ['all-competitors'], queryFn: async () => { const { data, error } = await supabase.from('business_competitors').select('*').order('created_at', { ascending: false }); if (error) throw error; return data; } });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">⚔️ Competitor Tracking</h1><p className="text-muted-foreground">Monitor competitor landscape across all businesses</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{competitors.length}</p><p className="text-sm text-muted-foreground">Total Competitors</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-destructive">{competitors.filter(c => c.threat_level === 'high').length}</p><p className="text-sm text-muted-foreground">High Threat</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{competitors.filter(c => c.threat_level === 'medium').length}</p><p className="text-sm text-muted-foreground">Medium Threat</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Swords className="w-5 h-5" /> All Competitors</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
          <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Website</TableHead><TableHead>Threat Level</TableHead><TableHead>Strengths</TableHead><TableHead>Weaknesses</TableHead><TableHead>Pricing</TableHead></TableRow></TableHeader>
            <TableBody>{competitors.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No competitors tracked yet</TableCell></TableRow> :
              competitors.map(c => <TableRow key={c.id}><TableCell className="font-medium">{c.competitor_name}</TableCell><TableCell>{c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1"><Globe className="w-3 h-3" />Visit</a> : '—'}</TableCell><TableCell><Badge variant={(threatColor[c.threat_level || 'medium'] || 'default') as any}>{c.threat_level || 'medium'}</Badge></TableCell><TableCell className="max-w-[150px] truncate">{c.strengths || '—'}</TableCell><TableCell className="max-w-[150px] truncate">{c.weaknesses || '—'}</TableCell><TableCell>{c.pricing || '—'}</TableCell></TableRow>)}</TableBody></Table>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompetitors;
