import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Users, BookOpen, Crown, Search } from 'lucide-react';
import { useDbCourses } from '@/hooks/useDbCourses';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  useProgramTrainers, useAllProgramTrainers,
  useAssignTrainerToProgram, useUpdateTrainerRole, useRemoveTrainerFromProgram,
  type TrainerRole,
} from '@/hooks/useProgramTrainers';

interface CoachOption { id: string; full_name: string | null; email: string | null; role: string | null; is_also_coach: boolean | null; }

function useEligibleCoaches() {
  return useQuery({
    queryKey: ['eligible-coaches'],
    queryFn: async (): Promise<CoachOption[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, is_also_coach')
        .or('role.eq.coach,role.eq.admin,is_also_coach.eq.true')
        .order('full_name');
      if (error) throw error;
      return (data || []).filter(p => p.role === 'coach' || p.role === 'admin' || p.is_also_coach) as CoachOption[];
    },
  });
}

const ROLE_LABEL: Record<TrainerRole, string> = { lead: 'Lead', co_coach: 'Co-coach', assistant: 'Assistant' };
const ROLE_COLOR: Record<TrainerRole, string> = {
  lead: 'bg-[#FF6B00] text-white',
  co_coach: 'bg-amber-100 text-amber-900',
  assistant: 'bg-slate-100 text-slate-800',
};

export default function AdminProgramCoaches() {
  const [params, setParams] = useSearchParams();
  const initialProgram = params.get('program');
  const { data: courses = [], isLoading: loadingCourses } = useDbCourses();
  const { data: allTrainers = [] } = useAllProgramTrainers();
  const { data: coaches = [] } = useEligibleCoaches();

  const [selectedProgram, setSelectedProgram] = useState<string | null>(initialProgram);
  const [search, setSearch] = useState('');
  const [newCoach, setNewCoach] = useState<string>('');
  const [newRole, setNewRole] = useState<TrainerRole>('co_coach');

  const { data: trainers = [], isLoading: loadingTrainers } = useProgramTrainers(selectedProgram);
  const assign = useAssignTrainerToProgram();
  const updateRole = useUpdateTrainerRole();
  const remove = useRemoveTrainerFromProgram();

  useEffect(() => {
    if (!selectedProgram && courses.length > 0) {
      setSelectedProgram(initialProgram || courses[0].id);
    }
  }, [courses, initialProgram, selectedProgram]);

  useEffect(() => {
    if (selectedProgram) setParams(p => { p.set('program', selectedProgram); return p; }, { replace: true });
  }, [selectedProgram, setParams]);

  const countByProgram = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of allTrainers) m.set(t.program_id, (m.get(t.program_id) || 0) + 1);
    return m;
  }, [allTrainers]);

  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const selectedCourse = courses.find(c => c.id === selectedProgram);

  const availableCoaches = coaches.filter(c => !trainers.some(t => t.trainer_id === c.id));

  const handleAdd = async () => {
    if (!selectedProgram || !newCoach) { toast.error('Pick a coach'); return; }
    try {
      const { autoLinkedCount } = await assign.mutateAsync({ program_id: selectedProgram, trainer_id: newCoach, role: newRole });
      const name = coaches.find(c => c.id === newCoach)?.full_name || 'Coach';
      toast.success(`Added ${name} as ${ROLE_LABEL[newRole]}. ${autoLinkedCount} enrolled seeker(s) auto-linked.`);
      setNewCoach('');
      setNewRole('co_coach');
    } catch (e: any) { toast.error(e.message || 'Failed to add'); }
  };

  if (loadingCourses) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown className="w-6 h-6 text-[#FF6B00]" /> Program Coaches
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign one or more coaches to each program. Coaches automatically see all seekers enrolled in their programs.
        </p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4">
        {/* Programs list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" /> Programs</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
            </div>
          </CardHeader>
          <CardContent className="p-2 max-h-[600px] overflow-y-auto">
            {filteredCourses.map(c => {
              const count = countByProgram.get(c.id) || 0;
              const active = c.id === selectedProgram;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedProgram(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-colors ${active ? 'bg-[#FF6B00]/10 border border-[#FF6B00]/30' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      <Users className="w-3 h-3 mr-1" />{count}
                    </Badge>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.tier}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Trainers panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedCourse ? selectedCourse.name : 'Select a program'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProgram && (
              <>
                {/* Add row */}
                <div className="flex flex-wrap gap-2 items-end p-3 bg-muted/40 rounded-md">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Coach</label>
                    <Select value={newCoach} onValueChange={setNewCoach}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select coach…" /></SelectTrigger>
                      <SelectContent>
                        {availableCoaches.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">All eligible coaches already added.</div>}
                        {availableCoaches.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name || c.email} {c.role === 'admin' ? '(admin)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-[140px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                    <Select value={newRole} onValueChange={v => setNewRole(v as TrainerRole)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="co_coach">Co-coach</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAdd} disabled={assign.isPending || !newCoach} className="h-9 bg-[#FF6B00] hover:bg-[#FF6B00]/90">
                    {assign.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Add</>}
                  </Button>
                </div>

                {/* Trainers list */}
                {loadingTrainers ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : trainers.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    No coaches assigned yet. Add one above to auto-link enrolled seekers.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trainers.map(t => (
                      <div key={t.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-md">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{t.trainer?.full_name || t.trainer?.email || '—'}</div>
                          <div className="text-xs text-muted-foreground truncate">{t.trainer?.email}</div>
                        </div>
                        <Select
                          value={t.role}
                          onValueChange={v => updateRole.mutate({ id: t.id, role: v as TrainerRole }, {
                            onSuccess: () => toast.success('Role updated'),
                            onError: e => toast.error((e as Error).message),
                          })}
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <Badge className={ROLE_COLOR[t.role] + ' border-0'}>{ROLE_LABEL[t.role]}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="co_coach">Co-coach</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => {
                            if (!confirm('Remove this coach from the program? Existing seeker links remain.')) return;
                            remove.mutate({ id: t.id }, {
                              onSuccess: () => toast.success('Coach removed'),
                              onError: e => toast.error((e as Error).message),
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
