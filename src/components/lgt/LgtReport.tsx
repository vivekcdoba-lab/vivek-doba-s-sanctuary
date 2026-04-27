import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';

/**
 * Shared read-only "nice visualization" of an LGT application.
 * Reads from a flexible form_data object (may come from either
 * `lgt_applications.form_data` or legacy `submissions.form_data`).
 *
 * Rendered both in the SeekerDetailPage "LGT Application" tab and
 * captured by jsPDF (client-side) for email attachments.
 *
 * The container is given id="lgt-report-print" so the PDF helper can grab it.
 */

const WHEEL_DIMS = [
  'Career & Business', 'Finance & Wealth', 'Physical Health', 'Mental Peace',
  'Family Life', 'Marriage/Partnership', 'Friendships & Social',
  'Spiritual Growth', 'Fun & Recreation', 'Purpose & Meaning',
];

interface LgtReportProps {
  seekerName?: string | null;
  seekerEmail?: string | null;
  submittedAt?: string | null;
  filledByRole?: string | null;
  data: Record<string, any>;
}

const Pill = ({ children, color = 'primary' }: { children: any; color?: string }) => (
  <span
    className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium mr-1.5 mb-1"
    style={{
      background: color === 'primary' ? 'rgba(255,107,0,0.10)' : 'rgba(123,31,162,0.10)',
      color: color === 'primary' ? '#FF6B00' : '#7B1FA2',
    }}
  >
    {children}
  </span>
);

const Bar = ({ label, value, max = 10, color = '#FF6B00' }: { label: string; value: number; max?: number; color?: string }) => {
  const pct = Math.max(0, Math.min(100, (Number(value) || 0) / max * 100));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground font-semibold">{value || 0}/{max}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return (
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm text-muted-foreground/60 italic">— not provided —</div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground font-medium break-words">
        {Array.isArray(value) ? value.join(', ') : String(value)}
      </div>
    </div>
  );
};

const SectionCard = ({
  title, emoji, gradient, children,
}: { title: string; emoji: string; gradient: string; children: any }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm break-inside-avoid">
    <div className="px-5 py-3 text-white font-semibold text-sm flex items-center gap-2" style={{ background: gradient }}>
      <span className="text-lg">{emoji}</span> {title}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const LgtReport = ({ seekerName, seekerEmail, submittedAt, filledByRole, data }: LgtReportProps) => {
  const f = data || {};

  const wheelData = useMemo(() => {
    const scores: number[] = Array.isArray(f.wheelScores) ? f.wheelScores : [];
    return WHEEL_DIMS.map((dim, i) => ({
      dim: dim.length > 16 ? dim.slice(0, 14) + '…' : dim,
      score: Number(scores[i]) || 0,
      full: 10,
    }));
  }, [f.wheelScores]);

  const lgtScores = [
    { label: '🕉️ Dharma — Mental Peace', value: Number(f.mentalClarity) || 0, color: '#1B5E20' },
    { label: '💰 Artha — Career & Wealth', value: Math.round(((Number(f.healthRating) || 0) + (Number(f.energyLevel) || 0)) / 2) || 0, color: '#FFD700' },
    { label: '❤️ Kama — Relationships', value: Number(f.spouseRelRating) || 0, color: '#E91E63' },
    { label: '🪷 Moksha — Spiritual Growth', value: Number(f.socialSatisfaction) || 0, color: '#FF6B00' },
  ];

  return (
    <div id="lgt-report-print" className="space-y-5 bg-background p-4 sm:p-6 print:bg-white" style={{ color: '#1f2937' }}>
      {/* HEADER */}
      <div
        className="rounded-2xl p-6 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,#FFD700 0%,#FF6B00 50%,#7B1FA2 100%)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-90">Vivek Doba Training Solutions</div>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">👑 Life's Golden Triangle Report</h2>
            <p className="text-sm opacity-90 mt-1">
              Personal Mastery · Professional Excellence · Spiritual Wellbeing
            </p>
          </div>
          <div className="text-right text-xs sm:text-sm bg-white/15 rounded-xl px-4 py-3 backdrop-blur">
            <div className="font-semibold text-base">{seekerName || f.fullName || 'Seeker'}</div>
            <div className="opacity-90">{seekerEmail || f.email || ''}</div>
            {submittedAt && (
              <div className="opacity-80 mt-1">📅 {new Date(submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            )}
            {filledByRole && (
              <div className="opacity-80">📝 Filled by {filledByRole}</div>
            )}
          </div>
        </div>
        {f.programName && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-medium">
            🎯 Program: {f.programName}
          </div>
        )}
      </div>

      {/* AT-A-GLANCE SCORES */}
      <SectionCard title="At a Glance — Life's Golden Triangle" emoji="🎯" gradient="linear-gradient(135deg,#7B1FA2,#FF6B00)">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {lgtScores.map(s => <Bar key={s.label} label={s.label} value={s.value} color={s.color} />)}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={wheelData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar name="Wheel of Life" dataKey="score" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      {/* PERSONAL */}
      <SectionCard title="A · Personal Information" emoji="👤" gradient="linear-gradient(135deg,#1B5E20,#43A047)">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Full Name" value={f.fullName} />
          <Field label="Preferred Name" value={f.preferredName} />
          <Field label="Date of Birth" value={f.dob} />
          <Field label="Gender" value={f.gender} />
          <Field label="Marital Status" value={f.maritalStatus} />
          <Field label="Children" value={f.children} />
          <Field label="Blood Group" value={f.bloodGroup} />
          <Field label="Mobile" value={f.mobile ? `${f.mobileCode || ''} ${f.mobile}` : ''} />
          <Field label="Email" value={f.email} />
          <Field label="City" value={f.city} />
          <Field label="State" value={f.state || f.stateOther} />
          <Field label="Country" value={f.country} />
          <Field label="Pincode" value={f.pincode} />
          <Field label="Hometown" value={f.hometown} />
          <Field label="Emergency Contact" value={f.emergName ? `${f.emergName} (${f.emergRelation || f.emergRelOther || ''}) — ${f.emergPhoneCode || ''} ${f.emergPhone || ''}` : ''} />
        </div>
      </SectionCard>

      {/* PROFESSIONAL */}
      <SectionCard title="B · Professional Profile" emoji="💼" gradient="linear-gradient(135deg,#FFB300,#FF6B00)">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Designation" value={f.designation} />
          <Field label="Company" value={f.company} />
          <Field label="Industry" value={f.industry} />
          <Field label="Nature of Business" value={f.businessNature} />
          <Field label="Years in Business" value={f.yearsInBiz} />
          <Field label="Total Experience" value={f.totalExp} />
          <Field label="Annual Revenue" value={f.annualRevenue} />
          <Field label="Personal Income" value={f.personalIncome} />
          <Field label="Monthly Investment Capacity" value={f.monthlyInvest} />
          <Field label="Team Size" value={f.teamSize} />
          <Field label="Manages People" value={f.managesPeople} />
          <Field label="Direct Reports" value={f.directReports} />
          <Field label="Has Business Partner" value={f.hasPartner} />
          <Field label="Partner Name" value={f.partnerName} />
          <Field label="Website" value={f.website} />
        </div>
      </SectionCard>

      {/* HEALTH */}
      <SectionCard title="C · Health & Lifestyle" emoji="🌿" gradient="linear-gradient(135deg,#43A047,#1B5E20)">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Bar label="Overall Health Rating" value={Number(f.healthRating) || 0} />
            <Bar label="Sleep Quality" value={Number(f.sleepQuality) || 0} />
            <Bar label="Energy Level" value={Number(f.energyLevel) || 0} />
          </div>
          <div className="space-y-3">
            <Field label="Chronic Conditions" value={f.chronicConditions === 'yes' ? f.chronicDetails : 'None'} />
            <Field label="Mental Health" value={f.mentalHealth === 'none' ? 'None' : (f.mentalOther || f.mentalHealth)} />
            <Field label="Medications" value={f.medications} />
            <Field label="Exercise" value={`${f.exerciseFreq || ''} ${Array.isArray(f.exerciseTypes) && f.exerciseTypes.length ? '— ' + f.exerciseTypes.join(', ') : ''}`.trim()} />
            <Field label="Sleep Hours" value={f.sleepHours} />
            <Field label="Diet" value={f.diet} />
            <Field label="Alcohol / Tobacco" value={`${f.alcohol || '—'} / ${f.tobacco || '—'}`} />
            <Field label="Health Goal" value={f.healthGoal} />
          </div>
        </div>
      </SectionCard>

      {/* RELATIONSHIPS */}
      <SectionCard title="D · Relationships" emoji="❤️" gradient="linear-gradient(135deg,#E91E63,#7B1FA2)">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Bar label="Spouse / Partner" value={Number(f.spouseRelRating) || 0} color="#E91E63" />
            <Bar label="Parents" value={Number(f.parentRelRating) || 0} color="#E91E63" />
            <Bar label="Children" value={Number(f.childRelRating) || 0} color="#E91E63" />
            <Bar label="Siblings" value={Number(f.siblingRelRating) || 0} color="#E91E63" />
            <Bar label="Colleagues" value={Number(f.colleagueRelRating) || 0} color="#E91E63" />
            <Bar label="Social Satisfaction" value={Number(f.socialSatisfaction) || 0} color="#E91E63" />
          </div>
          <div className="space-y-3">
            <Field label="Spouse Support" value={f.spouseSupport} />
            <Field label="Relationship Challenge" value={f.relChallenge} />
            <Field label="Parent Details" value={f.parentDetails} />
            <Field label="Concerns about children" value={f.childConcerns} />
            <Field label="Workplace Conflicts" value={f.colleagueConflicts} />
            <Field label="Close Friends" value={f.closeFriends} />
            <Field label="Loneliness" value={f.loneliness} />
            <Field label="Relationship Goal" value={f.relGoal} />
          </div>
        </div>
      </SectionCard>

      {/* MIND & EMOTION */}
      <SectionCard title="E · Mind & Emotional Wellbeing" emoji="🧘" gradient="linear-gradient(135deg,#5E35B1,#1A237E)">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Bar label="Mental Clarity" value={Number(f.mentalClarity) || 0} color="#5E35B1" />
            <Bar label="Stress Level" value={Number(f.stressLevel) || 0} color="#5E35B1" />
            <Bar label="Anxiety Level" value={Number(f.anxietyLevel) || 0} color="#5E35B1" />
            <Bar label="Self Confidence" value={Number(f.selfConfidence) || 0} color="#5E35B1" />
            <Bar label="Emotional Stability" value={Number(f.emotionalStability) || 0} color="#5E35B1" />
            <Bar label="Decision Making" value={Number(f.decisionMaking) || 0} color="#5E35B1" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Frequent Emotions</div>
              <div>
                {Array.isArray(f.frequentEmotions) && f.frequentEmotions.length > 0
                  ? f.frequentEmotions.map((e: string) => <Pill key={e}>{e}</Pill>)
                  : <span className="text-sm text-muted-foreground/60 italic">— not provided —</span>}
              </div>
            </div>
            <Field label="Pressure Handling" value={f.pressureHandling} />
            <Field label="Biggest Fear" value={f.biggestFear} />
            <Field label="Biggest Regret" value={f.biggestRegret} />
            <Field label="Meditation Practice" value={f.meditationPractice} />
            <Field label="Therapy History" value={f.therapyHistory} />
          </div>
        </div>
      </SectionCard>

      {/* SPIRITUAL */}
      <SectionCard title="F · Spiritual & Values" emoji="🪷" gradient="linear-gradient(135deg,#FFB300,#FF6B00)">
        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Core Values</div>
            <div>
              {Array.isArray(f.coreValues) && f.coreValues.length > 0
                ? f.coreValues.map((v: string) => <Pill key={v} color="secondary">{v}</Pill>)
                : <span className="text-sm text-muted-foreground/60 italic">— not provided —</span>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Spiritual Practices</div>
              <div>
                {Array.isArray(f.spiritualPractices) && f.spiritualPractices.length > 0
                  ? f.spiritualPractices.map((v: string) => <Pill key={v}>{v}</Pill>)
                  : <span className="text-sm text-muted-foreground/60 italic">— not provided —</span>}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Sacred Texts Read</div>
              <div>
                {Array.isArray(f.textsRead) && f.textsRead.length > 0
                  ? f.textsRead.map((v: string) => <Pill key={v}>{v}</Pill>)
                  : <span className="text-sm text-muted-foreground/60 italic">— not provided —</span>}
              </div>
            </div>
          </div>
          <Field label="Life Purpose" value={f.lifePurpose} />
          <Field label="Belief in Astrology" value={f.astrology} />
        </div>
      </SectionCard>

      {/* PERSONALITY */}
      <SectionCard title="G · Personality" emoji="🎭" gradient="linear-gradient(135deg,#0288D1,#1A237E)">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ['Introvert ↔ Extrovert', f.introExtro],
            ['Logic ↔ Emotion', f.logicEmotion],
            ['Planner ↔ Spontaneous', f.planSpontan],
            ['Leader ↔ Follower', f.leadFollow],
            ['Patient ↔ Impatient', f.patientImpatient],
            ['Optimist ↔ Pessimist', f.optimistPessimist],
            ['Risk Taker', f.riskTaker],
            ['Morning ↔ Night', f.morningNight],
          ].map(([label, val]) => (
            <Bar key={label as string} label={label as string} value={Number(val) || 0} max={9} color="#0288D1" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Field label="Friends describe me as" value={f.friendDescribe} />
          <Field label="Critics say I am" value={f.criticDescribe} />
          <Field label="Communication Style" value={f.commStyle} />
        </div>
      </SectionCard>

      {/* CHALLENGES & GOALS */}
      <SectionCard title="H · Challenges & Goals" emoji="🎯" gradient="linear-gradient(135deg,#D32F2F,#7B1FA2)">
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="rounded-lg border border-border p-3 bg-muted/20">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Challenge #{n} {f[`cat${n}`] ? `· ${f[`cat${n}`]}` : ''}</div>
                <div className="text-sm text-foreground mt-1">{f[`challenge${n}`] || <span className="italic text-muted-foreground/60">— not provided —</span>}</div>
              </div>
            ))}
          </div>
          <Field label="Long-term Issues" value={f.longTermIssues} />
          <Field label="Tried Before?" value={f.triedBefore === 'yes' ? f.triedDetails : 'No'} />
          <Field label="Biggest Obstacle" value={f.biggestObstacle} />
          <Field label="Limiting Beliefs" value={f.limitingBeliefs} />
          <Field label="Expectations from Vivek Sir" value={f.expectations} />

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <Field label="🎯 Business Goal" value={f.goalBiz} />
            <Field label="💰 Financial Goal" value={f.goalFinance} />
            <Field label="🌿 Health Goal" value={f.goalHealth} />
            <Field label="❤️ Relationship Goal" value={f.goalRelation} />
            <Field label="🧘 Personal Goal" value={f.goalPersonal} />
            <Field label="🪷 Spiritual Goal" value={f.goalSpiritual} />
          </div>
          <Field label="Definition of Success" value={f.successDef} />
          <Field label="Definition of Failure" value={f.failureDef} />
          <Field label="Hours per week to commit" value={f.hoursPerWeek} />
        </div>
      </SectionCard>

      {/* COMMITMENTS */}
      <SectionCard title="I · Commitments" emoji="🤝" gradient="linear-gradient(135deg,#1B5E20,#FFD700)">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            ['sessions', 'Attend all sessions'],
            ['dailyTracking', 'Daily worksheet tracking'],
            ['feedback', 'Honest feedback'],
            ['investment', 'Honor investment commitments'],
            ['meditation', 'Daily meditation practice'],
            ['confidential', 'Maintain confidentiality'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
              <span className="text-base">{f.commitments?.[key as string] ? '✅' : '⬜'}</span>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Anything else Vivek Sir should know" value={f.anythingElse} />
        </div>
      </SectionCard>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Generated by VDTS · vivekdoba.com · This report is confidential and meant for the seeker and Vivek Sir only.
      </div>
    </div>
  );
};

export default LgtReport;
