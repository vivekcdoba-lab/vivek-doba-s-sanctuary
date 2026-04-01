import { useCoachingLang } from "@/components/CoachingLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MODULE_NAMES: Record<string, { en: string; hi: string }> = {
  "/coaching/sessions": { en: "Session Notes", hi: "सत्र नोट्स" },
  "/coaching/planner": { en: "Daily Planner", hi: "दैनिक योजना" },
  "/coaching/homework": { en: "Homework Tracker", hi: "होमवर्क ट्रैकर" },
  "/coaching/progress": { en: "Progress Matrix", hi: "प्रगति मैट्रिक्स" },
};

export default function PlaceholderModule() {
  const { lang } = useCoachingLang();
  const location = useLocation();
  const navigate = useNavigate();
  const name = MODULE_NAMES[location.pathname] || { en: "Module", hi: "मॉड्यूल" };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {lang === "en" ? "Back" : "वापस"}
      </button>
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">{name[lang]}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "en"
            ? "This module will be built in the next phase. Stay tuned!"
            : "यह मॉड्यूल अगले चरण में बनाया जाएगा। बने रहें!"}
        </p>
      </div>
    </div>
  );
}
