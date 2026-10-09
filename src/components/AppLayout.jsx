import { useLocation } from "react-router-dom";
import Navigation from "./Navigation.jsx";

export default function AppLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  // Routes that should not show the navigation rail
  const hideNav =
    path === "/profile" ||
    path.startsWith("/u/") ||
    path.startsWith("/post/");

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {!hideNav && <Navigation />}
      <main
        className="w-full min-h-screen transition-[padding] duration-200"
        style={{ paddingLeft: hideNav ? 0 : "72px" }}
      >
        {children}
      </main>
    </div>
  );
}
