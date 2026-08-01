import { useSessionCredits } from '@/hooks/useSessionCredits';
import { AlertTriangle, Gift, Ticket } from 'lucide-react';

interface Props {
  seekerId?: string | null;
}

const SessionCreditsCard = ({ seekerId }: Props) => {
  const { data } = useSessionCredits(seekerId);
  if (!data || data.totalAllowed === 0) return null;

  const pct = Math.min(Math.round((data.sessionsUsed / data.totalAllowed) * 100), 100);
  const creditPct = data.bonusCapReached ? 100 : Math.round(((data.earnedCredits % 10) / 10) * 100);

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">🎟️ Sessions &amp; Credits</h3>

      <div>
        <div className="flex items-end justify-between mb-1">
          <p className="text-2xl font-bold text-foreground">
            {data.sessionsUsed}
            <span className="text-sm text-muted-foreground">/{data.totalAllowed}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            sessions used
            {data.bonusSessionsGranted > 0 && ` (incl. ${data.bonusSessionsGranted} bonus)`}
          </p>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full gradient-saffron transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        {data.atLimit && (
          <p className="mt-2 text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            You have used all your sessions. Earn credits or contact your coach.
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-foreground flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-primary" /> Earned credits
          </p>
          <p className="text-xs text-muted-foreground">
            {data.bonusCapReached
              ? 'Bonus cap reached (3/3)'
              : `${data.creditsToNextBonus} more for +1 bonus session`}
          </p>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700" style={{ width: `${creditPct}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {data.earnedCredits} credits · each reviewed assignment earns 4
        </p>
      </div>

      {data.workshopCreditsTotal > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
          <Ticket className="w-4 h-4 text-primary" />
          <p className="text-xs text-foreground">
            <span className="font-semibold">{data.workshopCreditsRemaining}</span> of{' '}
            {data.workshopCreditsTotal} free workshop credits remaining
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionCreditsCard;
