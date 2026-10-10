import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { SettingsSection, SettingsSelect, SettingsToggle, SettingsRow } from "../../components/SettingsRow.jsx";
import BlockedList from "../../components/BlockedList.jsx";
import CloseFriendsList from "../../components/CloseFriendsList.jsx";
import { Star } from "lucide-react";
import SlideIn from "../../components/SlideIn.jsx";

const VIS = [
  { value: "everyone", label: "Everyone" },
  { value: "contacts", label: "My contacts" },
  { value: "nobody", label: "Nobody" },
];

export default function Privacy() {
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
        <h1 className="display-lg">Privacy</h1>
      </div>
      <SlideIn variant="up">
        <SettingsSection title="Who can see">
          <SettingsSelect label="Last seen" value={settings.last_seen_visibility} options={VIS} onChange={(v) => set("last_seen_visibility", v)} />
          <SettingsSelect label="Profile photo" value={settings.profile_photo_visibility} options={VIS} onChange={(v) => set("profile_photo_visibility", v)} />
          <SettingsSelect label="About" value={settings.about_visibility} options={VIS} onChange={(v) => set("about_visibility", v)} />
          <SettingsSelect label="Status" value={settings.status_visibility} options={VIS} onChange={(v) => set("status_visibility", v)} />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Messages">
          <SettingsToggle label="Read receipts" subtitle="Let others see when you read their messages" value={settings.read_receipts} onChange={(v) => set("read_receipts", v)} />
          <SettingsSelect
            label="Disappearing messages"
            value={String(settings.disappearing_messages_hours)}
            options={[
              { value: "0", label: "Off" },
              { value: "24", label: "24 hours" },
              { value: "168", label: "7 days" },
              { value: "2160", label: "90 days" },
            ]}
            onChange={(v) => set("disappearing_messages_hours", parseInt(v))}
          />
        </SettingsSection>
      </SlideIn>
      <SlideIn variant="up" delay={0.1}>
        <SettingsSection title="Close Friends">
          <CloseFriendsList />
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.15}>
        <SettingsSection title="Blocked">
          <BlockedList />
        </SettingsSection>
      </SlideIn>
    </div>
  );
}
