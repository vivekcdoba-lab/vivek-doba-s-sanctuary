import { Check, Clock, Eye, Edit3, Lock } from 'lucide-react';

interface SessionReviewStatusProps {
  status: string;
  revisionNote?: string | null;
}

const REVIEW_STEPS = [
  { key: 'completed', label: 'Completed', icon: Check },
  { key: 'submitted', label: 'Submitted', icon: Clock },
  { key: 'reviewing', label: 'Reviewing', icon: Eye },
  { key: 'approved', label: 'Approved', icon: Lock },
];

const STATUS_ORDER: Record<string, number> = {
  completed: 0,
  submitted: 1,
  reviewing: 2,
  approved: 3,
  revision_requested: 1, // Goes back to submitted level
};

const SessionReviewStatus = ({ status, revisionNote }: SessionReviewStatusProps) => {
  const currentStep = STATUS_ORDER[status] ?? -1;
  const isRevision = status === 'revision_requested';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {REVIEW_STEPS.map((step, i) => {
          const isActive = i <= currentStep && !isRevision;
          const isCurrent = i === currentStep;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isActive
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isCurrent && isRevision
                  ? 'bg-warning-amber/20 border-warning-amber text-warning-amber'
                  : 'bg-muted border-border text-muted-foreground'
              }`}>
                <StepIcon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
              {i < REVIEW_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  i < currentStep && !isRevision ? 'bg-primary' : 'bg-border'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {isRevision && revisionNote && (
        <div className="bg-warning-amber/10 border border-warning-amber/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-warning-amber flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" /> Revision Requested
          </p>
          <p className="text-xs text-foreground/80 mt-1">{revisionNote}</p>
        </div>
      )}
    </div>
  );
};

export default SessionReviewStatus;
