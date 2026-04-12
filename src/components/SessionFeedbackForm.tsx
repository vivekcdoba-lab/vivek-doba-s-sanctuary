import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SessionFeedbackFormProps {
  onSubmit: (data: { rating: number; wentWell: string; couldImprove: string; takeaways: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const SessionFeedbackForm = ({ onSubmit, isSubmitting = false }: SessionFeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [wentWell, setWentWell] = useState('');
  const [couldImprove, setCouldImprove] = useState('');
  const [takeaways, setTakeaways] = useState('');

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, wentWell, couldImprove, takeaways });
  };

  return (
    <div className="space-y-4">
      {/* Star Rating */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">⭐ Rate this session</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-110">
              <Star className={`w-6 h-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
            </button>
          ))}
          {rating > 0 && <span className="text-sm text-muted-foreground ml-2 self-center">{rating}/5</span>}
        </div>
      </div>

      {/* What went well */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">✅ What went well?</label>
        <Textarea placeholder="Key highlights from this session..." value={wentWell} onChange={e => setWentWell(e.target.value)} rows={2} />
      </div>

      {/* What could improve */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">💡 What could improve?</label>
        <Textarea placeholder="Suggestions for improvement..." value={couldImprove} onChange={e => setCouldImprove(e.target.value)} rows={2} />
      </div>

      {/* Key takeaways */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">🎯 Key takeaways</label>
        <Textarea placeholder="What will you apply from this session?" value={takeaways} onChange={e => setTakeaways(e.target.value)} rows={2} />
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full gap-2">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit Feedback
      </Button>
    </div>
  );
};

export default SessionFeedbackForm;
