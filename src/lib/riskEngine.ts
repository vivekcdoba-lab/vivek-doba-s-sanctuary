import { SeekerWithDetails, RiskLevel } from '@/types';

export function calculateRiskScore(seeker: SeekerWithDetails): { score: number; level: RiskLevel; factors: string[] } {
  const factors: string[] = [];

  // SESSION RISK (30%)
  let sessionRisk = 0;
  const daysSinceSession = seeker.last_session_date
    ? Math.floor((Date.now() - new Date(seeker.last_session_date).getTime()) / 86400000)
    : 999;
  if (daysSinceSession > 21) { sessionRisk += 100; factors.push(`No session in ${daysSinceSession} days`); }
  else if (daysSinceSession > 14) { sessionRisk += 60; factors.push(`Last session ${daysSinceSession} days ago`); }
  else if (daysSinceSession > 7) { sessionRisk += 30; }

  // ENGAGEMENT RISK (25%)
  let engagementRisk = 0;
  if (seeker.overdue_assignments >= 3) { engagementRisk = 100; factors.push(`${seeker.overdue_assignments} overdue assignments`); }
  else if (seeker.overdue_assignments >= 2) { engagementRisk = 60; factors.push(`${seeker.overdue_assignments} overdue assignments`); }
  else if (seeker.overdue_assignments >= 1) { engagementRisk = 30; }

  // TRACKING RISK (20%)
  let trackingRisk = 0;
  if (seeker.streak === 0) { trackingRisk = 100; factors.push('No active streak'); }
  else if (seeker.streak < 3) { trackingRisk = 50; }
  else if (seeker.streak < 7) { trackingRisk = 20; }

  const daysSinceLog = seeker.last_log_date
    ? Math.floor((Date.now() - new Date(seeker.last_log_date).getTime()) / 86400000)
    : 999;
  if (daysSinceLog > 7) { trackingRisk = Math.max(trackingRisk, 100); factors.push(`No daily log in ${daysSinceLog} days`); }
  else if (daysSinceLog > 3) { trackingRisk = Math.max(trackingRisk, 60); }

  // PATTERN RISK (15%)
  let patternRisk = 0;
  if (seeker.growth_score < 40) { patternRisk = 80; factors.push('Low growth score'); }
  else if (seeker.growth_score < 55) { patternRisk = 40; }

  // PAYMENT RISK (10%)
  let paymentRisk = 0;
  if (seeker.enrollment?.payment_status === 'overdue') { paymentRisk = 80; factors.push('Payment overdue'); }
  else if (seeker.enrollment?.payment_status === 'pending') { paymentRisk = 40; }

  const score = Math.round(
    sessionRisk * 0.3 + engagementRisk * 0.25 + trackingRisk * 0.2 + patternRisk * 0.15 + paymentRisk * 0.1
  );

  let level: RiskLevel = 'low';
  if (score > 75) level = 'critical';
  else if (score > 50) level = 'high';
  else if (score > 25) level = 'medium';

  return { score, level, factors };
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'bg-dharma-green/10 text-dharma-green';
    case 'medium': return 'bg-warning-amber/10 text-warning-amber';
    case 'high': return 'bg-destructive/10 text-destructive';
    case 'critical': return 'bg-foreground/10 text-foreground';
  }
}

export function getRiskEmoji(level: RiskLevel): string {
  switch (level) {
    case 'low': return '🟢';
    case 'medium': return '🟡';
    case 'high': return '🔴';
    case 'critical': return '⚫';
  }
}
