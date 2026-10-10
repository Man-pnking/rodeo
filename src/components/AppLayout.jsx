import { useLocation } from "react-router-dom";
import Navigation from "./Navigation.jsx";
import FloatingBackground from "./FloatingBackground.jsx";

export default function AppLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  // Routes that should not show the navigation rail
  const hideNav =
    path === "/profile" ||
    path.startsWith("/u/") ||
    path.startsWith("/post/");

  // Routes that should NOT show the floating map (splash/onboarding are separate)
  const hideBackground =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/settings");

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative">
      {!hideBackground && <FloatingBackground intensity={1} />}
      {!hideNav && <Navigation />}
      <main
        className="w-full min-h-screen transition-[padding] duration-200 relative z-10"
        style={{ paddingLeft: hideNav ? 0 : "72px" }}
      >
        {children}
      </main>
    </div>
  );
}
