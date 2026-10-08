import { useState } from "react";
import { motion } from "framer-motion";
import { Grid3x3, Bookmark, FileText, Circle } from "lucide-react";

const TABS = [
  { id: "posts",  label: "Posts",  icon: FileText },
  { id: "media",  label: "Media",  icon: Grid3x3 },
  { id: "status", label: "Status", icon: Circle, ownOnly: true },
  { id: "saved",  label: "Saved",  icon: Bookmark, ownOnly: true },
];

export default function ProfileTabs({ isOwn, value, onChange }) {
  const tabs = TABS.filter((t) => !t.ownOnly || isOwn);

  return (
    <div className="border-b border-white/8 sticky top-0 z-20 backdrop-blur-xl"
      style={{ background: "rgba(10, 8, 15, 0.7)" }}
    >
      <div className="max-w-4xl mx-auto px-6 flex gap-1">
        {tabs.map((tab) => {
          const active = value === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex items-center gap-2 px-4 py-4 text-sm transition-colors"
              style={{ color: active ? "#fff" : "rgba(240,240,245,0.5)" }}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              {active && (
                <motion.div
                  layoutId="profile-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, #ff6ec7 0%, #a855f7 100%)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
