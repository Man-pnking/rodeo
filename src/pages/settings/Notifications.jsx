import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { SettingsSection, SettingsToggle } from "../../components/SettingsUI.jsx";
import SlideIn from "../../components/SlideIn.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, update } = useSettingsContext();
  const { toast } = useToast();
  const {
    supported,
    permission,
    subscribed,
    loading: pushLoading,
    enable: enablePush,
    disable: disablePush,
  } = usePushNotifications(user?.id);

  if (!settings) return <div className="p-8 text-warm-mute text-sm">Loading...</div>;
  const set = (k, v) => update({ [k]: v });

  const handlePushToggle = async () => {
    if (subscribed) {
      await disablePush();
    } else {
      const { error } = await enablePush();
      if (error) toast({ title: error, type: "error" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">Notifications</h1>
      </div>

      {/* Push notifications master toggle */}
      <SlideIn variant="up">
        <SettingsSection title="Push notifications">
          <div className="flex items-start gap-4 py-4 -mx-2 px-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: subscribed ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.12)",
              }}
            >
              {subscribed ? (
                <Bell className="w-4 h-4 text-green-400" />
              ) : (
                <BellOff className="w-4 h-4 text-iri-pink" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-warm font-medium text-sm">
                {subscribed ? "Push notifications on" : "Push notifications off"}
              </div>
              <div className="text-xs text-warm-mute mt-0.5">
                {!supported
                  ? "Not supported on this device"
                  : permission === "denied"
                  ? "Blocked — enable in browser settings"
                  : "Get notified on your device when someone messages you"}
              </div>
            </div>
            <button
              onClick={handlePushToggle}
              disabled={!supported || pushLoading || permission === "denied"}
              className="shrink-0 rounded-full transition-colors relative disabled:opacity-40"
              style={{
                width: 44,
                height: 26,
                background: subscribed
                  ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  : "rgba(255,255,255,0.12)",
              }}
              aria-pressed={subscribed}
            >
              <span
                className="absolute top-0.5 rounded-full transition-transform"
                style={{
                  width: 22,
                  height: 22,
                  background: "#fff",
                  left: 2,
                  transform: subscribed ? "translateX(18px)" : "translateX(0)",
                }}
              />
            </button>
          </div>
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Messages">
          <SettingsToggle label="Message notifications" value={settings.notif_messages} onChange={(v) => set("notif_messages", v)} />
          <SettingsToggle label="Group notifications" value={settings.notif_groups} onChange={(v) => set("notif_groups", v)} />
          <SettingsToggle label="Show previews" subtitle="Show message text in notifications" value={settings.notif_previews} onChange={(v) => set("notif_previews", v)} />
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.1}>
        <SettingsSection title="Status">
          <SettingsToggle label="Status notifications" value={settings.notif_status} onChange={(v) => set("notif_status", v)} />
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.15}>
        <SettingsSection title="Sound & haptics">
          <SettingsToggle label="In-app sounds" value={settings.notif_sounds} onChange={(v) => set("notif_sounds", v)} />
          <SettingsToggle label="Vibration" value={settings.notif_vibration} onChange={(v) => set("notif_vibration", v)} />
        </SettingsSection>
      </SlideIn>
    </div>
  );
}
