import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, HelpCircle, Trash2 } from 'lucide-react';

interface Question { id: string; text: string; category: string; type: string; options?: string[] }

const AdminQuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>(() => JSON.parse(localStorage.getItem('admin_question_bank') || '[]'));
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [newQ, setNewQ] = useState({ text: '', category: 'general', type: 'rating' });
  const [open, setOpen] = useState(false);

  const save = (qs: Question[]) => { setQuestions(qs); localStorage.setItem('admin_question_bank', JSON.stringify(qs)); };
  const addQuestion = () => { if (!newQ.text) return; save([...questions, { id: crypto.randomUUID(), ...newQ }]); setNewQ({ text: '', category: 'general', type: 'rating' }); setOpen(false); };
  const deleteQ = (id: string) => save(questions.filter(q => q.id !== id));
  const categories = ['all', ...new Set(questions.map(q => q.category))];
  const filtered = questions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()) && (catFilter === 'all' || q.category === catFilter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-foreground">❓ Question Bank</h1><p className="text-muted-foreground">Manage assessment questions</p></div>
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Question</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>New Question</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Question Text</Label><Textarea value={newQ.text} onChange={e => setNewQ(p => ({ ...p, text: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label><Select value={newQ.category} onValueChange={v => setNewQ(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['general','personality','leadership','emotional','spiritual'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Type</Label><Select value={newQ.type} onValueChange={v => setNewQ(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['rating','text','multiple_choice','yes_no'].map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <Button onClick={addQuestion} className="w-full">Add Question</Button>
            </div>
          </DialogContent></Dialog></div>
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No questions found. Add your first question!</CardContent></Card> :
        filtered.map(q => (
          <Card key={q.id}><CardContent className="py-4 flex items-start justify-between gap-4">
            <div className="flex-1"><p className="font-medium flex items-center gap-2"><HelpCircle className="w-4 h-4 text-primary shrink-0" />{q.text}</p><div className="flex gap-2 mt-2"><Badge variant="outline">{q.category}</Badge><Badge variant="secondary">{q.type}</Badge></div></div>
            <Button size="sm" variant="ghost" onClick={() => deleteQ(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
};

export default AdminQuestionBank;
