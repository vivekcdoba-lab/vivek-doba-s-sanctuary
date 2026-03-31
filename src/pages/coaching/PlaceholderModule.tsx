import { useCoachingLang } from "@/components/CoachingLayout";
import { useLocation } from "react-router-dom";

const MODULE_NAMES: Record<string, { en: string; hi: string }> = {
  "/coaching/sessions": { en: "Session Notes", hi: "सत्र नोट्स" },
  "/coaching/planner": { en: "Daily Planner", hi: "दैनिक योजना" },
  "/coaching/homework": { en: "Homework Tracker", hi: "होमवर्क ट्रैकर" },
  "/coaching/progress": { en: "Progress Matrix", hi: "प्रगति मैट्रिक्स" },
};

export default function PlaceholderModule() {
  const { lang } = useCoachingLang();
  const location = useLocation();
  const name = MODULE_NAMES[location.pathname] || { en: "Module", hi: "मॉड्यूल" };

  return (
    <div className="max-w-4xl mx-auto">
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
