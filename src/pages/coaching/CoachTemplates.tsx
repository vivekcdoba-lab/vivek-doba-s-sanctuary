import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TEMPLATES = [
  { id: 1, category: '📅 Session', title: 'Session Reminder', text: '🙏 नमस्कार! कल हमारी coaching session है। समय पर ज़रूर join करें। Meeting link आपके dashboard पर उपलब्ध है।\n\n- Coach Vivek' },
  { id: 2, category: '📝 Worksheet', title: 'Worksheet Nudge', text: '🙏 नमस्कार! आज की daily worksheet अभी तक submit नहीं हुई। कृपया आज शाम तक भरें।\n\nRemember: consistency ही success की कुंजी है! 🔥\n\n- Coach Vivek' },
  { id: 3, category: '🎉 Motivation', title: 'Streak Celebration', text: '🎉 बधाई हो! आपने लगातार worksheets submit करके शानदार streak बनाई है!\n\nKeep up the great work! आपकी dedication inspiring है।\n\n🙏 - Coach Vivek' },
  { id: 4, category: '✅ Assignment', title: 'Assignment Due', text: '🙏 नमस्कार! आपका assignment जल्द ही due है। कृपया समय पर submit करें।\n\nHelp चाहिए तो बेझिझक message करें।\n\n- Coach Vivek' },
  { id: 5, category: '💰 Artha', title: 'Business Review', text: '🙏 नमस्कार! इस हफ्ते हमें आपकी business progress review करनी है। कृपया:\n\n1. SWOT update करें\n2. Cash flow entries add करें\n3. Department health scores update करें\n\nMilkar aapke business ko grow karte hain! 🚀\n\n- Coach Vivek' },
  { id: 6, category: '☀️ Moksha', title: 'Meditation Check', text: '🕉️ नमस्कार! आज meditation practice कैसी रही?\n\nRemember: रोज़ 15 min meditation से inner peace और clarity बढ़ती है।\n\nOm Shanti 🙏\n\n- Coach Vivek' },
  { id: 7, category: '📊 Weekly', title: 'Weekly Check-in', text: '🙏 नमस्कार!\n\nइस हफ्ते का summary:\n- क्या अच्छा हुआ?\n- किसमें improvement चाहिए?\n- अगले हफ्ते का goal?\n\nPlease share your thoughts! 📝\n\n- Coach Vivek' },
  { id: 8, category: '❤️ Kama', title: 'Relationship Check', text: '🙏 नमस्कार!\n\nFamily और relationships पर ध्यान दें:\n- Quality time spend करें\n- Active listening practice करें\n- Gratitude express करें\n\nHappy relationships = Happy life! ❤️\n\n- Coach Vivek' },
];

export default function CoachTemplates() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: '📋 Copied!', description: 'Template copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#FF6B00]" /> Message Templates
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Pre-written templates for quick communication</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map(t => (
          <Card key={t.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t.category}</Badge>
                <h3 className="font-medium text-foreground">{t.title}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(t.id, t.text)} className="h-8">
                {copiedId === t.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg font-sans leading-relaxed max-h-32 overflow-y-auto">{t.text}</pre>
          </Card>
        ))}
      </div>
    </div>
  );
}
