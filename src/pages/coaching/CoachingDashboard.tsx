import { useCoachingLang } from "@/components/CoachingLayout";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export default function CoachingDashboard() {
  const { lang } = useCoachingLang();
  const navigate = useNavigate();

  const cards = [
    { label: { en: "Total Clients", hi: "कुल ग्राहक" }, value: "0", icon: "👥" },
    { label: { en: "Sessions This Month", hi: "इस महीने के सत्र" }, value: "0", icon: "📅" },
    { label: { en: "Pending Reviews", hi: "लंबित समीक्षा" }, value: "0", icon: "📋" },
    { label: { en: "Next Session", hi: "अगला सत्र" }, value: "—", icon: "⏰" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {lang === "en" ? "Dashboard" : "डैशबोर्ड"}
        </h1>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Home className="w-4 h-4" /> {lang === "en" ? "Back to Dashboard" : "डैशबोर्ड पर वापस"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{c.icon}</span>
              <span className="text-xs text-muted-foreground">{c.label[lang]}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {lang === "en" ? "Client List" : "ग्राहक सूची"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "en"
            ? "Add your first client using the Client Intake module to get started."
            : "शुरू करने के लिए ग्राहक प्रवेश मॉड्यूल से अपना पहला ग्राहक जोड़ें।"}
        </p>
      </div>
    </div>
  );
}
