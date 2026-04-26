import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCoachingLang } from "@/components/CoachingLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FeeStructureForm from "@/components/FeeStructureForm";

const CLAUSES = {
  en: [
    "1. Coaching Services: The Coach will provide the Participant with coaching sessions over the agreed time period.",
    "2. Fees: The Participant will pay the Coach the agreed amount for the coaching services. Fees are non-refundable.",
    "3. Confidentiality: Both parties agree to maintain the confidentiality of information disclosed during coaching sessions.",
    "4. Time Commitment: The Participant agrees to adhere to the scheduled times for coaching sessions. If the Participant fails to attend a session without providing notice, the session will be considered forfeited.",
    "5. Results: While the Coach will provide guidance and support, the Participant's success in achieving their goals depends on their active participation and implementation of coaching recommendations.",
    "6. No Medical Advice: The Coach is not a medical professional and cannot provide medical advice. The Coach will not recommend or advise the Participant to start or stop taking any medications. The Coach will focus on guiding the Participant through meditation and NLP techniques to support their overall well-being.",
    "7. One day workshop at hotel will be considered as 2 sessions.",
    "8. You can repeat hotel workshop by paying only venue charges.",
    "9. For legal or finance you have to take advice from CA or Advocate.",
  ],
  hi: [
    "1. कोचिंग सेवाएं: कोच निर्धारित समय अवधि में प्रतिभागी को कोचिंग सत्र प्रदान करेगा।",
    "2. शुल्क: प्रतिभागी कोचिंग सेवाओं के लिए कोच को सहमत राशि का भुगतान करेगा। शुल्क वापसी योग्य नहीं है।",
    "3. गोपनीयता: दोनों पक्ष कोचिंग सत्रों के दौरान साझा की गई जानकारी की गोपनीयता बनाए रखने के लिए सहमत हैं।",
    "4. समय प्रतिबद्धता: प्रतिभागी कोचिंग सत्रों के निर्धारित समय का पालन करेगा। बिना सूचना अनुपस्थित रहने पर सत्र जब्त माना जाएगा।",
    "5. परिणाम: कोच मार्गदर्शन और सहायता प्रदान करेगा, लेकिन प्रतिभागी की सफलता उनकी सक्रिय भागीदारी पर निर्भर करती है।",
    "6. कोई चिकित्सा सलाह नहीं: कोच चिकित्सा पेशेवर नहीं है। कोच ध्यान और NLP तकनीकों के माध्यम से मार्गदर्शन करेगा।",
    "7. होटल में एक दिन का कार्यशाला 2 सत्रों के रूप में माना जाएगा।",
    "8. आप केवल स्थल शुल्क देकर होटल कार्यशाला दोहरा सकते हैं।",
    "9. कानूनी या वित्तीय सलाह के लिए CA या अधिवक्ता से संपर्क करें।",
  ],
};

const COMMITMENTS = {
  en: [
    "Attending all scheduled classes and workshops",
    "Completing all assigned coursework and assignments on time",
    "Actively participating in class discussions and activities",
    "Seeking help from the instructor or classmates when needed",
    "Taking responsibility for my own learning and progress",
  ],
  hi: [
    "सभी निर्धारित कक्षाओं और कार्यशालाओं में उपस्थित रहना",
    "सभी सौंपे गए कार्य और असाइनमेंट समय पर पूरा करना",
    "कक्षा चर्चाओं और गतिविधियों में सक्रिय रूप से भाग लेना",
    "आवश्यकता पड़ने पर प्रशिक्षक या सहपाठियों से सहायता लेना",
    "अपनी स्वयं की शिक्षा और प्रगति की जिम्मेदारी लेना",
  ],
};

interface Client { id: string; name: string; }

export default function AgreementsPage() {
  const { lang } = useCoachingLang();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [checkedCommitments, setCheckedCommitments] = useState<boolean[]>([false, false, false, false, false]);

  const coachingForm = useForm({
    defaultValues: {
      clientId: "",
      coachName: "Coach Vivek Doba",
      numSessions: "",
      timePeriod: "",
      feesAmount: "",
      noticePeriod: "",
      coachSignature: "",
      participantSignature: "",
      signDate: new Date().toISOString().split("T")[0],
    },
  });

  const goalForm = useForm({
    defaultValues: {
      clientId: "",
      courseName: "",
      participantSignature: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from("clients").select("id, name");
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  const saveCoachingAgreement = async (data: any) => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { data: profile, error: profileErr } = await supabase
        .from("profiles").select("id").eq("user_id", userData.user.id).single();
      if (profileErr || !profile) throw new Error("Coach profile not found");

      const { error } = await supabase.from("agreements").insert({
        client_id: data.clientId,
        coach_id: profile.id,
        type: "coaching",
        fields_json: data,
        signed_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: lang === "en" ? "Agreement saved!" : "समझौता सहेजा गया!" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveGoalCommitment = async (data: any) => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { data: profile, error: profileErr } = await supabase
        .from("profiles").select("id").eq("user_id", userData.user.id).single();
      if (profileErr || !profile) throw new Error("Coach profile not found");

      const { error } = await supabase.from("agreements").insert({
        client_id: data.clientId,
        coach_id: profile.id,
        type: "goal",
        fields_json: { ...data, commitments: checkedCommitments },
        signed_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: lang === "en" ? "Commitment saved!" : "प्रतिबद्धता सहेजी गई!" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const ClientSelect = ({ form, name }: { form: any; name: string }) => (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">
        {lang === "en" ? "Participant Name" : "प्रतिभागी का नाम"}
      </Label>
      <Select onValueChange={(v) => form.setValue(name, v)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={lang === "en" ? "Select client" : "ग्राहक चुनें"} />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-foreground">
        {lang === "en" ? "Agreements" : "समझौते"}
      </h1>

      <Tabs defaultValue="coaching">
        <TabsList>
          <TabsTrigger value="coaching">{lang === "en" ? "Coaching Agreement" : "कोचिंग समझौता"}</TabsTrigger>
          <TabsTrigger value="goal">{lang === "en" ? "Goal Commitment" : "लक्ष्य प्रतिबद्धता"}</TabsTrigger>
        </TabsList>

        {/* ═══ COACHING AGREEMENT ═══ */}
        <TabsContent value="coaching">
          <form onSubmit={coachingForm.handleSubmit(saveCoachingAgreement)} className="bg-card rounded-xl border border-border p-6 space-y-5">
            <div className="text-center border-b border-border pb-4">
              <h2 className="text-lg font-bold">{lang === "en" ? "Coaching Agreement" : "कोचिंग समझौता"}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "Date" : "तारीख"}</Label>
                <Input type="date" {...coachingForm.register("signDate")} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "Coach Name" : "कोच का नाम"}</Label>
                <Input {...coachingForm.register("coachName")} className="h-9 text-sm" />
              </div>
              <ClientSelect form={coachingForm} name="clientId" />
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "Number of Sessions" : "सत्रों की संख्या"}</Label>
                <Input type="number" {...coachingForm.register("numSessions")} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "Time Period" : "समय अवधि"}</Label>
                <Input {...coachingForm.register("timePeriod")} placeholder={lang === "en" ? "e.g. 3 months" : "जैसे 3 महीने"} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "Fees Amount" : "शुल्क राशि"}</Label>
                <Input {...coachingForm.register("feesAmount")} className="h-9 text-sm" />
              </div>
            </div>

            {/* Clauses */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground">{lang === "en" ? "Terms & Conditions" : "नियम और शर्तें"}</h3>
              {CLAUSES[lang].map((clause, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-2 border-l-2 border-[#1D9E75]/30">
                  {clause}
                </p>
              ))}
            </div>

            {/* Fee Structure — second-to-last page (prints on its own page) */}
            {coachingForm.watch("clientId") && (
              <div className="pt-4 border-t border-border print:break-before-page">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {lang === "en" ? "Fee Structure (Onboarding)" : "फीस संरचना (ऑनबोर्डिंग)"}
                </h3>
                <FeeStructureForm
                  seekerId={coachingForm.watch("clientId")}
                  readOnly
                  lang={lang as "en" | "hi"}
                />
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "[Coach] By" : "[कोच] द्वारा"}</Label>
                <Input {...coachingForm.register("coachSignature")} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "[Participant] By" : "[प्रतिभागी] द्वारा"}</Label>
                <Input {...coachingForm.register("participantSignature")} className="h-9 text-sm" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => window.print()}>
                {lang === "en" ? "📄 Export PDF" : "📄 PDF निर्यात"}
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1D9E75] hover:bg-[#178A63] text-white">
                {saving ? "..." : lang === "en" ? "Save & Submit" : "सहेजें और जमा करें"}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ═══ GOAL COMMITMENT ═══ */}
        <TabsContent value="goal">
          <form onSubmit={goalForm.handleSubmit(saveGoalCommitment)} className="bg-card rounded-xl border border-border p-6 space-y-5">
            <div className="text-center border-b border-border pb-4">
              <h2 className="text-lg font-bold">{lang === "en" ? "Goal Commitment Form" : "लक्ष्य प्रतिबद्धता फॉर्म"}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClientSelect form={goalForm} name="clientId" />
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "Date" : "तारीख"}</Label>
                <Input type="date" {...goalForm.register("date")} className="h-9 text-sm" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "Course" : "कोर्स"}</Label>
                <Input {...goalForm.register("courseName")} className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <p className="text-sm text-foreground mb-3">
                {lang === "en"
                  ? 'Goal: To successfully complete the course, I commit to:'
                  : 'लक्ष्य: कोर्स सफलतापूर्वक पूरा करने के लिए, मैं प्रतिबद्ध हूं:'}
              </p>
              <div className="space-y-3">
                {COMMITMENTS[lang].map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Checkbox
                      checked={checkedCommitments[i]}
                      onCheckedChange={(checked) => {
                        const next = [...checkedCommitments];
                        next[i] = !!checked;
                        setCheckedCommitments(next);
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lang === "en"
                  ? "By signing below, I acknowledge that I have read and understood this commitment and agree to abide by it."
                  : "नीचे हस्ताक्षर करके, मैं स्वीकार करता/करती हूं कि मैंने इस प्रतिबद्धता को पढ़ और समझ लिया है और इसका पालन करने के लिए सहमत हूं।"}
              </p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">{lang === "en" ? "[Participant's Signature]" : "[प्रतिभागी के हस्ताक्षर]"}</Label>
              <Input {...goalForm.register("participantSignature")} className="h-9 text-sm" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => window.print()}>
                {lang === "en" ? "📄 Export PDF" : "📄 PDF निर्यात"}
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-[#1D9E75] hover:bg-[#178A63] text-white">
                {saving ? "..." : lang === "en" ? "Save & Submit" : "सहेजें और जमा करें"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
