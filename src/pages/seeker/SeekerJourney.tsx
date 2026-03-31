import { useState } from 'react';
import { SEEKERS } from '@/data/mockData';
import { JOURNEY_STAGES } from '@/types';
import type { JourneyStage } from '@/types';

const milestones = [
  { label: 'Enrolled in LGT Program', date: '15/09/2024', status: 'done', icon: '🎯' },
  { label: 'Welcome Call Completed', date: '16/09/2024', status: 'done', icon: '📞' },
  { label: 'Initial SWOT Assessment', date: '20/09/2024', status: 'done', icon: '📋' },
  { label: 'Wheel of Life Baseline', date: '22/09/2024', status: 'done', icon: '📊' },
  { label: 'Module 1 — Self-Discovery', date: 'Oct 2024', status: 'done', icon: '🌟' },
  { label: 'Module 2 — Values & Purpose', date: 'Nov 2024', status: 'done', icon: '🕉️' },
  { label: 'Module 3 — Business Alignment', date: 'Jan 2025', status: 'current', icon: '💼' },
  { label: 'Module 4 — Leadership', date: 'Apr 2025', status: 'upcoming', icon: '👑' },
  { label: 'Module 5 — Communication', date: 'May 2025', status: 'upcoming', icon: '🗣️' },
  { label: 'Module 6 — Mastery & Completion', date: 'Jul 2025', status: 'upcoming', icon: '🏆' },
  { label: 'Certificate of Transformation', date: 'Jul 2025', status: 'upcoming', icon: '📜' },
];

const breakthroughs = [
  { text: 'First time admitted fear of failure in Session 5', date: '10/11/2024' },
  { text: "Connected father's work ethic to own burnout pattern", date: '15/12/2024' },
  { text: 'Set boundaries with a difficult client for the first time', date: '24/03/2025' },
];

const visionBoard = [
  { area: '💼 Career', vision: "India's leading spiritual business coach by 2030" },
  { area: '👨‍👩‍👧 Family', vision: 'Quality time every Sunday, no-phone dinner rule' },
  { area: '❤️ Health', vision: 'Run a half-marathon, daily yoga practice' },
  { area: '💰 Wealth', vision: '₹1 Cr annual revenue, 6 months emergency fund' },
  { area: '🕉️ Spiritual', vision: 'Daily 20-min meditation, 2 retreats per year' },
  { area: '🌱 Personal', vision: 'Read 50 books, learn Sanskrit, travel to 5 countries' },
];

const SeekerJourney = () => {
  const seeker = SEEKERS[0];
  const currentStage: JourneyStage = seeker.journey_stage || 'tapasya';
  const currentStageIndex = JOURNEY_STAGES.findIndex(j => j.key === currentStage);

  // Identity data
  const identity = {
    old: seeker.identity_old || {
      story: "I'm a hard-working but burnt-out businessman who can't delegate",
      beliefs: ["Nobody can do it like me", "Rest is lazy", "Money = worth"],
      habits: ["Working 16hr days", "Skipping health", "Avoiding family"],
      results: "₹50L revenue but no peace, strained marriage, health issues",
    },
    new: seeker.identity_new || {
      story: "I am a conscious leader who builds through teams and lives with purpose",
      beliefs: ["Delegation is growth", "Rest is productive", "I am enough"],
      habits: ["Morning meditation", "Delegating daily", "Family dinner every night"],
      results: "₹80L revenue, team handling 70% work, sleeping 7 hours, family vacations",
    },
    progress: seeker.transformation_progress || 45,
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground">My Journey</h1>

      {/* Journey Stage Progress */}
      <div className="bg-card rounded-xl p-5 border-2 border-primary/20 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">🧭 Transformation Path</h3>
        
        {/* Stage Dots */}
        <div className="flex items-center justify-between mb-4 px-2">
          {JOURNEY_STAGES.map((stage, i) => (
            <div key={stage.key} className="flex flex-col items-center relative">
              {i > 0 && (
                <div className={`absolute right-full top-3 w-full h-0.5 ${i <= currentStageIndex ? 'bg-primary' : 'bg-border'}`} style={{ width: '100%', transform: 'translateX(50%)' }} />
              )}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs z-10 ${
                i < currentStageIndex ? 'bg-primary text-primary-foreground' :
                i === currentStageIndex ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < currentStageIndex ? '✓' : stage.emoji}
              </div>
              <p className={`text-[8px] mt-1 text-center ${i === currentStageIndex ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {stage.name}
              </p>
            </div>
          ))}
        </div>

        {/* Current Stage Detail */}
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <p className="text-xs text-primary font-semibold">
            {JOURNEY_STAGES[currentStageIndex]?.emoji} YOU ARE HERE: {JOURNEY_STAGES[currentStageIndex]?.name} ({JOURNEY_STAGES[currentStageIndex]?.sanskrit})
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">"{JOURNEY_STAGES[currentStageIndex]?.metaphor}"</p>
          <p className="text-[10px] text-muted-foreground mt-1">{JOURNEY_STAGES[currentStageIndex]?.description}</p>
        </div>
      </div>

      {/* Identity Transformation Card */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 text-center">🔄 Who I Was → Who I'm Becoming</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Old Identity */}
          <div className="bg-muted/50 rounded-lg p-3 border border-border opacity-70">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">OLD STORY</p>
            <p className="text-xs text-foreground italic mb-2">"{identity.old.story}"</p>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">OLD BELIEFS</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {identity.old.beliefs.map(b => (
                <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{b}</span>
              ))}
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">OLD HABITS</p>
            <div className="flex flex-wrap gap-1">
              {identity.old.habits.map(h => (
                <span key={h} className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{h}</span>
              ))}
            </div>
          </div>

          {/* New Identity */}
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="text-[10px] font-semibold text-primary mb-1">NEW STORY</p>
            <p className="text-xs text-foreground italic mb-2">"{identity.new.story}"</p>
            <p className="text-[10px] font-semibold text-primary mb-1">NEW BELIEFS</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {identity.new.beliefs.map(b => (
                <span key={b} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{b}</span>
              ))}
            </div>
            <p className="text-[10px] font-semibold text-primary mb-1">NEW HABITS</p>
            <div className="flex flex-wrap gap-1">
              {identity.new.habits.map(h => (
                <span key={h} className="text-[9px] px-1.5 py-0.5 rounded bg-dharma-green/10 text-dharma-green">{h}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Transformation Progress */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Transformation Progress</p>
          <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-muted-foreground to-primary transition-all" style={{ width: `${identity.progress}%` }} />
          </div>
          <p className="text-lg font-bold text-primary mt-1">{identity.progress}%</p>
        </div>
      </div>

      {/* Transformation Snapshot */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Transformation Snapshot</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-xs text-muted-foreground">Where I Started</p>
            <p className="text-2xl font-bold text-destructive">45%</p>
            <p className="text-[10px] text-muted-foreground">Overall Score</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-dharma-green/5 border border-dharma-green/20">
            <p className="text-xs text-muted-foreground">Where I Am Now</p>
            <p className="text-2xl font-bold text-dharma-green">72%</p>
            <p className="text-[10px] text-muted-foreground">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Module Progress</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          {milestones.map((m, i) => (
            <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 flex-shrink-0 ${
                m.status === 'done' ? 'bg-dharma-green text-primary-foreground' :
                m.status === 'current' ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse' :
                'bg-muted text-muted-foreground'
              }`}>{m.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${m.status === 'done' ? 'text-foreground' : m.status === 'current' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.date}</p>
              </div>
              {m.status === 'done' && <span className="text-dharma-green text-xs">✅</span>}
              {m.status === 'current' && <span className="text-primary text-xs">🔵 Current</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Key Breakthroughs */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">✨ Key Breakthroughs</h3>
        <div className="space-y-2">
          {breakthroughs.map((b, i) => (
            <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground">{b.text}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{b.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vision Board */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">🎯 Digital Vision Board</h3>
        <div className="grid grid-cols-2 gap-2">
          {visionBoard.map(v => (
            <div key={v.area} className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-semibold text-foreground">{v.area}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{v.vision}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="bg-card rounded-xl p-6 border-2 border-primary/20 shadow-sm text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificate of Transformation</p>
        <div className="mt-3 p-4 border border-dashed border-primary/30 rounded-lg">
          <span className="text-4xl">🔒</span>
          <p className="text-sm text-muted-foreground mt-2">Complete all 6 modules to unlock your certificate</p>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div className="bg-primary h-2 rounded-full" style={{ width: '33%' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">2 of 6 modules completed (33%)</p>
        </div>
      </div>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Vivek Doba Training Solutions</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🙏 for seekers of transformation</p>
      </footer>
    </div>
  );
};

export default SeekerJourney;
