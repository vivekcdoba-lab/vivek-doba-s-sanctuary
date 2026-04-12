import { useState, useMemo, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ChevronRight, Download, RotateCcw, TrendingUp, TrendingDown, Minus, Sparkles, ArrowLeft, Save } from 'lucide-react';

const AREAS = [
  { id: 1, name: "Health & Fitness", emoji: "💪", color: "#28A745", hindi: "स्वास्थ्य" },
  { id: 2, name: "Career & Work", emoji: "💼", color: "#17A2B8", hindi: "करियर" },
  { id: 3, name: "Finances", emoji: "💰", color: "#FFD700", hindi: "आर्थिक" },
  { id: 4, name: "Relationships", emoji: "❤️", color: "#E53E3E", hindi: "रिश्ते" },
  { id: 5, name: "Family", emoji: "👨‍👩‍👧‍👦", color: "#FF6B00", hindi: "परिवार" },
  { id: 6, name: "Personal Growth", emoji: "🌱", color: "#6B46C1", hindi: "व्यक्तिगत विकास" },
  { id: 7, name: "Fun & Recreation", emoji: "🎉", color: "#F6AD55", hindi: "मनोरंजन" },
  { id: 8, name: "Physical Environment", emoji: "🏠", color: "#38B2AC", hindi: "वातावरण" },
  { id: 9, name: "Spiritual Life", emoji: "🕉️", color: "#9F7AEA", hindi: "आध्यात्मिक" },
  { id: 10, name: "Emotional Wellbeing", emoji: "😊", color: "#ED64A6", hindi: "भावनात्मक" },
];

function getZoneLabel(score: number) {
  if (score >= 8) return { label: 'THRIVING', emoji: '🌟', bg: 'bg-green-500/15 text-green-600 border-green-500/30' };
  if (score >= 5) return { label: 'GROWING', emoji: '🌱', bg: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30' };
  return { label: 'NEEDS ATTENTION', emoji: '⚠️', bg: 'bg-red-500/15 text-red-500 border-red-500/30' };
}

function getInsight(scores: number[], prevScores?: Record<string, number>) {
  const sorted = [...scores].map((s, i) => ({ score: s, area: AREAS[i] })).sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();
  
  const topNames = top3.map(t => t.area.name).join(', ');
  const bottomNames = bottom3.map(b => b.area.name).join(', ');
  
  return `Your strengths lie in ${topNames}! Focus your growth energy on ${bottomNames} for maximum life balance improvement.`;
}

interface WheelOfLifeEnhancedProps {
  onClose?: () => void;
  onSave?: (scores: Record<string, number>, analysis: string) => void;
}

const WheelOfLifeEnhanced = ({ onClose, onSave }: WheelOfLifeEnhancedProps) => {
  const [scores, setScores] = useState<number[]>(Array(10).fill(5));
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [currentArea, setCurrentArea] = useState(0);
  const [animatedScores, setAnimatedScores] = useState<number[]>(Array(10).fill(0));

  const { history: wolHistory, saveAssessment } = useAssessmentHistory('wheel_of_life');

  // Get previous scores for comparison
  const prevScores = useMemo(() => {
    if (wolHistory.length === 0) return undefined;
    return wolHistory[0].scores_json as Record<string, number>;
  }, [wolHistory]);

  // Animate radar on results
  useEffect(() => {
    if (step !== 'results') return;
    const timer = setTimeout(() => setAnimatedScores(scores), 100);
    return () => clearTimeout(timer);
  }, [step, scores]);

  const analysis = useMemo(() => {
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = total / 10;
    const sorted = [...scores].map((s, i) => ({ score: s, idx: i })).sort((a, b) => b.score - a.score);
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3);
    return { total, avg, top3, bottom3 };
  }, [scores]);

  const radarData = AREAS.map((a, i) => ({
    name: `${a.emoji} ${a.name}`,
    shortName: a.emoji,
    current: animatedScores[i],
    previous: prevScores ? (prevScores[a.name] ?? 0) : undefined,
    fullMark: 10,
  }));

  const handleUpdateScore = (index: number, value: number[]) => {
    const next = [...scores];
    next[index] = value[0];
    setScores(next);
  };

  const handleAnalyze = () => {
    setStep('results');
    setAnimatedScores(Array(10).fill(0));
  };

  const handleSave = async () => {
    try {
      const scoresObj = Object.fromEntries(AREAS.map((a, i) => [a.name, scores[i]]));
      const analysisText = getInsight(scores, prevScores);
      await saveAssessment.mutateAsync({ scores: scoresObj, analysis: analysisText });
      onSave?.(scoresObj, analysisText);
      toast.success('✅ Assessment saved to your profile!');
    } catch {
      toast.error('Failed to save assessment');
    }
  };

  const getChangeArrow = (areaName: string, currentScore: number) => {
    if (!prevScores || prevScores[areaName] === undefined) return null;
    const prev = prevScores[areaName];
    const diff = currentScore - prev;
    if (diff > 0) return <span className="text-green-500 text-xs flex items-center"><TrendingUp className="h-3 w-3 mr-0.5" />+{diff}</span>;
    if (diff < 0) return <span className="text-red-500 text-xs flex items-center"><TrendingDown className="h-3 w-3 mr-0.5" />{diff}</span>;
    return <span className="text-muted-foreground text-xs flex items-center"><Minus className="h-3 w-3 mr-0.5" />0</span>;
  };

  // ─── INPUT STEP ───
  if (step === 'input') {
    return (
      <div className="space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              🌟 Wheel of Life Assessment
            </h2>
            <p className="text-sm text-muted-foreground">"Balance is the key to a fulfilling life"</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {AREAS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                scores[i] > 0 && scores[i] !== 5 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* All areas */}
        <div className="space-y-2">
          {AREAS.map((area, i) => {
            const zone = getZoneLabel(scores[i]);
            return (
              <Card
                key={area.id}
                className={`overflow-hidden transition-all ${currentArea === i ? 'ring-2 ring-primary shadow-lg' : ''}`}
                onClick={() => setCurrentArea(i)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${area.color}20`, color: area.color }}
                    >
                      {area.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{area.name}</p>
                          <p className="text-[10px] text-muted-foreground">{area.hindi}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getChangeArrow(area.name, scores[i])}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: area.color }}
                          >
                            {scores[i]}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Slider
                          value={[scores[i]]}
                          onValueChange={(v) => handleUpdateScore(i, v)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-muted-foreground">1 - Low</span>
                        <Badge variant="outline" className={`text-[9px] ${zone.bg}`}>
                          {zone.emoji} {zone.label}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">10 - High</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button onClick={handleAnalyze} className="w-full py-6 text-base font-bold" size="lg">
          <Sparkles className="h-5 w-5 mr-2" />
          ANALYZE MY WHEEL OF LIFE
        </Button>
      </div>
    );
  }

  // ─── RESULTS STEP ───
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            🌟 Your Wheel of Life Results
          </h2>
          <p className="text-sm text-muted-foreground">Assessment completed • {format(new Date(), 'MMM d, yyyy')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setStep('input')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Edit
        </Button>
      </div>

      {/* Overall Score */}
      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall Score</p>
        <p className="text-4xl font-bold text-primary mt-1">{analysis.avg.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span></p>
        <p className="text-sm text-muted-foreground">{analysis.total}/100 Total • {((analysis.total / 100) * 100).toFixed(0)}% Life Fulfilment</p>
      </div>

      {/* Radar Chart */}
      <Card>
        <CardContent className="p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="shortName"
                  tick={{ fontSize: 16 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 9 }}
                  tickCount={6}
                />
                {prevScores && (
                  <Radar
                    name="Previous"
                    dataKey="previous"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.05}
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                )}
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2.5}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                        <p className="font-semibold">{d.name}</p>
                        <p>Current: <span className="font-bold text-primary">{d.current}</span>/10</p>
                        {d.previous !== undefined && (
                          <p>Previous: <span className="text-muted-foreground">{d.previous}</span>/10</p>
                        )}
                      </div>
                    );
                  }}
                />
                {prevScores && <Legend />}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {prevScores && (
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><div className="w-4 h-0.5 bg-primary rounded" /> Current</span>
              <span className="flex items-center gap-1"><div className="w-4 h-0.5 bg-muted-foreground rounded border-dashed" style={{ borderTop: '2px dashed' }} /> Previous</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-500/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-green-600">🌟 Strengths (Top 3)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {analysis.top3.map(item => (
              <div key={item.idx} className="flex items-center justify-between">
                <span className="text-sm">{AREAS[item.idx].emoji} {AREAS[item.idx].name}</span>
                <Badge className="bg-green-500/15 text-green-600 border-green-500/30">{item.score}/10</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-red-500">⚠️ Growth Areas</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {analysis.bottom3.map(item => (
              <div key={item.idx} className="flex items-center justify-between">
                <span className="text-sm">{AREAS[item.idx].emoji} {AREAS[item.idx].name}</span>
                <Badge className="bg-red-500/15 text-red-500 border-red-500/30">{item.score}/10</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed scores with zone indicators */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">📊 All Areas Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {AREAS.map((area, i) => {
            const zone = getZoneLabel(scores[i]);
            const pct = (scores[i] / 10) * 100;
            return (
              <div key={area.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{area.emoji} {area.name}</span>
                  <div className="flex items-center gap-2">
                    {getChangeArrow(area.name, scores[i])}
                    <span className="font-bold text-sm" style={{ color: area.color }}>{scores[i]}/10</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: area.color }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Insight */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1 mb-2">
            💡 AI Insight
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {getInsight(scores, prevScores)}
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => { setStep('input'); setScores(Array(10).fill(5)); }}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-1" /> PDF
        </Button>
        <Button onClick={handleSave} disabled={saveAssessment.isPending}>
          <Save className="h-4 w-4 mr-1" />
          {saveAssessment.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default WheelOfLifeEnhanced;
