import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { SettingsSection, SettingsToggle, SettingsRow } from "../../components/SettingsUI.jsx";
import SlideIn from "../../components/SlideIn.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function Storage() {
  const navigate = useNavigate();
  const { settings, update } = useSettingsContext();
  const { toast } = useToast();
  if (!settings) return <div className="p-8 text-warm-mute text-sm">Loading...</div>;
  const set = (k, v) => update({ [k]: v });
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">Storage and data</h1>
      </div>
      <SlideIn variant="up">
        <SettingsSection title="Automatic downloads">
          <SettingsToggle label="Photos" value={settings.auto_download_photos} onChange={(v) => set("auto_download_photos", v)} />
          <SettingsToggle label="Videos" value={settings.auto_download_videos} onChange={(v) => set("auto_download_videos", v)} />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Data usage">
          <SettingsToggle label="Data saver" subtitle="Reduce data usage on cellular" value={settings.data_saver} onChange={(v) => set("data_saver", v)} />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.1}>
        <SettingsSection title="Cache">
          <SettingsRow icon={Trash2} label="Clear cache" subtitle="Frees up local storage" onClick={() => {
            toast({ title: "Cache cleared", type: "success" });
            if ("caches" in window) caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
          }} />
        </SettingsSection>
      </SlideIn>
    </div>
  );
}
