import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCoachingLang } from "@/components/CoachingLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { encryptField } from "@/lib/encryption";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LABELS: Record<string, { en: string; hi: string }> = {
  title: { en: "Detailed Personal History", hi: "विस्तृत व्यक्तिगत इतिहास" },
  subtitle: { en: "To search cause or effect", hi: "कारण या प्रभाव खोजने के लिए" },
  name: { en: "Name", hi: "नाम" },
  hobbies: { en: "Hobbies", hi: "शौक" },
  movies: { en: "Movies (fav)", hi: "पसंदीदा फिल्में" },
  book: { en: "Book (fav)", hi: "पसंदीदा पुस्तक" },
  interest: { en: "Interest", hi: "रुचि" },
  suggestedBy: { en: "Suggested By", hi: "किसने सुझाया" },
  socialMedia: { en: "Social Media Presence", hi: "सोशल मीडिया" },
  yearlyIncome: { en: "Yearly Income", hi: "वार्षिक आय" },
  companyName: { en: "Company Name", hi: "कंपनी का नाम" },
  jobType: { en: "Job / Business / Student", hi: "नौकरी / व्यापार / छात्र" },
  email: { en: "Email ID", hi: "ईमेल" },
  courseJoinFor: { en: "Course Join For", hi: "कोर्स का उद्देश्य" },
  investment: { en: "Investment (sessions)", hi: "निवेश (सत्र)" },
  date: { en: "Date", hi: "तारीख" },
  duration: { en: "Duration", hi: "अवधि" },
  storyCaseStudy: { en: "Story Case Study", hi: "कहानी / केस स्टडी" },
  foodHabit: { en: "Food Habit (Like / Dislike)", hi: "खाने की आदतें (पसंद / नापसंद)" },
  businessName: { en: "Name of Business / Category", hi: "व्यापार का नाम / श्रेणी" },
  salary: { en: "Salary", hi: "वेतन" },
  course: { en: "Course", hi: "कोर्स" },
  gender: { en: "Gender (M/F)", hi: "लिंग" },
  dob: { en: "Date of Birth", hi: "जन्म तिथि" },
  childhoodHobbies: { en: "Childhood Hobbies", hi: "बचपन के शौक" },
  serial: { en: "Serial (fav TV)", hi: "पसंदीदा सीरियल" },
  actorActress: { en: "Actor / Actress", hi: "अभिनेता / अभिनेत्री" },
  influenceBy: { en: "Influence By", hi: "किससे प्रभावित" },
  howKnow: { en: "How do you know about us", hi: "हमारे बारे में कैसे जाना" },
  education: { en: "Education", hi: "शिक्षा" },
  designation: { en: "Designation", hi: "पदनाम" },
  referBy: { en: "Refer By", hi: "संदर्भ द्वारा" },
  mobile: { en: "Mobile No", hi: "मोबाइल नंबर" },
  sessionCommitted: { en: "Session Committed", hi: "प्रतिबद्ध सत्र" },
  sessionNo: { en: "Session No", hi: "सत्र संख्या" },
  day: { en: "Day", hi: "दिन" },
  time: { en: "Time", hi: "समय" },
  signature: { en: "Signature", hi: "हस्ताक्षर" },
  saveDraft: { en: "Save Draft", hi: "ड्राफ्ट सहेजें" },
  saveSubmit: { en: "Save & Submit", hi: "सहेजें और जमा करें" },
};

interface IntakeForm {
  name: string;
  hobbies: string;
  movies: string;
  book: string;
  interest: string;
  suggestedBy: string;
  socialMedia: string;
  yearlyIncome: string;
  companyName: string;
  jobType: string;
  email: string;
  courseJoinFor: string;
  investment: string;
  date: string;
  duration: string;
  storyCaseStudy: string;
  foodHabit: string;
  businessName: string;
  salary: string;
  course: string;
  gender: string;
  dob: string;
  childhoodHobbies: string;
  serial: string;
  actorActress: string;
  influenceBy: string;
  howKnow: string;
  education: string;
  designation: string;
  referBy: string;
  mobile: string;
  sessionCommitted: string;
  sessionNo: string;
  day: string;
  time: string;
  signature: string;
}

export default function ClientIntakePage() {
  const { lang } = useCoachingLang();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm<IntakeForm>();

  const l = (key: string) => LABELS[key]?.[lang] || key;

  const onSubmit = async (data: IntakeForm) => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({ title: lang === "en" ? "Please log in first" : "कृपया पहले लॉगिन करें", variant: "destructive" });
        return;
      }

      // Encrypt sensitive long-form personal history into separate enc columns
      const personalHistoryBlob = JSON.stringify({
        hobbies: data.hobbies,
        movies: data.movies,
        book: data.book,
        interest: data.interest,
        suggestedBy: data.suggestedBy,
        socialMedia: data.socialMedia,
        companyName: data.companyName,
        jobType: data.jobType,
        courseJoinFor: data.courseJoinFor,
        investment: data.investment,
        date: data.date,
        duration: data.duration,
        storyCaseStudy: data.storyCaseStudy,
        foodHabit: data.foodHabit,
        businessName: data.businessName,
        salary: data.salary,
        childhoodHobbies: data.childhoodHobbies,
        serial: data.serial,
        actorActress: data.actorActress,
        influenceBy: data.influenceBy,
        howKnow: data.howKnow,
        designation: data.designation,
        referBy: data.referBy,
        sessionNo: data.sessionNo,
        day: data.day,
        time: data.time,
      });
      const personal_history_enc = await encryptField(personalHistoryBlob);

      const { error } = await supabase.from("clients").insert({
        coach_id: userData.user.id,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        dob: data.dob || null,
        gender: data.gender,
        income: data.yearlyIncome,
        education: data.education,
        course: data.course,
        sessions_committed: parseInt(data.sessionCommitted) || 0,
        signature_data: data.signature,
        personal_history_enc,
      } as any);

      if (error) throw error;
      toast({ title: lang === "en" ? "Client saved successfully!" : "ग्राहक सफलतापूर्वक सहेजा गया!" });
      reset();
    } catch (err: any) {
      toast({ title: err.message || "Error saving client", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ name, type = "text" }: { name: keyof IntakeForm; type?: string }) => (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{l(name)}</Label>
      <Input type={type} {...register(name)} className="h-9 text-sm" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{l("title")}</h1>
        <p className="text-sm text-muted-foreground">{l("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-3">
            <Field name="name" />
            <Field name="hobbies" />
            <Field name="movies" />
            <Field name="book" />
            <Field name="interest" />
            <Field name="suggestedBy" />
            <Field name="socialMedia" />
            <Field name="yearlyIncome" />
            <Field name="companyName" />
            <Field name="jobType" />
            <Field name="email" type="email" />
            <Field name="courseJoinFor" />
            <Field name="investment" />
            <Field name="date" type="date" />
            <Field name="duration" />
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">{l("storyCaseStudy")}</Label>
              <Textarea {...register("storyCaseStudy")} className="text-sm min-h-[60px]" />
            </div>
            <Field name="foodHabit" />
            <Field name="businessName" />
            <Field name="salary" />
            <Field name="course" />
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">{l("gender")}</Label>
              <Select onValueChange={(v) => register("gender").onChange({ target: { value: v, name: "gender" } })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={lang === "en" ? "Select" : "चुनें"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">{lang === "en" ? "Male" : "पुरुष"}</SelectItem>
                  <SelectItem value="F">{lang === "en" ? "Female" : "महिला"}</SelectItem>
                  <SelectItem value="Other">{lang === "en" ? "Other" : "अन्य"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field name="dob" type="date" />
            <Field name="childhoodHobbies" />
            <Field name="serial" />
            <Field name="actorActress" />
            <Field name="influenceBy" />
            <Field name="howKnow" />
            <Field name="education" />
            <Field name="designation" />
            <Field name="referBy" />
            <Field name="mobile" type="tel" />
            <Field name="sessionCommitted" type="number" />
            <Field name="sessionNo" />
            <Field name="day" />
            <Field name="time" type="time" />
          </div>
        </div>

        {/* Signature */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">{l("signature")}</Label>
          <Input {...register("signature")} placeholder={lang === "en" ? "Type your name as signature" : "हस्ताक्षर के रूप में अपना नाम लिखें"} className="h-9 text-sm" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => reset()}>
            {l("saveDraft")}
          </Button>
          <Button type="submit" disabled={saving} className="flex-1 bg-[#1D9E75] hover:bg-[#178A63] text-white">
            {saving ? "..." : l("saveSubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
