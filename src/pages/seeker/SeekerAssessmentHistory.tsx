import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import BackToHome from '@/components/BackToHome';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollText, TrendingUp, Download, GitCompareArrows, Eye, RotateCcw, ArrowUp, ArrowDown, Minus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import { formatDateDMY } from "@/lib/dateFormat";

interface AssessmentRecord {
  id: string;
  type: string;
  scores_json: any;
  analysis_text: string | null;
  notes: string | null;
  period: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  'wheel-of-life': 'Wheel of Life',
  'lgt': 'LGT Assessment',
  'firo-b': 'FIRO-B',
};

const TYPE_COLORS: Record<string, string> = {
  'wheel-of-life': 'bg-[hsl(var(--chakra-indigo))] text-white',
  'lgt': 'bg-[hsl(var(--gold))] text-white',
  'firo-b': 'bg-[hsl(var(--lotus-pink))] text-white',
};

function extractOverallScore(type: string, scores: any): number {
  if (!scores) return 0;
  if (type === 'wheel-of-life' && Array.isArray(scores)) {
    const sum = scores.reduce((a: number, s: any) => a + (typeof s === 'number' ? s : (s?.score ?? 0)), 0);
    return Math.round((sum / (scores.length * 10)) * 100);
  }
  if (type === 'lgt' && scores.sectionScores) {
    const vals = Object.values(scores.sectionScores) as number[];
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }
  if (type === 'firo-b' && scores.dimensions) {
    const vals = Object.values(scores.dimensions) as number[];
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 9)) * 100) : 0;
  }
  if (typeof scores.overall === 'number') return scores.overall;
  if (typeof scores.totalScore === 'number') return scores.totalScore;
  return 0;
}

function extractMetrics(type: string, scores: any): Record<string, number> {
  if (!scores) return {};
  if (type === 'wheel-of-life' && Array.isArray(scores)) {
    const result: Record<string, number> = {};
    scores.forEach((s: any, i: number) => {
      const label = s?.label || `Area ${i + 1}`;
      result[label] = typeof s === 'number' ? s : (s?.score ?? 0);
    });
    return result;
  }
  if (type === 'lgt' && scores.sectionScores) return scores.sectionScores;
  if (type === 'firo-b' && scores.dimensions) return scores.dimensions;
  if (typeof scores === 'object' && !Array.isArray(scores)) {
    const flat: Record<string, number> = {};
    Object.entries(scores).forEach(([k, v]) => { if (typeof v === 'number') flat[k] = v; });
    return flat;
  }
  return {};
}

function scoreBadgeClass(score: number) {
  if (score >= 70) return 'bg-[hsl(var(--dharma-green))] text-white';
  if (score >= 50) return 'bg-[hsl(var(--warning-amber))] text-white';
  return 'bg-destructive text-destructive-foreground';
}

export default function SeekerAssessmentHistory() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailRecord, setDetailRecord] = useState<AssessmentRecord | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['all-assessments', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seeker_assessments')
        .select('*')
        .eq('seeker_id', profile!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AssessmentRecord[];
    },
  });

  const grouped = useMemo(() => {
    const map: Record<string, AssessmentRecord[]> = {};
    assessments.forEach(a => {
      (map[a.type] ??= []).push(a);
    });
    return map;
  }, [assessments]);

  const filtered = activeTab === 'all' ? assessments : assessments.filter(a => a.type === activeTab);
  const types = Object.keys(grouped);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const compareRecords = useMemo(() => {
    if (selectedIds.length !== 2) return null;
    const a = assessments.find(x => x.id === selectedIds[0]);
    const b = assessments.find(x => x.id === selectedIds[1]);
    return a && b ? [a, b] : null;
  }, [selectedIds, assessments]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Assessment History Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDateDMY(new Date())}`, 20, 28);
    let y = 40;
    filtered.forEach(a => {
      if (y > 260) { doc.addPage(); y = 20; }
      const score = extractOverallScore(a.type, a.scores_json);
      doc.setFontSize(12);
      doc.text(`${TYPE_LABELS[a.type] || a.type} — ${formatDateDMY(new Date(a.created_at))}`, 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Score: ${score}%`, 20, y);
      y += 6;
      if (a.analysis_text) {
        const lines = doc.splitTextToSize(a.analysis_text, 170);
        doc.text(lines, 20, y);
        y += lines.length * 5 + 4;
      }
      y += 6;
    });
    doc.save('assessment-history.pdf');
  };

  return (
    <div className="space-y-6">
      <BackToHome />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" /> Assessment History
          </h1>
          <p className="text-muted-foreground text-sm">{assessments.length} assessments taken</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length === 2 && (
            <Button variant="outline" onClick={() => setCompareOpen(true)}>
              <GitCompareArrows className="h-4 w-4 mr-1" /> Compare
            </Button>
          )}
          <Button variant="outline" onClick={exportPDF} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSelectedIds([]); }}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          {types.map(t => (
            <TabsTrigger key={t} value={t}>{TYPE_LABELS[t] || t}</TabsTrigger>
          ))}
        </TabsList>

        {/* Trend charts row */}
        {types.filter(t => grouped[t].length >= 2).length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 mt-4">
            {types.filter(t => grouped[t].length >= 2).map(t => {
              const chartData = [...grouped[t]].reverse().map(a => ({
                date: format(new Date(a.created_at), 'MMM d'),
                score: extractOverallScore(t, a.scores_json),
              }));
              return (
                <Card key={t} className="min-w-[260px] flex-shrink-0">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" /> {TYPE_LABELS[t] || t} Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-3">
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <p className="text-muted-foreground py-10 text-center">Loading assessments…</p>
          ) : filtered.length === 0 ? (
            <Card className="py-12 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No assessments found. Take your first assessment!</p>
              <Button className="mt-4" onClick={() => window.location.href = '/seeker/assessments'}>
                Take Assessment
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {filtered.map(a => {
                const score = extractOverallScore(a.type, a.scores_json);
                const metrics = extractMetrics(a.type, a.scores_json);
                const metricEntries = Object.entries(metrics).slice(0, 4);
                return (
                  <Card key={a.id} className="rounded-2xl hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedIds.includes(a.id)}
                            onCheckedChange={() => toggleSelect(a.id)}
                          />
                          <Badge className={TYPE_COLORS[a.type] || 'bg-muted text-muted-foreground'}>
                            {TYPE_LABELS[a.type] || a.type}
                          </Badge>
                        </div>
                        <Badge className={scoreBadgeClass(score)}>{score}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{formatDateDMY(new Date(a.created_at))}</p>
                      {metricEntries.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {metricEntries.map(([k, v]) => (
                            <div key={k} className="text-xs">
                              <span className="text-muted-foreground">{k}:</span>{' '}
                              <span className="font-semibold">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDetailRecord(a)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Details
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => window.location.href = '/seeker/assessments'}>
                          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retake
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!detailRecord} onOpenChange={open => { if (!open) setDetailRecord(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {detailRecord && (
            <>
              <DialogHeader>
                <DialogTitle>{TYPE_LABELS[detailRecord.type] || detailRecord.type}</DialogTitle>
                <DialogDescription>{format(new Date(detailRecord.created_at), 'PPPp')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Overall Score:</span>
                  <Badge className={scoreBadgeClass(extractOverallScore(detailRecord.type, detailRecord.scores_json))}>
                    {extractOverallScore(detailRecord.type, detailRecord.scores_json)}%
                  </Badge>
                </div>
                {detailRecord.period && (
                  <p className="text-sm"><span className="text-muted-foreground">Period:</span> {detailRecord.period}</p>
                )}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Score Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(extractMetrics(detailRecord.type, detailRecord.scores_json)).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {detailRecord.analysis_text && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Analysis & Insights</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailRecord.analysis_text}</p>
                  </div>
                )}
                {detailRecord.notes && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Coach Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailRecord.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Modal */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Comparison</DialogTitle>
            <DialogDescription>Side-by-side score comparison</DialogDescription>
          </DialogHeader>
          {compareRecords && (() => {
            const [a, b] = compareRecords;
            const metricsA = extractMetrics(a.type, a.scores_json);
            const metricsB = extractMetrics(b.type, b.scores_json);
            const allKeys = [...new Set([...Object.keys(metricsA), ...Object.keys(metricsB)])];
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-center border-b pb-2">
                  <span>Metric</span>
                  <span>{formatDateDMY(new Date(a.created_at))}</span>
                  <span>{formatDateDMY(new Date(b.created_at))}</span>
                </div>
                {/* Overall */}
                {(() => {
                  const sa = extractOverallScore(a.type, a.scores_json);
                  const sb = extractOverallScore(b.type, b.scores_json);
                  const delta = sb - sa;
                  return (
                    <div className="grid grid-cols-3 gap-2 text-sm items-center text-center font-medium bg-muted/50 rounded-lg p-2">
                      <span>Overall</span>
                      <span>{sa}%</span>
                      <span className="flex items-center justify-center gap-1">
                        {sb}%
                        {delta > 0 && <ArrowUp className="h-3.5 w-3.5 text-[hsl(var(--dharma-green))]" />}
                        {delta < 0 && <ArrowDown className="h-3.5 w-3.5 text-destructive" />}
                        {delta === 0 && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                      </span>
                    </div>
                  );
                })()}
                {allKeys.map(k => {
                  const va = metricsA[k] ?? 0;
                  const vb = metricsB[k] ?? 0;
                  const d = vb - va;
                  return (
                    <div key={k} className="grid grid-cols-3 gap-2 text-sm items-center text-center">
                      <span className="text-muted-foreground text-left">{k}</span>
                      <span>{va}</span>
                      <span className="flex items-center justify-center gap-1">
                        {vb}
                        {d > 0 && <ArrowUp className="h-3 w-3 text-[hsl(var(--dharma-green))]" />}
                        {d < 0 && <ArrowDown className="h-3 w-3 text-destructive" />}
                        {d === 0 && <Minus className="h-3 w-3 text-muted-foreground" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
