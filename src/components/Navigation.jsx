import { NavLink } from "react-router-dom";
import { Home, Compass, Users, MessageCircle, User, Plus } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/compose", icon: Plus, label: "Create", primary: true },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Navigation() {
  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col px-4 py-6 z-40"
        style={{
          background: "var(--bg-soft)",
          borderRight: "1px solid var(--border)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        <div
          className="text-[22px] font-black mb-10 px-2"
          style={{ letterSpacing: "-0.03em", color: "var(--text-primary)" }}
        >
          Rodeo
        </div>
        <nav className="flex flex-col gap-1">
          {items.map(({ to, icon: Icon, label, end, primary }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                  style={{
                    background: isActive
                      ? "var(--accent-soft)"
                      : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <Icon
                    className="w-[20px] h-[20px]"
                    strokeWidth={isActive || primary ? 2.2 : 1.8}
                  />
                  <span className="text-[15px]">{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "color-mix(in srgb, var(--bg-soft) 92%, transparent)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
          {items.map(({ to, icon: Icon, label, end, primary }) => (
            <NavLink key={to} to={to} end={end} className="flex-1">
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center justify-center gap-0.5 py-1 relative"
                >
                  {primary ? (
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center -mt-4 mb-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                        boxShadow:
                          "0 6px 20px rgba(251, 113, 133, 0.35)",
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="relative py-1.5">
                      <Icon
                        className="w-[22px] h-[22px]"
                        strokeWidth={isActive ? 2.4 : 1.8}
                        style={{
                          color: isActive
                            ? "var(--accent)"
                            : "var(--text-tertiary)",
                          transition: "color 0.15s ease",
                        }}
                      />
                    </div>
                  )}
                  <span
                    className="text-[10.5px] font-medium"
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : "var(--text-tertiary)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
