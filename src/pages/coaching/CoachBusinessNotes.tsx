import { useState } from 'react';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Building2, DollarSign, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { decryptMany } from '@/lib/encryption';

export default function CoachBusinessNotes() {
  const { data: seekers = [] } = useSeekerProfiles();
  const [selectedSeeker, setSelectedSeeker] = useState('');

  const { data: businesses = [] } = useQuery({
    queryKey: ['bn-businesses', selectedSeeker],
    enabled: !!selectedSeeker,
    queryFn: async () => {
      const { data, error } = await supabase.from('business_profiles').select('*').eq('seeker_id', selectedSeeker);
      if (error) throw error;
      const rows = (data || []) as any[];
      if (rows.length === 0) return [];
      // Batched decrypt of revenue_enc across all businesses (single RPC)
      const revs = await decryptMany(rows.map(r => r.revenue_enc ?? null));
      return rows.map((r, i) => ({ ...r, revenue: revs[i] ?? null }));
    },
  });

  const businessId = businesses[0]?.id;

  const { data: cashflows = [] } = useQuery({
    queryKey: ['bn-cashflow', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.from('cashflow_records').select('*').eq('business_id', businessId!).order('date', { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: accounting = [] } = useQuery({
    queryKey: ['bn-accounting', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.from('accounting_records').select('*').eq('business_id', businessId!).order('year', { ascending: false }).order('month', { ascending: false }).limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  const biz = businesses[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#FF6B00]" /> Business Notes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review seeker business financials and notes</p>
      </div>

      <Card className="p-4">
        <label className="text-sm font-medium mb-2 block">Select Seeker</label>
        <Select value={selectedSeeker} onValueChange={setSelectedSeeker}>
          <SelectTrigger className="max-w-md"><SelectValue placeholder="Choose a seeker..." /></SelectTrigger>
          <SelectContent>
            {seekers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      {selectedSeeker && !businessId && (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No business profile found.</p></Card>
      )}

      {biz && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center text-lg">🏢</div>
              <div>
                <h3 className="font-bold text-foreground">{biz.business_name}</h3>
                <p className="text-xs text-muted-foreground">{biz.industry} • Team: {biz.team_size} • Revenue: {biz.revenue_range || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {accounting.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> P&L Summary</h3>
              <div className="space-y-2">
                {accounting.map(rec => (
                  <div key={rec.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg text-sm">
                    <span className="text-xs text-muted-foreground w-16">{rec.month}/{rec.year}</span>
                    <span className="text-green-600">Revenue: ₹{Number(rec.revenue || 0).toLocaleString()}</span>
                    <span className="text-red-500">Expenses: ₹{Number(rec.expenses || 0).toLocaleString()}</span>
                    <span className="font-medium text-foreground ml-auto">Profit: ₹{Number(rec.profit || 0).toLocaleString()}</span>
                    {rec.notes && <Badge variant="outline" className="text-[10px]">📝 {rec.notes}</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {cashflows.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /> Recent Cash Flow</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cashflows.map(cf => (
                  <div key={cf.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg text-sm">
                    <span className="text-xs text-muted-foreground w-20">{cf.date}</span>
                    <Badge className={cf.type === 'inflow' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>{cf.type === 'inflow' ? '↑' : '↓'} {cf.type}</Badge>
                    <span className="text-foreground">₹{Number(cf.amount).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground truncate flex-1">{cf.description || cf.category}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {accounting.length === 0 && cashflows.length === 0 && (
            <Card className="p-8 text-center"><p className="text-muted-foreground">No financial data recorded for this business yet.</p></Card>
          )}
        </>
      )}
    </div>
  );
}
