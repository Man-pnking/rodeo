import { NavLink, useNavigate } from "react-router-dom";
import { MessageCircle, User, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";

const items = [
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Navigation() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center py-4"
      style={{
        width: 72,
        background: "var(--bg-soft)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Avatar (top) */}
      <button
        onClick={() => navigate("/profile")}
        className="relative shrink-0 mb-6"
        aria-label="Profile"
      >
        <div
          className="w-10 h-10 rounded-full"
          style={{
            background: profile?.avatar_url
              ? `url(${profile.avatar_url}) center/cover`
              : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
          }}
        />
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
          style={{
            background: "var(--success)",
            border: "2px solid var(--bg-soft)",
          }}
        />
      </button>

      {/* Divider */}
      <div className="w-8 h-px mb-4" style={{ background: "var(--border)" }} />

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-11 h-11 rounded-2xl transition-colors"
                style={{
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-tertiary)",
                }}
                title={label}
              >
                <Icon
                  className="w-[20px] h-[20px]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings (bottom) */}
      <NavLink to="/settings">
        {({ isActive }) => (
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-colors"
            style={{
              background: isActive ? "var(--accent-soft)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-tertiary)",
            }}
            title="Settings"
          >
            <SettingsIcon
              className="w-[20px] h-[20px]"
              strokeWidth={isActive ? 2.2 : 1.8}
            />
          </motion.div>
        )}
      </NavLink>
    </aside>
  );
}
