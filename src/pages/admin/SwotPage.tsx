import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vdtsSwot, competitors } from '@/data/swotData';
import { Shield, AlertTriangle, Target, Zap, Users } from 'lucide-react';

const iconMap = {
  strength: <Shield className="h-5 w-5 text-emerald-600" />,
  weakness: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  opportunity: <Target className="h-5 w-5 text-blue-500" />,
  threat: <Zap className="h-5 w-5 text-red-500" />,
};

const labelMap = {
  strength: { label: 'Strengths', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  weakness: { label: 'Weaknesses', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  opportunity: { label: 'Opportunities', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  threat: { label: 'Threats', color: 'bg-red-50 border-red-200 text-red-800' },
};

const threatColors: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function SwotPage() {
  const grouped = {
    strength: vdtsSwot.filter((e) => e.category === 'strength'),
    weakness: vdtsSwot.filter((e) => e.category === 'weakness'),
    opportunity: vdtsSwot.filter((e) => e.category === 'opportunity'),
    threat: vdtsSwot.filter((e) => e.category === 'threat'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SWOT Analysis</h1>
        <p className="text-muted-foreground">VDTS competitive positioning & market analysis</p>
      </div>

      <Tabs defaultValue="vdts">
        <TabsList>
          <TabsTrigger value="vdts">VDTS SWOT</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="vdts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['strength', 'weakness', 'opportunity', 'threat'] as const).map((cat) => (
              <Card key={cat} className={`border ${labelMap[cat].color}`}>
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  {iconMap[cat]}
                  <CardTitle className="text-lg">{labelMap[cat].label}</CardTitle>
                  <Badge variant="secondary" className="ml-auto">{grouped[cat].length}</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {grouped[cat].map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">{cat === 'strength' ? '✅' : cat === 'weakness' ? '⚠️' : cat === 'opportunity' ? '🎯' : '⚡'}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="mt-4 space-y-4">
          {competitors.map((c) => (
            <Card key={c.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                  </div>
                  <Badge className={threatColors[c.threatLevel]}>Threat: {c.threatLevel}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-emerald-700">Their Strengths</h4>
                    <ul className="space-y-1">
                      {c.strengths.map((s, i) => (
                        <li key={i} className="text-xs flex items-start gap-1"><span>✅</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-amber-700">Their Weaknesses</h4>
                    <ul className="space-y-1">
                      {c.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs flex items-start gap-1"><span>⚠️</span>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-blue-700">Our Advantage</h4>
                    <ul className="space-y-1">
                      {c.opportunityForVDTS.map((o, i) => (
                        <li key={i} className="text-xs flex items-start gap-1"><span>→</span>{o}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
