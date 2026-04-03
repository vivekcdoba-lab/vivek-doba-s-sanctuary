import { useState } from 'react';
import { ASSIGNMENTS, SEEKERS } from '@/data/mockData';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackToHome from '@/components/BackToHome';

const SeekerTasks = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'actions'>('assignments');
  const { toast } = useToast();
  const seekerAssignments = ASSIGNMENTS.filter(a => a.seeker_id === 's1');

  const statusConfig: Record<string, { label: string; color: string }> = {
    assigned: { label: '🔵 Assigned', color: 'bg-blue-500/10 text-blue-500' },
    in_progress: { label: '🟠 In Progress', color: 'bg-orange-500/10 text-orange-500' },
    submitted: { label: '🟣 Submitted', color: 'bg-purple-500/10 text-purple-500' },
    reviewed: { label: '✅ Reviewed', color: 'bg-green-500/10 text-green-500' },
    overdue: { label: '🔴 Overdue', color: 'bg-red-500/10 text-red-500' },
  };

  const priorityConfig: Record<string, string> = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };

  const actionItems = [
    { id: 1, text: 'Review Bhagavad Gita Chapter 3 notes', session: '#8', done: false },
    { id: 2, text: 'Practice delegation exercise with team', session: '#8', done: false },
    { id: 3, text: 'Update vision board with Q2 goals', session: '#7', done: true },
    { id: 4, text: 'Complete gratitude journaling for 7 days', session: '#7', done: true },
    { id: 5, text: 'Schedule team feedback sessions', session: '#6', done: false },
  ];

  const [items, setItems] = useState(actionItems);

  const getDueText = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - new Date('2025-03-31').getTime()) / 86400000);
    if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, color: 'text-destructive font-semibold' };
    if (diff === 0) return { text: 'Due today', color: 'text-yellow-500' };
    return { text: `Due in ${diff} days`, color: 'text-blue-500' };
  };

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <BackToHome />
      <h1 className="text-xl font-bold text-foreground">My Tasks</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ key: 'assignments' as const, label: '📝 Assignments', count: seekerAssignments.length }, { key: 'actions' as const, label: '✅ Action Items', count: items.filter(i => !i.done).length }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {activeTab === 'assignments' && (
        <div className="space-y-3">
          {seekerAssignments.map(a => {
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
                  <span className="text-[10px] text-muted-foreground">{priorityConfig[a.priority]}</span>
                  {a.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a.category}</span>}
                </div>
                {a.score !== undefined && (
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

      {activeTab === 'actions' && (
        <div className="space-y-2">
          {items.map(item => (
            <label key={item.id} className={`flex items-start gap-3 bg-card rounded-xl p-3 border border-border cursor-pointer transition-all ${item.done ? 'opacity-60' : ''}`}>
              <input type="checkbox" checked={item.done} onChange={() => { setItems(prev => prev.map(i => i.id === item.id ? { ...i, done: !i.done } : i)); toast({ title: item.done ? 'Unmarked' : '✅ Completed!' }); }} className="mt-1 accent-primary w-4 h-4" />
              <div className="flex-1">
                <p className={`text-sm text-foreground ${item.done ? 'line-through' : ''}`}>{item.text}</p>
                <p className="text-[10px] text-muted-foreground">From Session {item.session}</p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeekerTasks;
