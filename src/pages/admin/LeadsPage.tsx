import { useState } from 'react';
import { LEADS, COURSES } from '@/data/mockData';
import { Plus, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import type { LeadStage } from '@/types';

const stages: { key: LeadStage; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'bg-sky-blue' },
  { key: 'contacted', label: 'Contacted', color: 'bg-chakra-indigo' },
  { key: 'discovery', label: 'Discovery', color: 'bg-wisdom-purple' },
  { key: 'proposal', label: 'Proposal', color: 'bg-saffron' },
  { key: 'negotiating', label: 'Negotiating', color: 'bg-warning-amber' },
  { key: 'converted', label: 'Converted', color: 'bg-dharma-green' },
  { key: 'lost', label: 'Lost', color: 'bg-destructive' },
];

const priorityColors = { hot: 'bg-destructive', warm: 'bg-warning-amber', cold: 'bg-sky-blue' };

const LeadsPage = () => {
  const [leads] = useState(LEADS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">{leads.length} leads in pipeline</p>
        </div>
        <button className="gradient-chakravartin text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          return (
            <div key={stage.key} className="min-w-[260px] flex-shrink-0">
              <div className={`${stage.color} text-primary-foreground px-3 py-2 rounded-t-xl flex items-center justify-between`}>
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
              </div>
              <div className="bg-muted/30 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                {stageLeads.map((lead) => {
                  const course = COURSES.find((c) => c.id === lead.interested_course_id);
                  return (
                    <div key={lead.id} className="bg-card rounded-xl p-3 shadow-sm border border-border card-hover cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground">{lead.name}</h4>
                        <div className={`w-2 h-2 rounded-full ${priorityColors[lead.priority]}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{lead.phone}</p>
                      {course && <p className="text-xs text-primary truncate">{course.name}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">{lead.days_in_pipeline}d in pipeline</span>
                        <span className="text-[10px] text-muted-foreground">{lead.source}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsPage;
