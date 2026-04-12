import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question { id: string; text: string; category: string; type: string }

const AdminCreateAssessment = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const questions: Question[] = JSON.parse(localStorage.getItem('admin_question_bank') || '[]');

  const toggle = (id: string) => { const s = new Set(selectedIds); if (s.has(id)) s.delete(id); else s.add(id); setSelectedIds(s); };
  const create = () => {
    if (!title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    const assessments = JSON.parse(localStorage.getItem('admin_assessments') || '[]');
    assessments.push({ id: crypto.randomUUID(), title, description, questionIds: Array.from(selectedIds), createdAt: new Date().toISOString() });
    localStorage.setItem('admin_assessments', JSON.stringify(assessments));
    toast({ title: '✅ Assessment created' });
    setStep(1); setTitle(''); setDescription(''); setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">📝 Create Assessment</h1><p className="text-muted-foreground">Build a new assessment from the question bank</p></div>
      <div className="flex gap-2 mb-4">{[1, 2, 3].map(s => <Badge key={s} variant={step >= s ? 'default' : 'outline'} className="px-4 py-1">Step {s}</Badge>)}</div>
      {step === 1 && (
        <Card><CardHeader><CardTitle>Assessment Details</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assessment title" /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" /></div>
          <Button onClick={() => { if (!title) { toast({ title: 'Title required', variant: 'destructive' }); return; } setStep(2); }}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </CardContent></Card>
      )}
      {step === 2 && (
        <Card><CardHeader><CardTitle>Select Questions ({selectedIds.size} selected)</CardTitle></CardHeader><CardContent className="space-y-3">
          {questions.length === 0 ? <p className="text-muted-foreground">No questions in bank. Add some first.</p> :
          questions.map(q => (
            <div key={q.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggle(q.id)} />
              <div><p className="font-medium">{q.text}</p><div className="flex gap-2 mt-1"><Badge variant="outline">{q.category}</Badge><Badge variant="secondary">{q.type}</Badge></div></div>
            </div>
          ))}
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button></div>
        </CardContent></Card>
      )}
      {step === 3 && (
        <Card><CardHeader><CardTitle>Review & Create</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Title</p><p className="font-medium">{title}</p></div>
          <div><p className="text-sm text-muted-foreground">Description</p><p>{description || '—'}</p></div>
          <div><p className="text-sm text-muted-foreground">Questions Selected</p><p className="font-medium">{selectedIds.size}</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><Button onClick={create}><ClipboardList className="w-4 h-4 mr-2" />Create Assessment</Button></div>
        </CardContent></Card>
      )}
    </div>
  );
};

export default AdminCreateAssessment;
