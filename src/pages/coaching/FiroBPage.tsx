import { useState, useEffect } from "react";
import { useCoachingLang } from "@/components/CoachingLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FIROBAssessment from "@/components/FIROBAssessment";

interface Client {
  id: string;
  name: string;
}

export default function FiroBPage() {
  const { lang } = useCoachingLang();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from("clients").select("id, name");
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  const handleSave = async (scores: Record<string, number>) => {
    if (!selectedClient) {
      toast({
        title: lang === "en" ? "Please select a client first" : "कृपया पहले एक ग्राहक चुनें",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("assessments").insert({
        client_id: selectedClient,
        coach_id: userData.user.id,
        scores_json: scores,
        language: lang,
        taken_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast({ title: lang === "en" ? "FIRO-B results saved!" : "FIRO-B परिणाम सहेजे गए!" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-foreground">
        {lang === "en" ? "FIRO-B Assessment" : "FIRO-B मूल्यांकन"}
      </h1>

      {/* Client selector */}
      <div className="bg-card rounded-xl border border-border p-4">
        <Label className="text-xs text-muted-foreground mb-2 block">
          {lang === "en" ? "Link to Client" : "ग्राहक से जोड़ें"}
        </Label>
        <Select onValueChange={setSelectedClient} value={selectedClient}>
          <SelectTrigger className="h-9 text-sm max-w-sm">
            <SelectValue placeholder={lang === "en" ? "Select a client..." : "ग्राहक चुनें..."} />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {clients.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {lang === "en"
              ? "No clients yet. Add one via Client Intake first."
              : "अभी कोई ग्राहक नहीं। पहले ग्राहक प्रवेश से जोड़ें।"}
          </p>
        )}
      </div>

      {/* FIRO-B Test */}
      <FIROBAssessment
        onClose={() => {}}
        onSave={handleSave}
      />
    </div>
  );
}
