import { ChevronRight } from "lucide-react";

export function SettingsRow({ icon: Icon, label, subtitle, onClick, right }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-xl text-left"
    >
      {Icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(168, 85, 247, 0.12)" }}
        >
          <Icon className="w-4 h-4" style={{ color: "var(--accent-pink)" }} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-warm font-medium text-sm">{label}</div>
        {subtitle && <div className="text-xs text-warm-mute truncate">{subtitle}</div>}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 text-warm-mute shrink-0" />}
    </button>
  );
}

export function SettingsToggle({ label, subtitle, value, onChange }) {
  return (
    <div className="flex items-center gap-4 py-4 -mx-2 px-2">
      <div className="min-w-0 flex-1">
        <div className="text-warm font-medium text-sm">{label}</div>
        {subtitle && <div className="text-xs text-warm-mute mt-0.5">{subtitle}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="shrink-0 rounded-full transition-colors relative"
        style={{
          width: 44,
          height: 26,
          background: value
            ? "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)"
            : "rgba(255,255,255,0.12)",
        }}
        aria-pressed={value}
      >
        <span
          className="absolute top-0.5 rounded-full transition-transform"
          style={{
            width: 22,
            height: 22,
            background: "#fff",
            left: 2,
            transform: value ? "translateX(18px)" : "translateX(0)",
          }}
        />
      </button>
    </div>
  );
}

export function SettingsSelect({ label, value, options, onChange }) {
  return (
    <div className="py-4 -mx-2 px-2">
      <div className="text-warm font-medium text-sm mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-2 text-warm outline-none transition-colors text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0f0e18" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SettingsSection({ title, children }) {
  return (
    <div className="mb-8">
      <div className="text-label mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}
