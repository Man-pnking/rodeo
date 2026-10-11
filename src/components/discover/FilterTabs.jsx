import { motion } from "framer-motion";

const TABS = [
  { id: "nearby", label: "Nearby" },
  { id: "country", label: "Country" },
  { id: "world", label: "World" },
];

export default function FilterTabs({ value, onChange }) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-full"
      style={{ background: "var(--bg-soft)" }}
    >
      {TABS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="relative flex-1 py-2 px-4 rounded-full text-[13px] font-semibold transition-colors"
            style={{ color: active ? "var(--accent-fg)" : "var(--text-secondary)" }}
          >
            {active && (
              <motion.div
                layoutId="discover-tab-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
