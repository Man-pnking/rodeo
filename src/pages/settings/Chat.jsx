import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { SettingsSection, SettingsToggle, SettingsSelect } from "../../components/SettingsUI.jsx";
import SlideIn from "../../components/SlideIn.jsx";

export default function Chat() {
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
        <h1 className="display-lg">Chat</h1>
      </div>
      <SlideIn variant="up">
        <SettingsSection title="Display">
          <SettingsSelect label="Font size" value={settings.chat_font_size} options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]} onChange={(v) => set("chat_font_size", v)} />
          <SettingsSelect label="Wallpaper" value={settings.chat_wallpaper} options={[
            { value: "default", label: "Default" },
            { value: "gradient", label: "Iridescent" },
            { value: "plain", label: "Plain" },
          ]} onChange={(v) => set("chat_wallpaper", v)} />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Behaviour">
          <SettingsToggle label="Enter is Send" subtitle="Press Enter to send messages" value={settings.chat_enter_is_send} onChange={(v) => set("chat_enter_is_send", v)} />
          <SettingsToggle label="Media visibility" subtitle="Show media in gallery" value={settings.chat_media_visibility} onChange={(v) => set("chat_media_visibility", v)} />
        </SettingsSection>
      </SlideIn>
    </div>
  );
}
