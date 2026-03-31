import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SeekerWeeklyReview = () => {
  const { toast } = useToast();
  const [rating, setRating] = useState(4);
  const [wins, setWins] = useState(['', '', '']);
  const [challenge, setChallenge] = useState('');
  const [learning, setLearning] = useState('');
  const [wheelScores, setWheelScores] = useState<number[]>([7, 4, 8, 6, 5, 7, 3, 7, 9, 6]);
  const [nextGoals, setNextGoals] = useState('');
  const [needFromCoach, setNeedFromCoach] = useState('');
  const [gratitude, setGratitude] = useState('');

  const wheelDims = ['💼 Career', '💰 Finance', '❤️ Health', '🏠 Family', '💕 Relations', '📚 Growth', '🎯 Fun', '🌿 Environ', '🕉️ Spiritual', '🙏 Service'];

  const now = new Date(2025, 2, 31);
  const weekStart = new Date(now.getTime() - 6 * 86400000);
  const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1} — ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground">Weekly Review</h1>
      <p className="text-sm text-muted-foreground">Week: {weekLabel}</p>

      {/* Rating */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm text-center">
        <p className="text-sm font-semibold text-foreground mb-2">How was your week?</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setRating(s)}>
              <Star className={`w-8 h-8 transition-colors ${s <= rating ? 'fill-primary text-primary' : 'text-muted'}`} />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{rating}/5 stars</p>
      </div>

      {/* Top 3 Wins */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm space-y-2">
        <h3 className="text-sm font-semibold text-foreground">🏆 Top 3 Wins This Week</h3>
        {wins.map((w, i) => (
          <input key={i} value={w} onChange={e => { const n = [...wins]; n[i] = e.target.value; setWins(n); }}
            placeholder={`Win #${i + 1}`} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
        ))}
      </div>

      {/* Challenge */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">😤 Biggest Challenge</h3>
        <textarea value={challenge} onChange={e => setChallenge(e.target.value)} placeholder="What challenged you most?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
      </div>

      {/* Learning */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">📚 Key Learning</h3>
        <textarea value={learning} onChange={e => setLearning(e.target.value)} placeholder="What did you learn?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
      </div>

      {/* Wheel of Life Quick Check */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">📊 Wheel of Life — Quick Check</h3>
        <div className="space-y-2">
          {wheelDims.map((dim, i) => (
            <div key={dim} className="flex items-center gap-2">
              <span className="text-xs w-24 text-foreground">{dim}</span>
              <input type="range" min="1" max="10" value={wheelScores[i]} onChange={e => { const n = [...wheelScores]; n[i] = +e.target.value; setWheelScores(n); }} className="flex-1 accent-primary" />
              <span className="text-xs font-semibold text-primary w-6 text-right">{wheelScores[i]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Average: {(wheelScores.reduce((a, b) => a + b, 0) / wheelScores.length).toFixed(1)}/10</p>
      </div>

      {/* Next Week Goals */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">🎯 Next Week Goals</h3>
        <textarea value={nextGoals} onChange={e => setNextGoals(e.target.value)} placeholder="What do you want to achieve?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
      </div>

      {/* Coach Request */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">🙏 What I Need From Coach</h3>
        <textarea value={needFromCoach} onChange={e => setNeedFromCoach(e.target.value)} placeholder="Any guidance, resources, or support needed?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
      </div>

      {/* Gratitude */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">🙏 Gratitude</h3>
        <textarea value={gratitude} onChange={e => setGratitude(e.target.value)} placeholder="What are you grateful for this week?" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" rows={2} />
      </div>

      {/* Submit */}
      <button onClick={() => toast({ title: '✅ Weekly review submitted!', description: 'Coach will review your reflections.' })} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
        <Send className="w-4 h-4" /> Submit Weekly Review
      </button>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Vivek Doba Training Solutions</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🙏 for seekers of transformation</p>
      </footer>
    </div>
  );
};

export default SeekerWeeklyReview;
