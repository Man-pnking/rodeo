import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Sun, Moon, Smartphone, LogOut, ChevronRight, Bell, Lock, User as UserIcon, Palette } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";
import SlideIn from "../components/SlideIn.jsx";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { mode, resolved, setTheme } = useTheme();
  const { toast } = useToast();

  const THEMES = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Smartphone },
  ];

  const handleTheme = (id) => {
    setTheme(id);
    sounds.tap();
    toast({ title: "Theme updated", message: `Set to ${id}`, type: "success", duration: 1500 });
  };

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
        <div className="mb-8">
          <div className="text-label mb-4">Appearance</div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const active = mode === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTheme(t.id)}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, rgba(255,110,199,0.15) 0%, rgba(168,85,247,0.18) 100%)"
                      : "rgba(255,255,255,0.03)",
                    border: active
                      ? "1px solid rgba(168,85,247,0.5)"
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: active ? "#ff6ec7" : "rgba(240,240,245,0.6)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: active ? "#fff" : "rgba(240,240,245,0.7)" }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-warm-mute mt-3">
            Current: {resolved === "light" ? "Light" : "Dark"} ({mode})
          </p>
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.05}>
        <div className="mb-8">
          <div className="text-label mb-4">Account</div>
          <SettingRow icon={UserIcon} label="Profile" subtitle={user?.email} onClick={() => navigate("/profile")} />
          <SettingRow icon={Lock} label="Privacy" subtitle="Who can see what" onClick={() => toast({ title: "Coming soon", type: "info" })} />
          <SettingRow icon={Bell} label="Notifications" subtitle="Sounds and alerts" onClick={() => toast({ title: "Coming soon", type: "info" })} />
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.1}>
        <div className="mb-8">
          <div className="text-label mb-4">About</div>
          <SettingRow icon={Palette} label="Rodeo" subtitle="v0.1.0 · alpha" onClick={() => {}} />
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.15}>
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

function SettingRow({ icon: Icon, label, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-xl text-left"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(168, 85, 247, 0.12)" }}
      >
        <Icon className="w-4 h-4 text-iri-pink" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-warm font-medium text-sm">{label}</div>
        {subtitle && <div className="text-xs text-warm-mute truncate">{subtitle}</div>}
      </div>
      <ChevronRight className="w-4 h-4 text-warm-mute shrink-0" />
    </button>
  );
}
