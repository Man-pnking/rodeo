import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, Smartphone, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useSettingsContext } from "../../context/SettingsContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { sounds } from "../../lib/sounds";
import { SettingsSection } from "../../components/SettingsRow.jsx";
import SlideIn from "../../components/SlideIn.jsx";

const THEMES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Smartphone },
];

const ACCENTS = [
  { id: "iridescent", label: "Iridescent", colors: ["var(--brand)", "var(--violet)", "#3b82f6"] },
  { id: "pink", label: "Pink", colors: ["var(--brand)", "var(--brand)", "var(--brand)"] },
  { id: "blue", label: "Blue", colors: ["#3b82f6", "#3b82f6", "#3b82f6"] },
  { id: "green", label: "Green", colors: ["var(--success)", "var(--success)", "var(--success)"] },
];

export default function Appearance() {
  const navigate = useNavigate();
  const { mode, resolved, setTheme } = useTheme();
  const { settings, update } = useSettingsContext();
  const { toast } = useToast();

  const currentAccent = settings?.accent_color || "iridescent";

  const handleTheme = (id) => {
    setTheme(id);
    sounds.tap();
    toast({ title: "Theme updated", message: `Set to ${id}`, type: "success", duration: 1200 });
  };

  const handleAccent = async (id) => {
    sounds.tap();
    const { error } = await update({ accent_color: id });
    if (error) {
      toast({ title: error, type: "error" });
      return;
    }
    toast({ title: "Accent updated", message: id, type: "success", duration: 1200 });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">Appearance</h1>
      </div>

      <SlideIn variant="up">
        <SettingsSection title="Theme">
          <div className="grid grid-cols-3 gap-2 mb-2">
            {THEMES.map((t) => {
              const active = mode === t.id;
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => handleTheme(t.id)}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
                  style={{
                    background: active ? "linear-gradient(135deg, rgba(255,110,199,0.15) 0%, rgba(168,85,247,0.18) 100%)" : "rgba(255,255,255,0.03)",
                    border: active ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <Icon className="w-5 h-5" style={{ color: active ? "var(--brand)" : "rgba(240,240,245,0.6)" }} />
                  <span className="text-xs font-medium" style={{ color: active ? "#fff" : "rgba(240,240,245,0.7)" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-warm-mute">Current: {resolved} ({mode})</p>
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Accent color">
          <div className="grid grid-cols-4 gap-3 mt-2">
            {ACCENTS.map((a) => {
              const active = currentAccent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => handleAccent(a.id)}
                  className="flex flex-col items-center gap-2"
                  aria-pressed={active}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center relative transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${a.colors[0]} 0%, ${a.colors[1]} 50%, ${a.colors[2]} 100%)`,
                      boxShadow: active ? "0 0 0 3px rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.2)" : "0 4px 16px rgba(0,0,0,0.2)",
                      transform: active ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {active && (
                      <Check className="w-5 h-5 text-white drop-shadow-md" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-[10px]" style={{ color: active ? "#fff" : "rgba(240,240,245,0.4)" }}>
                    {a.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-warm-mute mt-4">
            Saved to your account. The accent color is stored but not yet applied across the UI — that's a future update.
          </p>
        </SettingsSection>
      </SlideIn>
    </div>
  );
}
