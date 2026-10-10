import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, FileText, Shield, Info } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";
import { SettingsSection, SettingsRow } from "../../components/SettingsRow.jsx";
import SlideIn from "../../components/SlideIn.jsx";

export default function General() {
  const navigate = useNavigate();
  const { toast } = useToast();
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">General</h1>
      </div>
      <SlideIn variant="up">
        <SettingsSection title="Support">
          <SettingsRow icon={HelpCircle} label="Help center" onClick={() => toast({ title: "Contact contactus@rodeo.app", type: "info" })} />
          <SettingsRow icon={Shield} label="Privacy policy" onClick={() => toast({ title: "Coming soon", type: "info" })} />
          <SettingsRow icon={FileText} label="Terms of service" onClick={() => toast({ title: "Coming soon", type: "info" })} />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="About">
          <SettingsRow icon={Info} label="Rodeo" subtitle="v0.1.0 · alpha" right={<span className="text-xs text-warm-mute">v0.1.0</span>} />
        </SettingsSection>
      </SlideIn>
    </div>
  );
}
