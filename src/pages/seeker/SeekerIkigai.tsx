import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const SECTIONS = [
  { key: 'love', emoji: '💜', label: 'What do you LOVE doing?', hindi: 'आपको क्या करना पसंद है?', placeholder: 'मुझे लोगों को सिखाना पसंद है...' },
  { key: 'good', emoji: '💪', label: 'What are you GOOD at?', hindi: 'आप किसमें अच्छे हो?', placeholder: 'मैं communication में अच्छा हूं...' },
  { key: 'need', emoji: '🌍', label: 'What does the world NEED?', hindi: 'दुनिया को क्या चाहिए?', placeholder: 'लोगों को life balance की जरूरत है...' },
  { key: 'paid', emoji: '💰', label: 'What can you be PAID for?', hindi: 'आपको किसके लिए पैसे मिल सकते हैं?', placeholder: 'Training, coaching, consulting...' },
];

export default function SeekerIkigai() {
  const [answers, setAnswers] = useState({ love: '', good: '', need: '', paid: '' });
  const [ikigai, setIkigai] = useState('');

  const generateIkigai = () => {
    if (!answers.love || !answers.good || !answers.need || !answers.paid) {
      toast({ title: 'Please fill all 4 sections first', variant: 'destructive' });
      return;
    }
    const statement = `My Ikigai is at the intersection of what I love (${answers.love.slice(0, 30)}...), what I'm good at (${answers.good.slice(0, 30)}...), what the world needs (${answers.need.slice(0, 30)}...), and what I can be paid for (${answers.paid.slice(0, 30)}...).`;
    setIkigai(statement);
    toast({ title: '🎯 Your Ikigai has been revealed!' });
  };

  return (
    <div className="p-4 space-y-5 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white">
        <h1 className="text-xl font-bold">🎯 IKIGAI - अपना PURPOSE खोजो</h1>
        <p className="text-sm text-white/80 mt-1">"Find the intersection of passion, mission, vocation & profession"</p>
      </div>

      {/* Ikigai Visual */}
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <div className="relative w-64 h-64 mx-auto">
          {[
            { label: 'PASSION 💜', top: '5%', left: '25%', color: 'bg-purple-200 dark:bg-purple-800/40' },
            { label: 'MISSION 🟢', top: '50%', left: '5%', color: 'bg-green-200 dark:bg-green-800/40' },
            { label: 'VOCATION 🔵', top: '50%', left: '50%', color: 'bg-blue-200 dark:bg-blue-800/40' },
            { label: 'PROFESSION 🟡', top: '5%', left: '50%', color: 'bg-yellow-200 dark:bg-yellow-800/40' },
          ].map((c, i) => (
            <div key={i} className={`absolute w-32 h-32 rounded-full ${c.color} opacity-60 flex items-center justify-center`}
              style={{ top: c.top, left: c.left }}>
              <span className="text-xs font-bold text-foreground">{c.label}</span>
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center z-10">
            <span className="text-xs font-bold text-primary">IKIGAI ⭐</span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {SECTIONS.map(s => (
          <div key={s.key} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{s.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{s.label}</h3>
                <p className="text-[10px] text-muted-foreground">{s.hindi}</p>
              </div>
            </div>
            <Textarea
              value={answers[s.key as keyof typeof answers]}
              onChange={e => setAnswers(p => ({ ...p, [s.key]: e.target.value }))}
              placeholder={s.placeholder}
              className="min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <button onClick={generateIkigai}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
        🎯 Generate My IKIGAI Statement
      </button>

      {ikigai && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-300 dark:border-purple-700 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">⭐ Your IKIGAI Statement:</h3>
          <p className="text-sm text-foreground italic">"{ikigai}"</p>
        </div>
      )}
    </div>
  );
}
