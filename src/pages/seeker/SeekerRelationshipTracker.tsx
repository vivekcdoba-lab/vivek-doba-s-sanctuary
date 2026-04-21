import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Heart } from 'lucide-react';

const TYPES = ['💑 Partner', '👨‍👩‍👧‍👦 Family', '👥 Friend', '🤝 Professional'];

type Relationship = {
  id: string;
  name: string;
  type: string;
  score: number;
  lastQualityTime: string;
};

export default function SeekerRelationshipTracker() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);

  const addRelationship = () => {
    if (!name.trim()) return;
    setRelationships(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), type, score: 7, lastQualityTime: 'Just added' },
    ]);
    setName('');
    setType(TYPES[0]);
    setShowAdd(false);
  };

  return (
    <div className="p-4 space-y-5 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-5 text-white">
        <h1 className="text-xl font-bold">❤️ मेरे रिश्ते (My Relationships)</h1>
        <p className="text-sm text-white/80 mt-1">"रिश्ते ही जीवन की असली दौलत हैं"</p>
      </div>

      <button onClick={() => setShowAdd(!showAdd)}
        className="w-full py-2 rounded-xl border-2 border-dashed border-primary/30 text-sm text-primary hover:bg-primary/5 transition-colors">
        ➕ Add Relationship
      </button>

      {showAdd && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <Input placeholder="Name" className="text-sm" value={name} onChange={e => setName(e.target.value)} />
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >{t}</button>
            ))}
          </div>
          <button
            onClick={addRelationship}
            disabled={!name.trim()}
            className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            💾 Save
          </button>
        </div>
      )}

      {relationships.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">No relationships yet</h3>
          <p className="text-xs text-muted-foreground">Tap "Add Relationship" above to start tracking the people who matter most.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relationships.map(r => {
            const needsAttention = r.score <= 5;
            return (
              <div key={r.id} className={`bg-card rounded-2xl border p-5 transition-shadow hover:shadow-md ${needsAttention ? 'border-destructive/30' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      {r.type.split(' ')[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{r.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{r.type} | Last quality time: {r.lastQualityTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${needsAttention ? 'text-destructive' : 'text-green-600'}`}>
                      {needsAttention ? '⚠️' : '❤️'} {r.score}/10
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${r.score >= 8 ? 'bg-green-500' : r.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${r.score * 10}%` }}
                    />
                  </div>
                </div>
                {needsAttention && (
                  <p className="text-[10px] text-destructive mt-2">⚠️ Needs attention - schedule some quality time!</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 rounded-lg text-[10px] bg-muted text-muted-foreground hover:bg-muted/80">📅 Schedule Time</button>
                  <button className="px-3 py-1 rounded-lg text-[10px] bg-muted text-muted-foreground hover:bg-muted/80">💬 Send Appreciation</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
