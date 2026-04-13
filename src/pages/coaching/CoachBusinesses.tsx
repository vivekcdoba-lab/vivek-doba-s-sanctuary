import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Globe, Calendar, DollarSign, Briefcase } from 'lucide-react';

export default function CoachBusinesses() {
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['coach-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('business_profiles').select('*').order('business_name');
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#FF6B00]" /> Seeker Businesses
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{businesses.length} businesses registered by seekers</p>
      </div>

      {businesses.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No businesses registered yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map(biz => {
            const owner = seekers.find(s => s.id === biz.seeker_id);
            return (
              <Card key={biz.id} className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF9248] flex items-center justify-center text-white text-lg flex-shrink-0">
                    🏢
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{biz.business_name}</h3>
                    {biz.tagline && <p className="text-xs text-muted-foreground italic">{biz.tagline}</p>}
                    {owner && <p className="text-xs text-[#FF6B00] mt-0.5">Owner: {owner.full_name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {biz.industry && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" /> {biz.industry}
                    </div>
                  )}
                  {biz.team_size != null && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" /> {biz.team_size} team members
                    </div>
                  )}
                  {biz.revenue_range && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3" /> {biz.revenue_range}
                    </div>
                  )}
                  {biz.founded_year && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /> Founded {biz.founded_year}
                    </div>
                  )}
                  {biz.website && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
                      <Globe className="w-3 h-3" />
                      <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{biz.website}</a>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
