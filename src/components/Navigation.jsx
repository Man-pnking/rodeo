import { NavLink, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  Compass,
  Users,
  Settings as SettingsIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";

const MOBILE_ITEMS = [
  { to: "/messages", icon: HomeIcon, label: "Home" },
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/friends", icon: Users, label: "Contacts" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

export default function Navigation() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();

  return (
    <>
      {/* ============ MOBILE: Floating frosted pill (bottom) ============ */}
      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className="md:hidden fixed z-40 left-1/2 -translate-x-1/2"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0) + 16px)",
          padding: "6px",
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.55)",
          borderRadius: "9999px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          gap: "2px",
        }}
      >
        {MOBILE_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="relative flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "9999px",
                  color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                }}
                aria-label={label}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)",
                      boxShadow:
                        "0 4px 14px rgba(59, 123, 255, 0.40), inset 0 1px 0 rgba(255,255,255,0.25)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}
                <Icon
                  className="relative w-[21px] h-[21px]"
                  strokeWidth={isActive ? 2.4 : 2}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
                      : "none",
                  }}
                />
              </motion.div>
            )}
          </NavLink>
        ))}
      </motion.nav>

      {/* ============ DESKTOP: Blue glassy sidebar (left) ============ */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col items-center py-5"
        style={{
          width: 76,
          background:
            "linear-gradient(180deg, rgba(59, 123, 255, 0.92) 0%, rgba(37, 99, 235, 0.94) 100%)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "4px 0 40px rgba(59, 123, 255, 0.25)",
          overflow: "hidden",
        }}
      >
        <motion.div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 60%)",
            top: "-80px",
            left: "-70px",
            filter: "blur(30px)",
          }}
          animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%)",
            bottom: "-40px",
            right: "-50px",
            filter: "blur(25px)",
          }}
          animate={{ x: [0, -20, 0], y: [0, -25, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col items-center w-full h-full">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate("/profile")}
            className="relative shrink-0 mb-6"
            aria-label="Profile"
          >
            <div
              className="w-11 h-11 rounded-full"
              style={{
                background: profile?.avatar_url
                  ? `url(${profile.avatar_url}) center/cover`
                  : "linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 100%)",
                border: "2px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
              }}
            />
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
              style={{
                background: "#10B981",
                border: "2px solid rgba(59, 123, 255, 0.95)",
              }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>

          <div
            className="w-9 h-px mb-5"
            style={{ background: "rgba(255, 255, 255, 0.18)" }}
          />

          <nav className="flex flex-col items-center gap-2 flex-1">
            {[
              { to: "/messages", icon: HomeIcon, label: "Home" },
              { to: "/discover", icon: Compass, label: "Discover" },
              { to: "/friends", icon: Users, label: "Contacts" },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ scale: 1.08, y: -1 }}
                    whileTap={{ scale: 0.92 }}
                    className="relative flex items-center justify-center w-12 h-12 rounded-2xl"
                    style={{
                      background: isActive
                        ? "rgba(255, 255, 255, 0.22)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(255, 255, 255, 0.28)"
                        : "1px solid transparent",
                      color: "#FFFFFF",
                    }}
                    title={label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 70%)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 16px rgba(0,0,0,0.15)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      className="relative w-[21px] h-[21px]"
                      strokeWidth={isActive ? 2.4 : 1.9}
                    />
                  </motion.div>
                )}
              </NavLink>
            ))}
          </nav>

          <NavLink to="/settings">
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.08, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex items-center justify-center w-12 h-12 rounded-2xl"
                style={{
                  background: isActive
                    ? "rgba(255, 255, 255, 0.22)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(255, 255, 255, 0.28)"
                    : "1px solid transparent",
                  color: "#FFFFFF",
                }}
                title="Settings"
              >
                <SettingsIcon
                  className="w-[21px] h-[21px]"
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
              </motion.div>
            )}
          </NavLink>
        </div>
      </motion.aside>
    </>
  );
}
