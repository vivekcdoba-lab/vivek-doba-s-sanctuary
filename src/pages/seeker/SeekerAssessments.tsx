import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

const WHEEL_SELF = [
  { dim: 'Career', score: 5 }, { dim: 'Finance', score: 3 }, { dim: 'Health', score: 7 },
  { dim: 'Family', score: 8 }, { dim: 'Relations', score: 4 }, { dim: 'Growth', score: 6 },
  { dim: 'Fun', score: 5 }, { dim: 'Environ', score: 6 }, { dim: 'Spiritual', score: 8 }, { dim: 'Service', score: 5 },
];

const PROGRESS_TABLE = [
  { name: 'Wheel of Life', initial: '4.6', m1: '5.1', m2: '5.8', m3: '6.2' },
  { name: 'LGT Balance', initial: '45%', m1: '52%', m2: '61%', m3: '68%' },
  { name: 'Happiness', initial: '5.5', m1: '6.0', m2: '6.8', m3: '7.2' },
  { name: 'Purushartha Balance', initial: '50%', m1: '55%', m2: '62%', m3: '65%' },
];

const SeekerAssessments = () => {
  const [selfAssessing, setSelfAssessing] = useState(false);
  const [selfScores, setSelfScores] = useState(WHEEL_SELF.map(w => w.score));

  const radarData = WHEEL_SELF.map((w, i) => ({ dim: w.dim, score: selfScores[i] }));
  const selfOverall = (selfScores.reduce((a, b) => a + b, 0) / selfScores.length).toFixed(1);

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-xl font-bold text-foreground">My Transformation Assessments</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* SWOT */}
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-dharma-green border border-border">
          <p className="text-xs text-muted-foreground">📋 SWOT</p>
          <p className="text-lg font-bold text-foreground">S:5 W:3</p>
          <p className="text-[10px] text-muted-foreground">Last: 15/02/2026</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
        {/* Wheel of Life */}
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-primary border border-border">
          <p className="text-xs text-muted-foreground">⭐ Wheel of Life</p>
          <p className="text-lg font-bold text-foreground">{selfOverall}/10</p>
          <p className="text-[10px] text-muted-foreground">Last: 01/03/2026</p>
          <button onClick={() => setSelfAssessing(true)} className="text-xs text-primary mt-2 font-medium">🎯 Self-Assess</button>
        </div>
        {/* LGT */}
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-saffron border border-border">
          <p className="text-xs text-muted-foreground">🔺 LGT</p>
          <p className="text-lg font-bold text-foreground">68%</p>
          <p className="text-[10px] text-muted-foreground">Balance</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
        {/* Purusharthas */}
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-wisdom-purple border border-border">
          <p className="text-xs text-muted-foreground">🕉️ Purusharthas</p>
          <p className="text-sm font-bold text-foreground">D:8 A:5 K:4 M:7</p>
          <p className="text-[10px] text-muted-foreground">Last: 01/03/2026</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
        {/* Happiness */}
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-dharma-green border border-border">
          <p className="text-xs text-muted-foreground">😊 Happiness</p>
          <p className="text-lg font-bold text-foreground">7.2/10</p>
          <p className="text-[10px] text-dharma-green">↑0.5</p>
          <button className="text-xs text-primary mt-2">😊 Quick Check</button>
        </div>
        {/* MOOCH */}
        <div className="bg-card rounded-xl p-4 border-l-4 border-l-chakra-indigo border border-border">
          <p className="text-xs text-muted-foreground">🧠 MOOCH</p>
          <p className="text-sm font-bold text-foreground">5 patterns</p>
          <p className="text-[10px] text-muted-foreground">Awareness: 6.5</p>
          <button className="text-xs text-primary mt-2">View Details</button>
        </div>
      </div>

      {/* Self-Assessment Form */}
      {selfAssessing && (
        <div className="bg-card rounded-xl p-5 border-2 border-primary/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">⭐ Wheel of Life Self-Assessment</h3>
            <button onClick={() => setSelfAssessing(false)} className="text-xs text-muted-foreground hover:text-foreground">Close ✕</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10 }} />
                <Radar dataKey="score" stroke="#3F51B5" fill="#3F51B5" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {WHEEL_SELF.map((w, i) => (
            <div key={w.dim} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20">{w.dim}</span>
              <input type="range" min={1} max={10} value={selfScores[i]} onChange={e => {
                const next = [...selfScores];
                next[i] = +e.target.value;
                setSelfScores(next);
              }} className="flex-1 accent-chakra-indigo" />
              <span className="text-sm font-bold text-foreground w-5 text-right">{selfScores[i]}</span>
            </div>
          ))}
          <p className="text-center text-lg font-bold text-foreground">Overall: {selfOverall} / 10</p>
          <button onClick={() => setSelfAssessing(false)} className="w-full px-4 py-2.5 rounded-xl gradient-chakravartin text-primary-foreground text-sm font-medium">💾 Save Self-Assessment</button>
        </div>
      )}

      {/* Progress Table */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-3">📊 My Progress Over Time</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left p-2 font-medium text-muted-foreground">Assessment</th>
              <th className="text-center p-2 font-medium text-muted-foreground">Initial</th>
              <th className="text-center p-2 font-medium text-muted-foreground">Month 1</th>
              <th className="text-center p-2 font-medium text-muted-foreground">Month 2</th>
              <th className="text-center p-2 font-medium text-muted-foreground">Month 3</th>
            </tr></thead>
            <tbody>
              {PROGRESS_TABLE.map(row => (
                <tr key={row.name} className="border-b border-border">
                  <td className="p-2 text-foreground font-medium">{row.name}</td>
                  <td className="p-2 text-center text-muted-foreground">{row.initial}</td>
                  <td className="p-2 text-center text-foreground">{row.m1}</td>
                  <td className="p-2 text-center text-foreground">{row.m2}</td>
                  <td className="p-2 text-center text-dharma-green font-medium">{row.m3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeekerAssessments;
