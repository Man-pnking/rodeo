import { NavLink } from "react-router-dom";
import RodeoMark from "./RodeoMark.jsx";
import { Home, Users, MessageCircle, Plus, User } from "lucide-react";

const LINKS = [
  { to: "/",         icon: Home,           label: "Home" },
  { to: "/discover",  icon: Users,          label: "Discover" },
  { to: "/compose",  icon: Plus,           label: "Create", isPrimary: true },
  { to: "/messages", icon: MessageCircle,  label: "Messages" },
  { to: "/profile",  icon: User,           label: "Profile" },
];

export default function Navigation() {
  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-40"
        style={{
          background: "rgba(10, 8, 15, 0.65)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <RodeoMark size={44} />
            <span className="display-md gradient-text">Rodeo</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "text-white"
                    : "text-warm-dim hover:text-warm hover:bg-white/[0.04]",
                ].join(" ")
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "linear-gradient(120deg, rgba(255,110,199,0.15) 0%, rgba(168,85,247,0.18) 50%, rgba(59,130,246,0.15) 100%)" }
                  : undefined
              }
            >
              <link.icon className="w-5 h-5" strokeWidth={2} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 text-label">v0.1.0 · alpha</div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div
          className="flex items-center justify-around px-2 pt-2 pb-2"
          style={{
            background: "rgba(10, 8, 15, 0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className="flex flex-col items-center justify-center gap-1 relative"
              style={{ minWidth: 56, minHeight: 48 }}
            >
              {({ isActive }) => (
                <>
                  {link.isPrimary ? (
                    <div
                      className="flex items-center justify-center -mt-6 mb-1"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        background: "linear-gradient(120deg, #ff6ec7 0%, #a855f7 50%, #3b82f6 100%)",
                        boxShadow: "0 8px 24px rgba(168, 85, 247, 0.45)",
                      }}
                    >
                      <link.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <link.icon
                      className="w-5 h-5 transition-colors"
                      strokeWidth={2}
                      style={{ color: isActive ? "#ff6ec7" : "rgba(240, 240, 245, 0.5)" }}
                    />
                  )}
                  <span
                    className="text-[10px] font-medium transition-colors"
                    style={{ color: isActive && !link.isPrimary ? "#ff6ec7" : "rgba(240, 240, 245, 0.5)" }}
                  >
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
