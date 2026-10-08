import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AnimatedBackground from "./components/AnimatedBackground.jsx";
import Splash from "./components/Splash.jsx";
import Onboarding from "./components/Onboarding.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Friends from "./pages/Friends.jsx";
import Messages from "./pages/Messages.jsx";
import Compose from "./pages/Compose.jsx";
import { useAuth } from "./hooks/useAuth";
import { useIsMobile } from "./hooks/useIsMobile";

const ONBOARDING_KEY = "rodeo_onboarded";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warm-mute text-sm">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warm-mute text-sm">Loading...</div>
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const isMobile = useIsMobile();
  const [splashDone, setSplashDone] = useState(() => !isMobile);
  const [onboarded, setOnboarded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    setOnboarded(stored === "true");
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOnboarded(true);
  };

  return (
    <div className="relative min-h-screen w-full text-warm">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Splash only on mobile */}
        {isMobile && <Splash onDone={() => setSplashDone(true)} />}

        {splashDone && !onboarded && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {splashDone && onboarded && (
          <Routes>
            <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
            <Route path="/signup" element={<RequireGuest><Signup /></RequireGuest>} />

            <Route path="/" element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />
            <Route path="/friends" element={<RequireAuth><AppLayout><Friends /></AppLayout></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><AppLayout><Messages /></AppLayout></RequireAuth>} />
            <Route path="/compose" element={<RequireAuth><AppLayout><Compose /></AppLayout></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><AppLayout><Profile /></AppLayout></RequireAuth>} />
            <Route path="/u/:username" element={<RequireAuth><AppLayout><UserProfile /></AppLayout></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </div>
  );
}
