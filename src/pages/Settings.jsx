import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User as UserIcon, Lock, Bell, Database, MessageSquare,
  Palette, Info, LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import SlideIn from "../components/SlideIn.jsx";
import { SettingsRow } from "../components/SettingsUI.jsx";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -m-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">Settings</h1>
      </div>

      <SlideIn variant="up">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-4 py-4 mb-6 -mx-2 px-2 rounded-xl hover:bg-white/[0.02] transition-colors"
        >
          <div
            className="w-14 h-14 rounded-full shrink-0"
            style={{
              background: profile?.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
            }}
          />
          <div className="min-w-0 flex-1 text-left">
            <div className="text-warm font-semibold truncate">
              {profile?.display_name || profile?.username || "Your profile"}
            </div>
            <div className="text-xs text-warm-mute truncate">{user?.email}</div>
          </div>
        </button>
      </SlideIn>

      <SlideIn variant="up" delay={0.05}>
        <div className="mb-6">
          <SettingsRow icon={UserIcon} label="Account" subtitle="Security, email, delete account" onClick={() => navigate("/settings/account")} />
          <SettingsRow icon={Lock} label="Privacy" subtitle="Visibility, blocked contacts" onClick={() => navigate("/settings/privacy")} />
          <SettingsRow icon={Bell} label="Notifications" subtitle="Sounds, alerts, previews" onClick={() => navigate("/settings/notifications")} />
          <SettingsRow icon={Database} label="Storage and data" subtitle="Network, downloads, cache" onClick={() => navigate("/settings/storage")} />
          <SettingsRow icon={MessageSquare} label="Chat" subtitle="Wallpaper, font size, enter to send" onClick={() => navigate("/settings/chat")} />
          <SettingsRow icon={Palette} label="Appearance" subtitle="Theme, accent color" onClick={() => navigate("/settings/appearance")} />
          <SettingsRow icon={Info} label="General" subtitle="Language, help, about" onClick={() => navigate("/settings/general")} />
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.1}>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-colors"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#f87171",
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sign out</span>
        </button>
      </SlideIn>
    </div>
  );
}
