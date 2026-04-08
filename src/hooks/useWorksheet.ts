import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPillarForActivity, type PillarKey } from '@/data/worksheetData';

export interface TimeSlotData {
  activity: string;
  customActivity: string;
  pillar: PillarKey | '';
  energy: string;
  notes: string;
  actualStatus: string;
  skipReason: string;
}

export interface FinancialEntry {
  id?: string;
  source: string;
  amount: string;
  category: string;
}

export interface PriorityItem {
  task: string;
  pillar: string;
  done: boolean;
}

export interface WorksheetState {
  worksheetId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  // Section 1
  intention: string;
  morningMood: string;
  clarity: number[];
  energy: number[];
  peace: number[];
  // Section 2
  timeSlots: Record<string, TimeSlotData>;
  // Section 4 — MIT Priorities
  priorities: PriorityItem[];
  // Section 5
  incomeEntries: FinancialEntry[];
  expenseEntries: FinancialEntry[];
  // Section 6
  waterGlasses: number;
  stepsTaken: string;
  sleepHours: string;
  sleepQuality: string;
  bodyWeight: string;
  supplementsTaken: boolean;
  workoutDone: boolean;
  workoutType: string;
  workoutDuration: string;
  screenTime: string;
  endEnergyLevel: number[];
  // Section 7
  wins: string[];
  ahaMoment: string;
  // Section 8
  eveningMood: string;
  evMentalPeace: number[];
  evEmotionalSat: number[];
  evFulfillment: number[];
  whatWentWell: string;
  whatLearned: string;
  doDifferently: string;
  gratitudes: string[];
  dharmaScore: number[];
  arthaScore: number[];
  kamaScore: number[];
  mokshaScore: number[];
  tomorrowSankalp: string;
  tomorrowPrep: Record<number, boolean>;
  // Non-negotiables
  nonNegotiables: Record<number, boolean>;
}

const DEFAULT_STATE: Omit<WorksheetState, 'worksheetId' | 'isLoading' | 'isSaving' | 'lastSaved'> = {
  intention: '',
  morningMood: '',
  clarity: [5],
  energy: [5],
  peace: [5],
  timeSlots: {},
  priorities: [{ task: '', pillar: '', done: false }, { task: '', pillar: '', done: false }, { task: '', pillar: '', done: false }],
  incomeEntries: [{ source: '', amount: '', category: '' }],
  expenseEntries: [{ source: '', amount: '', category: '' }],
  waterGlasses: 0,
  stepsTaken: '',
  sleepHours: '',
  sleepQuality: '',
  bodyWeight: '',
  supplementsTaken: false,
  workoutDone: false,
  workoutType: '',
  workoutDuration: '',
  screenTime: '',
  endEnergyLevel: [5],
  wins: [''],
  ahaMoment: '',
  eveningMood: '',
  evMentalPeace: [5],
  evEmotionalSat: [5],
  evFulfillment: [5],
  whatWentWell: '',
  whatLearned: '',
  doDifferently: '',
  gratitudes: ['', '', ''],
  dharmaScore: [5],
  arthaScore: [5],
  kamaScore: [5],
  mokshaScore: [5],
  tomorrowSankalp: '',
  tomorrowPrep: {},
  nonNegotiables: {},
};

export function useWorksheet(selectedDate: Date) {
  const [state, setState] = useState<WorksheetState>({
    ...DEFAULT_STATE,
    worksheetId: null,
    isLoading: true,
    isSaving: false,
    lastSaved: null,
  });
  const [seekerProfileId, setSeekerProfileId] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Get current user's profile id
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setSeekerProfileId(data.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    getProfile();
  }, []);

  // Load worksheet when date or profile changes
  useEffect(() => {
    if (!seekerProfileId) return;
    loadWorksheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, seekerProfileId]);

  const loadWorksheet = useCallback(async () => {
    if (!seekerProfileId) return;
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Load or create worksheet
      const { data: ws } = await supabase
        .from('daily_worksheets')
        .select('*')
        .eq('seeker_id', seekerProfileId)
        .eq('worksheet_date', dateKey)
        .maybeSingle();

      if (!ws) {
        setState(prev => ({
          ...prev,
          ...DEFAULT_STATE,
          worksheetId: null,
          isLoading: false,
        }));
        dirtyRef.current = false;
        return;
      }

      // Load time slots
      const { data: slots } = await supabase
        .from('daily_time_slots')
        .select('*')
        .eq('worksheet_id', ws.id);

      const timeSlotsMap: Record<string, TimeSlotData> = {};
      slots?.forEach(s => {
        timeSlotsMap[s.slot_start_time.slice(0, 5)] = {
          activity: s.activity_name || '',
          customActivity: s.modified_activity_name || '',
          pillar: (s.lgt_pillar as PillarKey) || '',
          energy: s.energy_level || '',
          notes: s.notes || '',
          actualStatus: s.actual_status || '',
          skipReason: s.skip_reason || '',
        };
      });

      // Load financial entries
      const { data: financials } = await supabase
        .from('daily_financial_log')
        .select('*')
        .eq('worksheet_id', ws.id);

      const incomeEntries: FinancialEntry[] = financials
        ?.filter(f => f.entry_type === 'income')
        .map(f => ({ id: f.id, source: f.source_description || '', amount: f.amount_inr?.toString() || '', category: f.category || '' })) || [];
      const expenseEntries: FinancialEntry[] = financials
        ?.filter(f => f.entry_type === 'expense')
        .map(f => ({ id: f.id, source: f.source_description || '', amount: f.amount_inr?.toString() || '', category: f.category || '' })) || [];

      setState(prev => ({
        ...prev,
        worksheetId: ws.id,
        isLoading: false,
        intention: ws.morning_intention || '',
        morningMood: ws.morning_mood || '',
        clarity: [ws.morning_clarity_score || 5],
        energy: [ws.morning_energy_score || 5],
        peace: [ws.morning_peace_score || 5],
        timeSlots: timeSlotsMap,
        incomeEntries: incomeEntries.length ? incomeEntries : [{ source: '', amount: '', category: '' }],
        expenseEntries: expenseEntries.length ? expenseEntries : [{ source: '', amount: '', category: '' }],
        waterGlasses: ws.water_intake_glasses || 0,
        stepsTaken: ws.steps_taken?.toString() || '',
        sleepHours: ws.sleep_hours?.toString() || '',
        sleepQuality: ws.sleep_quality || '',
        bodyWeight: ws.body_weight_kg?.toString() || '',
        supplementsTaken: ws.supplements_taken || false,
        workoutDone: ws.workout_done || false,
        workoutType: ws.workout_type || '',
        workoutDuration: ws.workout_duration_minutes?.toString() || '',
        screenTime: ws.screen_time_hours?.toString() || '',
        endEnergyLevel: [ws.end_energy_level || 5],
        wins: [ws.todays_win_1 || '', ws.todays_win_2 || '', ws.todays_win_3 || ''].filter((w, i) => i === 0 || w),
        ahaMoment: ws.aha_moment || '',
        eveningMood: ws.evening_mood || '',
        evMentalPeace: [ws.evening_mental_peace || 5],
        evEmotionalSat: [ws.evening_emotional_satisfaction || 5],
        evFulfillment: [ws.evening_fulfillment || 5],
        whatWentWell: ws.what_went_well || '',
        whatLearned: ws.what_i_learned || '',
        doDifferently: ws.do_differently || '',
        gratitudes: [ws.gratitude_1 || '', ws.gratitude_2 || '', ws.gratitude_3 || '', ws.gratitude_4 || '', ws.gratitude_5 || ''].filter((g, i) => i < 3 || g),
        dharmaScore: [ws.dharma_score || 5],
        arthaScore: [ws.artha_score || 5],
        kamaScore: [ws.kama_score || 5],
        mokshaScore: [ws.moksha_score || 5],
        tomorrowSankalp: ws.tomorrow_sankalp || '',
        tomorrowPrep: {},
        nonNegotiables: {},
      }));
      dirtyRef.current = false;
    } catch (err) {
      console.error('Error loading worksheet:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [seekerProfileId, dateKey]);

  // Update a single field
  const updateField = useCallback(<K extends keyof WorksheetState>(key: K, value: WorksheetState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
    dirtyRef.current = true;
  }, []);

  // Update time slot
  const updateSlot = useCallback((slotKey: string, field: keyof TimeSlotData, value: string) => {
    setState(prev => {
      const current = prev.timeSlots[slotKey] || { activity: '', customActivity: '', pillar: '', energy: '', notes: '', actualStatus: '', skipReason: '' };
      const updated = { ...current, [field]: value };
      if (field === 'activity' && value) {
        const autoPillar = getPillarForActivity(value);
        if (autoPillar) updated.pillar = autoPillar;
      }
      return { ...prev, timeSlots: { ...prev.timeSlots, [slotKey]: updated } };
    });
    dirtyRef.current = true;
  }, []);

  // Save worksheet
  const saveWorksheet = useCallback(async (submit = false) => {
    if (!seekerProfileId) {
      toast.error('Please log in to save worksheets');
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const morningReadiness = ((state.clarity[0] + state.energy[0] + state.peace[0]) / 3);
      const eveningScore = ((state.evMentalPeace[0] + state.evEmotionalSat[0] + state.evFulfillment[0]) / 3);
      const lgtBalance = ((state.dharmaScore[0] + state.arthaScore[0] + state.kamaScore[0] + state.mokshaScore[0]) / 4);
      const tomorrowPrepDone = Object.values(state.tomorrowPrep).filter(Boolean).length;

      const worksheetData = {
        seeker_id: seekerProfileId,
        worksheet_date: dateKey,
        morning_intention: state.intention || null,
        morning_mood: state.morningMood || null,
        morning_clarity_score: state.clarity[0],
        morning_energy_score: state.energy[0],
        morning_peace_score: state.peace[0],
        morning_readiness_score: morningReadiness,
        water_intake_glasses: state.waterGlasses,
        steps_taken: state.stepsTaken ? parseInt(state.stepsTaken) : null,
        sleep_hours: state.sleepHours ? parseFloat(state.sleepHours) : null,
        sleep_quality: state.sleepQuality || null,
        body_weight_kg: state.bodyWeight ? parseFloat(state.bodyWeight) : null,
        supplements_taken: state.supplementsTaken,
        workout_done: state.workoutDone,
        workout_type: state.workoutType || null,
        workout_duration_minutes: state.workoutDuration ? parseInt(state.workoutDuration) : null,
        screen_time_hours: state.screenTime ? parseFloat(state.screenTime) : null,
        end_energy_level: state.endEnergyLevel[0],
        todays_win_1: state.wins[0] || null,
        todays_win_2: state.wins[1] || null,
        todays_win_3: state.wins[2] || null,
        aha_moment: state.ahaMoment || null,
        evening_mood: state.eveningMood || null,
        evening_mental_peace: state.evMentalPeace[0],
        evening_emotional_satisfaction: state.evEmotionalSat[0],
        evening_fulfillment: state.evFulfillment[0],
        evening_fulfillment_score: eveningScore,
        what_went_well: state.whatWentWell || null,
        what_i_learned: state.whatLearned || null,
        do_differently: state.doDifferently || null,
        gratitude_1: state.gratitudes[0] || null,
        gratitude_2: state.gratitudes[1] || null,
        gratitude_3: state.gratitudes[2] || null,
        gratitude_4: state.gratitudes[3] || null,
        gratitude_5: state.gratitudes[4] || null,
        dharma_score: state.dharmaScore[0],
        artha_score: state.arthaScore[0],
        kama_score: state.kamaScore[0],
        moksha_score: state.mokshaScore[0],
        lgt_balance_score: lgtBalance,
        tomorrow_sankalp: state.tomorrowSankalp || null,
        tomorrow_prep_score: tomorrowPrepDone,
        is_submitted: submit,
        is_draft: !submit,
      };

      let worksheetId = state.worksheetId;

      if (worksheetId) {
        await supabase
          .from('daily_worksheets')
          .update(worksheetData)
          .eq('id', worksheetId);
      } else {
        const { data: newWs, error } = await supabase
          .from('daily_worksheets')
          .insert(worksheetData)
          .select('id')
          .single();
        if (error) throw error;
        worksheetId = newWs.id;
        setState(prev => ({ ...prev, worksheetId }));
      }

      // Save time slots — delete old, insert new
      await supabase.from('daily_time_slots').delete().eq('worksheet_id', worksheetId!);
      const slotRows = Object.entries(state.timeSlots)
        .filter(([, d]) => d.activity)
        .map(([startTime, d]) => {
          const [h, m] = startTime.split(':').map(Number);
          const endM = m === 0 ? 30 : 0;
          const endH = m === 0 ? h : (h + 1) % 24;
          const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
          return {
            worksheet_id: worksheetId!,
            slot_start_time: startTime,
            slot_end_time: endTime,
            activity_name: d.activity,
            modified_activity_name: d.customActivity || null,
            lgt_pillar: d.pillar || null,
            energy_level: d.energy || null,
            notes: d.notes || null,
            actual_status: d.actualStatus || null,
            skip_reason: d.skipReason || null,
            is_planned: true,
            is_completed: d.actualStatus === 'done',
          };
        });
      if (slotRows.length) {
        await supabase.from('daily_time_slots').insert(slotRows);
      }

      // Save financial entries — delete old, insert new
      await supabase.from('daily_financial_log').delete().eq('worksheet_id', worksheetId!);
      const finRows = [
        ...state.incomeEntries.filter(e => e.source || e.amount).map(e => ({
          worksheet_id: worksheetId!,
          entry_type: 'income' as const,
          source_description: e.source || null,
          amount_inr: e.amount ? parseFloat(e.amount) : null,
          category: e.category || null,
        })),
        ...state.expenseEntries.filter(e => e.source || e.amount).map(e => ({
          worksheet_id: worksheetId!,
          entry_type: 'expense' as const,
          source_description: e.source || null,
          amount_inr: e.amount ? parseFloat(e.amount) : null,
          category: e.category || null,
        })),
      ];
      if (finRows.length) {
        await supabase.from('daily_financial_log').insert(finRows);
      }

      dirtyRef.current = false;
      setState(prev => ({ ...prev, isSaving: false, lastSaved: new Date() }));

      if (submit) {
        toast.success('✅ Worksheet submitted for the day!');
      }
    } catch (err) {
      console.error('Error saving worksheet:', err);
      setState(prev => ({ ...prev, isSaving: false }));
      toast.error('Failed to save worksheet');
    }
  }, [seekerProfileId, dateKey, state]);

  // Auto-save every 2 minutes
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      if (dirtyRef.current && seekerProfileId) {
        saveWorksheet(false);
        toast.info('Auto-saved 💾', { duration: 1500 });
      }
    }, 2 * 60 * 1000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [saveWorksheet, seekerProfileId]);

  // Copy yesterday
  const copyYesterday = useCallback(async () => {
    if (!seekerProfileId) return;
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = format(yesterday, 'yyyy-MM-dd');

    const { data: yWs } = await supabase
      .from('daily_worksheets')
      .select('id')
      .eq('seeker_id', seekerProfileId)
      .eq('worksheet_date', yKey)
      .maybeSingle();

    if (!yWs) {
      toast.error('No worksheet found for yesterday');
      return;
    }

    const { data: ySlots } = await supabase
      .from('daily_time_slots')
      .select('*')
      .eq('worksheet_id', yWs.id);

    if (ySlots?.length) {
      const copied: Record<string, TimeSlotData> = {};
      ySlots.forEach(s => {
      copied[s.slot_start_time.slice(0, 5)] = {
          activity: s.activity_name || '',
          customActivity: s.modified_activity_name || '',
          pillar: (s.lgt_pillar as PillarKey) || '',
          energy: s.energy_level || '',
          notes: '',
          actualStatus: '',
          skipReason: '',
        };
      });
      setState(prev => ({ ...prev, timeSlots: copied }));
      dirtyRef.current = true;
      toast.success('Yesterday\'s schedule copied!');
    } else {
      toast.info('Yesterday had no time slots to copy');
    }
  }, [seekerProfileId, selectedDate]);

  // Bulk fill multiple time slots with the same activity
  const bulkFillSlots = useCallback((fromTime: string, toTime: string, activity: string, customActivity: string, pillar: PillarKey | '') => {
    setState(prev => {
      const newSlots = { ...prev.timeSlots };
      // Generate all slot keys between fromTime and toTime
      const fromH = parseInt(fromTime.split(':')[0]);
      const fromM = parseInt(fromTime.split(':')[1]);
      const toH = parseInt(toTime.split(':')[0]);
      const toM = parseInt(toTime.split(':')[1]);

      // Convert to minutes from 3 AM base for ordering
      const toMinutes = (h: number, m: number) => {
        const adjusted = h < 3 ? h + 24 : h;
        return adjusted * 60 + m;
      };

      const startMin = toMinutes(fromH, fromM);
      const endMin = toMinutes(toH, toM);

      for (let min = startMin; min < endMin; min += 30) {
        const actualMin = min % (24 * 60);
        const h = Math.floor(actualMin / 60) % 24;
        const m = actualMin % 60;
        const key = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        newSlots[key] = {
          activity,
          customActivity: customActivity || '',
          pillar,
          energy: '',
          notes: '',
          actualStatus: '',
          skipReason: '',
        };
      }

      return { ...prev, timeSlots: newSlots };
    });
    dirtyRef.current = true;
  }, []);

  return {
    state,
    updateField,
    updateSlot,
    bulkFillSlots,
    saveWorksheet,
    copyYesterday,
    seekerProfileId,
  };
}
