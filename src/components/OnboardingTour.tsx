import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  emoji: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'greeting',
    title: 'Welcome to VDTS! 🙏',
    description: 'This is your personal dashboard — your daily command center for transformation. Track streaks, sessions, and more.',
    emoji: '🏠',
  },
  {
    target: 'worksheet',
    title: 'Daily Dharmic Worksheet',
    description: 'Your most important daily practice. Fill it every morning and evening to build consistency and self-awareness.',
    emoji: '📝',
  },
  {
    target: 'progress',
    title: 'Track Your Progress',
    description: 'See your worksheet streaks, completed sessions, and finished tasks at a glance. Consistency is the key!',
    emoji: '🔥',
  },
  {
    target: 'quick-actions',
    title: 'Quick Actions',
    description: 'Access daily check-in, tasks, messaging, meditation, and assessments — everything one tap away.',
    emoji: '⚡',
  },
  {
    target: 'session-progress',
    title: 'Session Progress Ring',
    description: 'Track how many coaching sessions you\'ve completed out of your total program. Aim for 100%!',
    emoji: '🎯',
  },
  {
    target: 'bottom-nav',
    title: 'Navigation Bar',
    description: 'Use the bottom bar to jump between Home, Daily Log, Tasks, Growth tracking, Sacred Space, and your Profile.',
    emoji: '🧭',
  },
];

const STORAGE_KEY = 'vdts_onboarding_tour_completed';

interface OnboardingTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

const OnboardingTour = ({ forceShow = false, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; arrowDir: 'up' | 'down' }>({ top: 0, left: 0, arrowDir: 'up' });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
      return;
    }
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (count < 2) {
      const t = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  const positionTooltip = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const tooltipHeight = 220;
      const viewportHeight = window.innerHeight;

      // Prefer placing below the element
      let top = rect.bottom + 12;
      let arrowDir: 'up' | 'down' = 'up';

      if (top + tooltipHeight > viewportHeight - 80) {
        // Place above
        top = rect.top - tooltipHeight - 12;
        arrowDir = 'down';
      }

      // Clamp
      top = Math.max(8, Math.min(top, viewportHeight - tooltipHeight - 80));

      const left = Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336));

      setTooltipPos({ top, left, arrowDir });
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    return () => window.removeEventListener('resize', positionTooltip);
  }, [isVisible, currentStep, positionTooltip]);

  const finish = useCallback(() => {
    setIsVisible(false);
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    localStorage.setItem(STORAGE_KEY, String(count + 1));
    onComplete?.();
  }, [onComplete]);

  const next = () => {
    if (currentStep < TOUR_STEPS.length - 1) setCurrentStep(s => s + 1);
    else finish();
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const highlightEl = document.querySelector(`[data-tour="${step.target}"]`);
  const highlightRect = highlightEl?.getBoundingClientRect();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]" onClick={finish}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 6}
                  y={highlightRect.top - 6}
                  width={highlightRect.width + 12}
                  height={highlightRect.height + 12}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tour-mask)" />
        </svg>
      </div>

      {/* Highlight ring */}
      {highlightRect && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse"
          style={{
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-[320px] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-2"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={finish} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {/* Step content */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{step.emoji}</span>
          <h3 className="font-bold text-foreground text-sm">{step.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-primary scale-125' : i < currentStep ? 'bg-primary/40' : 'bg-muted-foreground/30'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="sm" onClick={prev} disabled={currentStep === 0} className="gap-1 text-xs">
            <ChevronLeft className="w-3 h-3" /> Back
          </Button>
          <button onClick={finish} className="text-xs text-muted-foreground hover:text-foreground underline">
            Skip tour
          </button>
          <Button size="sm" onClick={next} className="gap-1 text-xs">
            {currentStep === TOUR_STEPS.length - 1 ? (
              <>Done <Sparkles className="w-3 h-3" /></>
            ) : (
              <>Next <ChevronRight className="w-3 h-3" /></>
            )}
          </Button>
        </div>

        {/* Step counter */}
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </p>
      </div>
    </>
  );
};

export default OnboardingTour;
export { STORAGE_KEY as ONBOARDING_TOUR_STORAGE_KEY };
