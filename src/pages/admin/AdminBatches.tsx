import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDbCourses } from '@/hooks/useDbCourses';
import { useSeekerProfiles } from '@/hooks/useSeekerProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, Layers } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';

const AdminBatches = () => {
  const { data: courses = [] } = useDbCourses();
  const { data: seekers = [] } = useSeekerProfiles();
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('*').order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Group enrollments by course + start month = "batch"
  const batches = useMemo(() => {
    const map: Record<string, { courseId: string; courseName: string; month: string; enrollments: typeof enrollments }> = {};
    enrollments.forEach(e => {
      const course = courses.find(c => c.id === e.course_id);
      const monthKey = format(startOfMonth(new Date(e.start_date)), 'yyyy-MM');
      const key = `${e.course_id}_${monthKey}`;
      if (!map[key]) {
        map[key] = { courseId: e.course_id, courseName: course?.name || 'Unknown', month: monthKey, enrollments: [] };
      }
      map[key].enrollments.push(e);
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [enrollments, courses]);

  const getSeeker = (id: string) => seekers.find(s => s.id === id);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Batch Management</h1>
        <p className="text-sm text-muted-foreground">{batches.length} batches across {courses.length} programs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <Layers className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{batches.length}</p>
          <p className="text-xs text-muted-foreground">Total Batches</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{enrollments.filter(e => e.status === 'active').length}</p>
          <p className="text-xs text-muted-foreground">Active Enrollments</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <Calendar className="w-6 h-6 mx-auto text-green-500 mb-1" />
          <p className="text-2xl font-bold">{courses.length}</p>
          <p className="text-xs text-muted-foreground">Programs</p>
        </CardContent></Card>
      </div>

      {/* Timeline view */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-6">
          {batches.map((batch, idx) => {
            const course = courses.find(c => c.id === batch.courseId);
            const gc = course?.gradient_colors as any;
            const activeCount = batch.enrollments.filter(e => e.status === 'active').length;
            return (
              <div key={idx} className="relative pl-10">
                <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-primary bg-background" />
                <Card>
                  <div className="h-2 rounded-t-lg" style={{ background: gc ? `linear-gradient(90deg, ${gc[0]}, ${gc[1]})` : 'hsl(var(--primary))' }} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{batch.courseName}</CardTitle>
                      <Badge variant="outline" className="text-xs">{format(new Date(batch.month + '-01'), 'MMM yyyy')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-3 text-sm">
                      <span className="text-muted-foreground"><Users className="w-3.5 h-3.5 inline mr-1" />{batch.enrollments.length} enrolled</span>
                      <span className="text-green-600">{activeCount} active</span>
                      <span className="text-muted-foreground">{batch.enrollments.length - activeCount} other</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {batch.enrollments.slice(0, 10).map(e => {
                        const seeker = getSeeker(e.seeker_id);
                        return (
                          <Badge key={e.id} variant="outline" className="text-xs">
                            {seeker?.full_name || 'Unknown'}
                          </Badge>
                        );
                      })}
                      {batch.enrollments.length > 10 && <Badge variant="secondary" className="text-xs">+{batch.enrollments.length - 10} more</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
          {batches.length === 0 && (
            <div className="pl-10 py-8 text-center text-muted-foreground">No batches found. Enroll seekers to create batches.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBatches;
