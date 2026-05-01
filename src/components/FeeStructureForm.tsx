import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { addDays, addMonths, addWeeks, format as fmtDate, parseISO } from 'date-fns';
import {
  FeeStructureFields,
  defaultFeeStructure,
  useFeeStructure,
  useUpsertFeeStructure,
} from '@/hooks/useFeeStructure';
import { useAllDbCourses } from '@/hooks/useDbCourses';

interface Props {
  seekerId: string;
  readOnly?: boolean;
  lang?: 'en' | 'hi';
  onSaved?: () => void;
}

const L = {
  header: { en: 'ITEM', hi: 'विवरण' },
  amount: { en: 'AMOUNT', hi: 'राशि' },
  rows: [
    { key: 'feePerSession', en: 'Fee per session', hi: 'प्रति सेशन फीस' },
    { key: 'numSessions', en: 'Number of sessions', hi: 'सेशन की संख्या', suffix: { en: 'sessions', hi: 'सेशन' } },
    { key: 'coachingDuration', en: 'Coaching duration', hi: 'कोचिंग की अवधि' },
    { key: 'handHoldingSupport', en: 'Hand-holding support', hi: 'हैंड-होल्डिंग सपोर्ट' },
    { key: 'totalProgramDuration', en: 'Total program duration', hi: 'कुल प्रोग्राम अवधि' },
    { key: 'startDate', en: 'Start date', hi: 'प्रारंभ तिथि', type: 'date' },
    { key: 'endDate', en: 'End date', hi: 'समाप्ति तिथि', type: 'date' },
    { key: 'totalFeesExclGst', en: 'Total fees (excl. GST)', hi: 'कुल फीस (GST के बिना)', type: 'inr', auto: true },
    { key: 'gstAmount', en: 'GST @ 18%', hi: 'GST @ 18%', type: 'inr', auto: true },
    { key: 'totalInvestment', en: 'TOTAL INVESTMENT (incl. GST)', hi: 'कुल निवेश (GST सहित)', type: 'inr', auto: true, highlight: true },
    { key: 'paymentPlan', en: 'Payment plan', hi: 'भुगतान योजना', type: 'paymentPlan' },
    { key: 'installmentSchedule', en: 'If installments — schedule', hi: 'यदि किश्तें — अनुसूची', type: 'textarea' },
    { key: 'modeOfPayment', en: 'Mode of payment', hi: 'भुगतान का माध्यम', type: 'mode' },
    { key: 'amountPaidToday', en: 'Amount paid today', hi: 'आज भुगतान की गई राशि', type: 'inr' },
    { key: 'balanceDue', en: 'Balance due', hi: 'शेष देय राशि', type: 'inr', auto: true },
    { key: 'invoice', en: 'Invoice', hi: 'इनवॉइस', static: true, value: { en: 'GST invoice issued for every payment', hi: 'हर भुगतान के लिए GST चालान जारी किया जाता है' } },
  ] as const,
};

const parseFee = (s: string): number => {
  const m = s.match(/[\d,]+/);
  return m ? Number(m[0].replace(/,/g, '')) : 0;
};

export default function FeeStructureForm({ seekerId, readOnly, lang = 'en', onSaved }: Props) {
  const { data: existing, isLoading } = useFeeStructure(seekerId);
  const { data: allCourses = [] } = useAllDbCourses();
  const upsert = useUpsertFeeStructure();
  const [f, setF] = useState<FeeStructureFields>(defaultFeeStructure);

  useEffect(() => {
    if (existing?.fields_json) {
      setF({ ...defaultFeeStructure, ...(existing.fields_json as any) });
    }
  }, [existing]);

  const primaryCourse = useMemo(
    () => allCourses.find(c => c.id === f.primary_course_id) || null,
    [allCourses, f.primary_course_id]
  );
  const bundledCourses = useMemo(
    () => allCourses.filter(c => (f.bundled_course_ids || []).includes(c.id)),
    [allCourses, f.bundled_course_ids]
  );

  // Auto-calculations (now respect GST toggle + discount + bundled course sessions)
  const computed = useMemo(() => {
    const perSession = parseFee(f.feePerSession);
    const sessions = Number(f.numSessions) || 0;
    const subtotal = perSession * sessions;
    const discount = Math.max(0, Number(f.discount_amount) || 0);
    const taxableBase = Math.max(0, subtotal - discount);
    const gstRate = f.include_gst === false ? 0 : Number(f.gst_rate ?? 18);
    const gst = Math.round((taxableBase * gstRate) / 100);
    const total = taxableBase + gst;
    const paid = Number(f.amountPaidToday) || 0;
    const balance = total - paid;
    const bundledSessionTotal = bundledCourses.reduce((sum, c: any) => {
      const m = String(c.duration || '').match(/(\d+)\s*sessions?/i);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);
    const totalSessions = sessions + bundledSessionTotal;
    const bundledValue = bundledCourses.reduce((s, c: any) => s + Number(c.price || 0), 0);
    return { subtotal, gst, total, balance, totalSessions, bundledValue, gstRate };
  }, [f.feePerSession, f.numSessions, f.amountPaidToday, f.include_gst, f.gst_rate, f.discount_amount, bundledCourses]);

  useEffect(() => {
    setF(prev => ({
      ...prev,
      totalFeesExclGst: computed.subtotal || '',
      gstAmount: computed.gst || '',
      totalInvestment: computed.total || '',
      balanceDue: computed.total ? computed.balance : '',
      subtotal_amount: computed.subtotal,
      total_sessions: computed.totalSessions,
    }));
  }, [computed.subtotal, computed.gst, computed.total, computed.balance, computed.totalSessions]);

  // Auto-compute end date from start_date + coachingDuration ("X months" / "X weeks" / "X days")
  useEffect(() => {
    if (!f.startDate || !f.coachingDuration) return;
    const m = f.coachingDuration.match(/(\d+)\s*(month|week|day)/i);
    if (!m) return;
    try {
      const n = Number(m[1]);
      const unit = m[2].toLowerCase();
      const start = parseISO(f.startDate);
      const end = unit.startsWith('month') ? addMonths(start, n)
        : unit.startsWith('week') ? addWeeks(start, n)
        : addDays(start, n);
      const iso = fmtDate(addDays(end, -1), 'yyyy-MM-dd');
      setF(prev => prev.endDate === iso ? prev : { ...prev, endDate: iso });
    } catch { /* ignore */ }
  }, [f.startDate, f.coachingDuration]);

  const set = <K extends keyof FeeStructureFields>(k: K, v: FeeStructureFields[K]) =>
    setF(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ seekerId, fields: f, existingId: existing?.id });
      toast.success(lang === 'en' ? 'Fee structure saved' : 'फीस संरचना सहेजी गई');
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    }
  };

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  const inr = (n: number | '') => (n === '' || n === 0 ? '' : `₹${Number(n).toLocaleString('en-IN')}`);
  const inrLabel = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const toggleBundled = (id: string) => {
    const cur = f.bundled_course_ids || [];
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    set('bundled_course_ids', next as any);
  };

  const handlePrimaryChange = (id: string) => {
    const c = allCourses.find(x => x.id === id);
    if (!c) { set('primary_course_id', null as any); return; }
    setF(prev => ({
      ...prev,
      primary_course_id: id,
      // Auto-fill if user hasn't customised yet
      coachingDuration: prev.coachingDuration || c.duration || '6 months',
    }));
  };

  return (
    <div className="space-y-4">
      {/* === NEW: Course Bundling, GST Toggle, Discount === */}
      <div className="border border-[#1e3a5f]/30 rounded-lg p-4 bg-[#fafbfd] space-y-4">
        <h3 className="font-semibold text-[#1e3a5f] text-sm">Course Selection &amp; Pricing Rules</h3>

        <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
          <Label className="pt-2 text-sm">Primary Course *</Label>
          <select
            disabled={readOnly}
            value={f.primary_course_id || ''}
            onChange={e => handlePrimaryChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm w-full"
          >
            <option value="">— Select primary course —</option>
            {allCourses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.tier ? `(${c.tier})` : ''} — ₹{Number(c.price).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
          <Label className="pt-2 text-sm">Bundled Courses (Free)</Label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {allCourses.filter(c => c.id !== f.primary_course_id).map(c => {
                const checked = (f.bundled_course_ids || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleBundled(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      checked
                        ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                        : 'bg-white text-foreground border-input hover:border-[#1D9E75]'
                    }`}
                  >
                    {checked ? '✓ ' : '+ '}{c.name}
                  </button>
                );
              })}
            </div>
            {bundledCourses.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Included free — no charge added. Combined value:{' '}
                <span className="font-semibold text-[#1D9E75]">{inrLabel(computed.bundledValue)}</span> (saved for the seeker).
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-center">
          <Label className="text-sm">Include GST?</Label>
          <div className="flex flex-wrap gap-4 text-sm items-center">
            {[{ v: true, l: 'Yes (add GST)' }, { v: false, l: 'No (exclude GST)' }].map(opt => (
              <label key={String(opt.v)} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={(f.include_gst ?? true) === opt.v}
                  onChange={() => set('include_gst', opt.v as any)}
                  disabled={readOnly}
                />
                {opt.l}
              </label>
            ))}
            {(f.include_gst ?? true) && (
              <div className="flex items-center gap-1 text-xs">
                <span>Rate %</span>
                <Input
                  type="number"
                  value={f.gst_rate ?? 18}
                  onChange={e => set('gst_rate', Number(e.target.value) as any)}
                  disabled={readOnly}
                  className="h-7 w-16"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-center">
          <Label className="text-sm">Discount (₹)</Label>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              type="number"
              placeholder="0"
              value={f.discount_amount as any}
              onChange={e => set('discount_amount', e.target.value === '' ? '' : Number(e.target.value) as any)}
              disabled={readOnly}
              className="h-9 w-32"
            />
            <Input
              placeholder="Reason (optional) — e.g. early-bird, scholarship"
              value={f.discount_reason || ''}
              onChange={e => set('discount_reason', e.target.value)}
              disabled={readOnly}
              className="h-9 flex-1"
            />
          </div>
        </div>

        <div className="rounded-md bg-white border border-[#1e3a5f]/20 p-3 text-xs space-y-1">
          <div className="flex justify-between"><span>Subtotal (sessions × fee)</span><span>{inrLabel(computed.subtotal)}</span></div>
          {Number(f.discount_amount) > 0 && (
            <div className="flex justify-between text-[#b91c1c]"><span>Discount</span><span>− {inrLabel(Number(f.discount_amount))}</span></div>
          )}
          <div className="flex justify-between">
            <span>GST {computed.gstRate ? `@ ${computed.gstRate}%` : '(excluded)'}</span>
            <span>{inrLabel(computed.gst)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#1e3a5f] pt-1 border-t">
            <span>Total Investment</span><span>{inrLabel(computed.total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total sessions (incl. bundled)</span>
            <span>{computed.totalSessions}</span>
          </div>
          {f.startDate && f.endDate && (
            <div className="flex justify-between text-muted-foreground">
              <span>Coaching window</span>
              <span>{f.startDate} → {f.endDate}</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-2 border-[#1e3a5f] rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr] bg-[#1e3a5f] text-white font-bold text-sm">
          <div className="px-4 py-3 border-r border-white/20">
            {L.header.en} / {L.header.hi}
          </div>
          <div className="px-4 py-3">{L.amount.en} / {L.amount.hi}</div>
        </div>

        {L.rows.map((row, idx) => {
          const isHighlight = (row as any).highlight;
          const bg = isHighlight ? 'bg-[#fce8b2]' : idx % 2 === 0 ? 'bg-[#f3f6fb]' : 'bg-white';
          return (
            <div
              key={row.key}
              className={`grid grid-cols-[1fr_2fr] text-sm border-t border-[#1e3a5f]/20 ${bg}`}
            >
              <div className={`px-4 py-3 border-r border-[#1e3a5f]/20 ${isHighlight ? 'font-bold text-[#1e3a5f]' : 'text-foreground'}`}>
                <div>{row.en}</div>
                <div className="text-muted-foreground text-xs">{row.hi}</div>
              </div>
              <div className="px-4 py-2 flex items-center gap-2">
                {(row as any).static ? (
                  <span className="text-foreground">{(row as any).value[lang]}</span>
                ) : row.key === 'feePerSession' ? (
                  <Input
                    value={f.feePerSession}
                    onChange={e => set('feePerSession', e.target.value)}
                    disabled={readOnly}
                    className="h-9 bg-white"
                  />
                ) : row.key === 'numSessions' ? (
                  <>
                    <Input
                      type="number"
                      value={f.numSessions}
                      onChange={e => set('numSessions', e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={readOnly}
                      className="h-9 w-32 bg-white"
                    />
                    <span className="text-muted-foreground text-xs">sessions / सेशन</span>
                  </>
                ) : row.key === 'coachingDuration' || row.key === 'handHoldingSupport' || row.key === 'totalProgramDuration' ? (
                  <Input
                    value={f[row.key as keyof FeeStructureFields] as string}
                    onChange={e => set(row.key as any, e.target.value)}
                    disabled={readOnly}
                    className="h-9 bg-white"
                  />
                ) : (row as any).type === 'date' ? (
                  <Input
                    type="date"
                    value={f[row.key as keyof FeeStructureFields] as string}
                    onChange={e => set(row.key as any, e.target.value)}
                    disabled={readOnly}
                    className="h-9 bg-white"
                  />
                ) : (row as any).auto ? (
                  <span className={`${isHighlight ? 'font-bold text-lg text-[#1e3a5f]' : 'font-semibold text-foreground'}`}>
                    {inr(f[row.key as keyof FeeStructureFields] as number) || '—'}
                  </span>
                ) : (row as any).type === 'inr' ? (
                  <Input
                    type="number"
                    value={f[row.key as keyof FeeStructureFields] as number}
                    onChange={e => set(row.key as any, e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={readOnly}
                    placeholder="INR"
                    className="h-9 bg-white"
                  />
                ) : (row as any).type === 'paymentPlan' ? (
                  <div className="flex gap-3 text-xs">
                    {(['full', 'installments'] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={f.paymentPlan === opt}
                          onChange={() => set('paymentPlan', opt)}
                          disabled={readOnly}
                        />
                        {opt === 'full' ? 'Full advance / पूर्ण अग्रिम' : 'Installments / किश्तें'}
                      </label>
                    ))}
                  </div>
                ) : (row as any).type === 'mode' ? (
                  <div className="flex gap-4 flex-wrap text-xs">
                    {([
                      { en: 'Bank', hi: 'बैंक' },
                      { en: 'UPI', hi: 'यूपीआई' },
                      { en: 'Cheque', hi: 'चेक' },
                      { en: 'Cash', hi: 'नकद' },
                    ] as const).map(opt => {
                      const current: string[] = Array.isArray(f.modeOfPayment)
                        ? f.modeOfPayment
                        : f.modeOfPayment ? [f.modeOfPayment as unknown as string] : [];
                      const checked = current.includes(opt.en);
                      return (
                        <label key={opt.en} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? current.filter(v => v !== opt.en)
                                : [...current, opt.en];
                              set('modeOfPayment', next as any);
                            }}
                            disabled={readOnly}
                          />
                          <span>{opt.en} / {opt.hi}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (row as any).type === 'textarea' ? (
                  <Textarea
                    value={f.installmentSchedule}
                    onChange={e => set('installmentSchedule', e.target.value)}
                    disabled={readOnly || f.paymentPlan !== 'installments'}
                    placeholder={f.paymentPlan === 'installments' ? 'e.g. 50% on start, 25% in month 3, 25% in month 6' : '(only if installments)'}
                    rows={2}
                    className="bg-white text-xs"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button onClick={handleSave} disabled={upsert.isPending} className="bg-[#1D9E75] hover:bg-[#178A63] text-white">
            {upsert.isPending ? 'Saving…' : existing ? 'Update Fee Structure' : 'Save Fee Structure'}
          </Button>
        </div>
      )}
    </div>
  );
}
