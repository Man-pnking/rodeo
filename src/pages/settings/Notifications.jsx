import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { SettingsSection, SettingsToggle } from "../../components/SettingsUI.jsx";
import SlideIn from "../../components/SlideIn.jsx";

export default function Notifications() {
  const navigate = useNavigate();
  const { settings, update } = useSettingsContext();
  if (!settings) return <div className="p-8 text-warm-mute text-sm">Loading...</div>;
  const set = (k, v) => update({ [k]: v });
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">Notifications</h1>
      </div>
      <SlideIn variant="up">
        <SettingsSection title="Messages">
          <SettingsToggle label="Message notifications" value={settings.notif_messages} onChange={(v) => set("notif_messages", v)} />
          <SettingsToggle label="Group notifications" value={settings.notif_groups} onChange={(v) => set("notif_groups", v)} />
          <SettingsToggle label="Show previews" subtitle="Show message text in notifications" value={settings.notif_previews} onChange={(v) => set("notif_previews", v)} />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Status">
          <SettingsToggle label="Status notifications" value={settings.notif_status} onChange={(v) => set("notif_status", v)} />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.1}>
        <SettingsSection title="Sound & haptics">
          <SettingsToggle label="In-app sounds" value={settings.notif_sounds} onChange={(v) => set("notif_sounds", v)} />
          <SettingsToggle label="Vibration" value={settings.notif_vibration} onChange={(v) => set("notif_vibration", v)} />
        </SettingsSection>
      </SlideIn>
    </div>
  );
}
