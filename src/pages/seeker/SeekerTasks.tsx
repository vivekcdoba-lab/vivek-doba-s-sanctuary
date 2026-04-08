import { useState } from 'react';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useDbAssignments } from '@/hooks/useDbAssignments';
import BackToHome from '@/components/BackToHome';
import { Loader2 } from 'lucide-react';

const SeekerTasks = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'actions'>('assignments');
  const { toast } = useToast();
  const { profile } = useAuthStore();
  const { data: assignments = [], isLoading } = useDbAssignments(profile?.id);

  const statusConfig: Record<string, { label: string; color: string }> = {
    assigned: { label: '🔵 Assigned', color: 'bg-blue-500/10 text-blue-500' },
    in_progress: { label: '🟠 In Progress', color: 'bg-orange-500/10 text-orange-500' },
    submitted: { label: '🟣 Submitted', color: 'bg-purple-500/10 text-purple-500' },
    reviewed: { label: '✅ Reviewed', color: 'bg-green-500/10 text-green-500' },
    overdue: { label: '🔴 Overdue', color: 'bg-red-500/10 text-red-500' },
  };

  const priorityConfig: Record<string, string> = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };

  const getDueText = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, color: 'text-destructive font-semibold' };
    if (diff === 0) return { text: 'Due today', color: 'text-yellow-500' };
    return { text: `Due in ${diff} days`, color: 'text-blue-500' };
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <BackToHome />
      <h1 className="text-xl font-bold text-foreground">My Tasks</h1>
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('assignments')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'assignments' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          📝 Assignments ({assignments.length})
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📋</span>
          <p className="text-muted-foreground">No assignments yet. Check back after your next session!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const due = getDueText(a.due_date);
            return (
              <div key={a.id} className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[a.status]?.color || ''}`}>{statusConfig[a.status]?.label}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs ${due.color}`}>{due.text}</span>
                  <span className="text-[10px] text-muted-foreground">{priorityConfig[a.priority || 'medium']}</span>
                  {a.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a.category}</span>}
                </div>
                {a.score !== null && a.score !== undefined && (
                  <div className="mt-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="text-xs text-green-600 font-medium">Score: {a.score}/100 ⭐</p>
                    {a.feedback && <p className="text-xs text-muted-foreground mt-0.5">{a.feedback}</p>}
                  </div>
                )}
                {(a.status === 'assigned' || a.status === 'in_progress') && (
                  <button onClick={() => toast({ title: '📝 Assignment submitted!' })} className="mt-3 w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1">
                    <Send className="w-3 h-3" /> Submit Assignment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeekerTasks;
