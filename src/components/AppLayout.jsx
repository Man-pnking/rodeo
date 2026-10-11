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
    path.startsWith("/post/") ||
    path.startsWith("/messages/") ||
    path.startsWith("/group/");

  // Routes that should NOT show the floating map (splash/onboarding are separate)
  const hideBackground =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/settings") ||
    path.startsWith("/messages/") ||
    path.startsWith("/group/");

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {!hideBackground && <FloatingBackground intensity={1} />}
      {!hideNav && <Navigation />}
      <main className="w-full flex-1 min-h-0 overflow-y-auto relative z-10 md:pl-[76px]">
        {children}
      </main>
    </div>
  );
}
