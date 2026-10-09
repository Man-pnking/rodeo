import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Circle, Bookmark } from "lucide-react";

const tabs = [
  { id: "posts", label: "Posts", icon: FileText },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "status", label: "Status", icon: Circle },
  { id: "saved", label: "Saved", icon: Bookmark },
];

export default function ProfileTabs({ value, onChange, isOwn }) {
  const visible = isOwn ? tabs : tabs.filter((t) => t.id !== "saved");

  return (
    <div className="w-full px-4 sm:px-6 pt-5 pb-3">
      <div
        className="flex items-center gap-1 p-1 rounded-full max-w-md mx-auto"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {visible.map(({ id, label, icon: Icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-full transition-colors duration-200"
              style={{
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: active ? 600 : 500,
                fontSize: "13px",
                letterSpacing: "-0.008em",
                zIndex: 1,
              }}
            >
              {active && (
                <motion.div
                  layoutId="profile-tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--bg-soft)",
                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)",
                    zIndex: -1,
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <Icon
                className="w-[14px] h-[14px] shrink-0"
                strokeWidth={active ? 2.2 : 1.9}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
