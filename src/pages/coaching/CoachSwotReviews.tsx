import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScopedSeekers } from '@/hooks/useScopedSeekers';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Shield, AlertTriangle, TrendingUp, Target } from 'lucide-react';

const SWOT_CONFIG = {
  strength: { emoji: '💪', color: 'bg-green-100 border-green-300 dark:bg-green-900/20', title: 'Strengths', icon: Shield },
  weakness: { emoji: '⚠️', color: 'bg-red-100 border-red-300 dark:bg-red-900/20', title: 'Weaknesses', icon: AlertTriangle },
  opportunity: { emoji: '🚀', color: 'bg-blue-100 border-blue-300 dark:bg-blue-900/20', title: 'Opportunities', icon: TrendingUp },
  threat: { emoji: '🎯', color: 'bg-amber-100 border-amber-300 dark:bg-amber-900/20', title: 'Threats', icon: Target },
};

export default function CoachSwotReviews() {
  const { data: seekers = [] } = useScopedSeekers();
  const [selectedSeeker, setSelectedSeeker] = useState('');

  const { data: businesses = [] } = useQuery({
    queryKey: ['swot-businesses', selectedSeeker],
    enabled: !!selectedSeeker,
    queryFn: async () => {
      const { data, error } = await supabase.from('business_profiles').select('id, business_name').eq('seeker_id', selectedSeeker);
      if (error) throw error;
      return data || [];
    },
  });

  const businessId = businesses[0]?.id;

  const { data: swotItems = [] } = useQuery({
    queryKey: ['swot-items', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.from('business_swot_items').select('*').eq('business_id', businessId!).order('importance', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#FF6B00]" /> SWOT Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-1">View seeker business SWOT analysis</p>
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
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">This seeker has not registered a business profile yet.</p>
        </Card>
      )}

      {businessId && (
        <>
          <p className="text-sm font-medium text-foreground">🏢 {businesses[0]?.business_name} • {swotItems.length} items</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(SWOT_CONFIG) as Array<keyof typeof SWOT_CONFIG>).map(type => {
              const config = SWOT_CONFIG[type];
              const items = swotItems.filter(i => i.type === type);
              return (
                <Card key={type} className={`p-4 border ${config.color}`}>
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <span>{config.emoji}</span> {config.title} ({items.length})
                  </h3>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No {config.title.toLowerCase()} recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="p-2 bg-background rounded-lg">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <Badge variant="outline" className="text-[10px]">Priority: {item.importance}/5</Badge>
                          </div>
                          {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                          {item.action_plan && <p className="text-xs text-[#FF6B00] mt-1">📋 {item.action_plan}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
