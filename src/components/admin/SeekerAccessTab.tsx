import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Save, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  SEEKER_MODULE_REGISTRY,
  ALL_SEEKER_MODULES,
} from '@/config/seekerModules';
import {
  useSeekerModuleAccess,
  useUpdateSeekerModuleAccess,
} from '@/hooks/useSeekerModuleAccess';

interface Props { seekerId: string }

export default function SeekerAccessTab({ seekerId }: Props) {
  const { data: accessMap, isLoading } = useSeekerModuleAccess(seekerId);
  const update = useUpdateSeekerModuleAccess(seekerId);

  // Local working state
  const [working, setWorking] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!accessMap) return;
    const next: Record<string, boolean> = {};
    ALL_SEEKER_MODULES.forEach(m => {
      next[m.key] = m.alwaysOn ? true : (accessMap[m.key] === true);
    });
    setWorking(next);
    setDirty(false);
  }, [accessMap]);

  const sections = useMemo(() => {
    const map: Record<string, typeof SEEKER_MODULE_REGISTRY> = {};
    SEEKER_MODULE_REGISTRY.forEach(g => {
      (map[g.section] = map[g.section] || []).push(g);
    });
    return map;
  }, []);

  const toggleModule = (key: string, val: boolean) => {
    setWorking(prev => ({ ...prev, [key]: val }));
    setDirty(true);
  };
  const toggleGroup = (groupModules: { key: string; alwaysOn?: boolean }[], val: boolean) => {
    setWorking(prev => {
      const next = { ...prev };
      groupModules.forEach(m => { if (!m.alwaysOn) next[m.key] = val; });
      return next;
    });
    setDirty(true);
  };
  const setAll = (val: boolean) => {
    setWorking(prev => {
      const next = { ...prev };
      ALL_SEEKER_MODULES.forEach(m => { if (!m.alwaysOn) next[m.key] = val; });
      return next;
    });
    setDirty(true);
  };
  const expandAll = (open: boolean) => {
    const next: Record<string, boolean> = {};
    SEEKER_MODULE_REGISTRY.forEach(g => { next[g.group] = !open; });
    setCollapsed(next);
  };

  const handleSave = () => {
    const entries = ALL_SEEKER_MODULES
      .filter(m => !m.alwaysOn)
      .map(m => ({ module_key: m.key, is_enabled: !!working[m.key] }));
    update.mutate(entries, {
      onSuccess: () => { toast.success('Access permissions saved'); setDirty(false); },
      onError: (e: any) => toast.error(e?.message || 'Failed to save permissions'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading access settings…
      </div>
    );
  }

  const totalGated = ALL_SEEKER_MODULES.filter(m => !m.alwaysOn).length;
  const enabledCount = ALL_SEEKER_MODULES.filter(m => !m.alwaysOn && working[m.key]).length;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              🔐 Module Access Control
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose exactly which pages this seeker can see and use. Disabled items are hidden from the menu and blocked on direct URL access. New seekers default to <strong>everything disabled</strong> — admin enables modules as the seeker progresses.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>{enabledCount}</strong> of {totalGated} modules enabled.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setAll(true)}>Enable All</Button>
            <Button size="sm" variant="outline" onClick={() => setAll(false)}>Disable All</Button>
            <Button size="sm" variant="outline" onClick={() => expandAll(true)}>Expand All</Button>
            <Button size="sm" variant="outline" onClick={() => expandAll(false)}>Collapse All</Button>
            <Button size="sm" onClick={handleSave} disabled={!dirty || update.isPending} className="bg-[#FF6B00] hover:bg-[#e85f00] text-white">
              {update.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      </div>

      {Object.entries(sections).map(([sectionName, groups]) => (
        <div key={sectionName} className="space-y-2">
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-px bg-border" />
            <span className="uppercase text-[11px] tracking-[0.18em] text-muted-foreground font-semibold">
              {sectionName}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {groups.map(group => {
            const isOpen = !collapsed[group.group];
            const enabledInGroup = group.modules.filter(m => working[m.key]).length;
            const total = group.modules.length;
            const allOn = group.modules.every(m => m.alwaysOn || working[m.key]);
            const noneOn = group.modules.every(m => m.alwaysOn || !working[m.key]);
            return (
              <div key={group.group} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCollapsed(p => ({ ...p, [group.group]: !p[group.group] }))}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-base">{group.emoji}</span>
                  <span className="font-medium text-sm text-foreground flex-1">{group.group}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {enabledInGroup}/{total}
                  </Badge>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); toggleGroup(group.modules, !allOn); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleGroup(group.modules, !allOn); } }}
                    className="text-[11px] text-[#FF6B00] hover:underline px-2 py-1 rounded cursor-pointer"
                  >
                    {allOn ? 'Disable group' : noneOn ? 'Enable group' : 'Enable all'}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-border divide-y divide-border">
                    {group.modules.map(m => (
                      <label
                        key={m.key}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          checked={!!working[m.key]}
                          disabled={!!m.alwaysOn}
                          onCheckedChange={(v) => toggleModule(m.key, v === true)}
                        />
                        <span className="text-sm text-foreground flex-1">{m.label}</span>
                        {m.alwaysOn ? (
                          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Always available
                          </Badge>
                        ) : working[m.key] ? (
                          <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Enabled</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            <Lock className="w-3 h-3 mr-1" /> Disabled
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="sticky bottom-2 flex justify-end pt-2">
        <Button onClick={handleSave} disabled={!dirty || update.isPending} className="bg-[#FF6B00] hover:bg-[#e85f00] text-white shadow-lg">
          {update.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Save Permissions
        </Button>
      </div>
    </div>
  );
}
