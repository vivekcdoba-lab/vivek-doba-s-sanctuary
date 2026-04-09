import BackToHome from '@/components/BackToHome';
import { Building2, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const DEPARTMENTS = ['Sales', 'Operations', 'Finance', 'HR', 'Product', 'Customer Success', 'Tech', 'Leadership'];

export default function SeekerArthaDashboard() {
  const { profile } = useAuthStore();

  // For now, show structure — real data will come from seeker_assessments
  const { data: assessment } = useQuery({
    queryKey: ['artha-assessment', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('seeker_id', profile!.id)
        .eq('type', 'business_health')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const scores = (assessment?.scores_json as any) || {};

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <BackToHome />
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--gold))]/10 flex items-center justify-center mx-auto"><Building2 className="w-8 h-8 text-[hsl(var(--gold))]" /></div>
        <h1 className="text-2xl font-bold text-foreground">📊 Business Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your 8-Department Health Overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DEPARTMENTS.map(dept => {
          const score = scores[dept.toLowerCase()] || 0;
          const pct = score * 10;
          return (
            <div key={dept} className="bg-card rounded-xl border border-border p-4 text-center">
              <h3 className="text-xs font-semibold text-foreground mb-2">{dept}</h3>
              <div className="relative w-14 h-14 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--gold))" strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{score || '–'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!assessment && (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Complete a Business Health Assessment to see scores here. Your coach will guide you through this process.</p>
        </div>
      )}
    </div>
  );
}
