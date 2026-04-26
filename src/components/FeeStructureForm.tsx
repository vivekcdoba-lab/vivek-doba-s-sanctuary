import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  FeeStructureFields,
  defaultFeeStructure,
  useFeeStructure,
  useUpsertFeeStructure,
} from '@/hooks/useFeeStructure';

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
  const upsert = useUpsertFeeStructure();
  const [f, setF] = useState<FeeStructureFields>(defaultFeeStructure);

  useEffect(() => {
    if (existing?.fields_json) {
      setF({ ...defaultFeeStructure, ...(existing.fields_json as any) });
    }
  }, [existing]);

  // Auto-calculations
  const computed = useMemo(() => {
    const perSession = parseFee(f.feePerSession);
    const sessions = Number(f.numSessions) || 0;
    const totalExcl = perSession * sessions;
    const gst = Math.round(totalExcl * 0.18);
    const total = totalExcl + gst;
    const paid = Number(f.amountPaidToday) || 0;
    const balance = total - paid;
    return { totalExcl, gst, total, balance };
  }, [f.feePerSession, f.numSessions, f.amountPaidToday]);

  useEffect(() => {
    setF(prev => ({
      ...prev,
      totalFeesExclGst: computed.totalExcl || '',
      gstAmount: computed.gst || '',
      totalInvestment: computed.total || '',
      balanceDue: computed.total ? computed.balance : '',
    }));
  }, [computed.totalExcl, computed.gst, computed.total, computed.balance]);

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

  return (
    <div className="space-y-4">
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
                  <div className="flex gap-3 flex-wrap text-xs">
                    {(['Bank', 'UPI', 'Cheque', 'Cash'] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={f.modeOfPayment === opt}
                          onChange={() => set('modeOfPayment', opt)}
                          disabled={readOnly}
                        />
                        {opt}
                      </label>
                    ))}
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
