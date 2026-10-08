import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Splash from "./components/Splash.jsx";
import Onboarding from "./components/Onboarding.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Friends from "./pages/Friends.jsx";
import Discover from "./pages/Discover.jsx";
import Messages from "./pages/Messages.jsx";
import ChatList from "./pages/ChatList.jsx";
import Conversation from "./pages/Conversation.jsx";
import GroupInfo from "./pages/GroupInfo.jsx";
import Compose from "./pages/Compose.jsx";
import Library from "./pages/Library.jsx";
import Settings from "./pages/Settings.jsx";
import SettingsAccount from "./pages/settings/Account.jsx";
import SettingsPrivacy from "./pages/settings/Privacy.jsx";
import SettingsNotifications from "./pages/settings/Notifications.jsx";
import SettingsStorage from "./pages/settings/Storage.jsx";
import SettingsChat from "./pages/settings/Chat.jsx";
import SettingsAppearance from "./pages/settings/Appearance.jsx";
import SettingsGeneral from "./pages/settings/General.jsx";
import { useAuth } from "./hooks/useAuth";
import { StatusProvider } from "./context/StatusContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ParallaxProvider } from "./context/ParallaxContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
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
    <ParallaxProvider>
    <SettingsProvider>
    <ThemeProvider>
    <ToastProvider>
    <StatusProvider>
    <div className="relative min-h-screen w-full text-warm">
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

            <Route path="/" element={<RequireAuth><AppLayout><Feed /></AppLayout></RequireAuth>} />
            <Route path="/home-legacy" element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />
            <Route path="/discover" element={<RequireAuth><AppLayout><Discover /></AppLayout></RequireAuth>} />
            <Route path="/friends" element={<RequireAuth><AppLayout><Friends /></AppLayout></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><AppLayout><ChatList /></AppLayout></RequireAuth>} />
            <Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />
            <Route path="/group/:id" element={<RequireAuth><AppLayout><GroupInfo /></AppLayout></RequireAuth>} />
            <Route path="/compose" element={<RequireAuth><AppLayout><Compose /></AppLayout></RequireAuth>} />
            <Route path="/library" element={<RequireAuth><AppLayout><Library /></AppLayout></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><AppLayout><Settings /></AppLayout></RequireAuth>} />
            <Route path="/settings/account" element={<RequireAuth><AppLayout><SettingsAccount /></AppLayout></RequireAuth>} />
            <Route path="/settings/privacy" element={<RequireAuth><AppLayout><SettingsPrivacy /></AppLayout></RequireAuth>} />
            <Route path="/settings/notifications" element={<RequireAuth><AppLayout><SettingsNotifications /></AppLayout></RequireAuth>} />
            <Route path="/settings/storage" element={<RequireAuth><AppLayout><SettingsStorage /></AppLayout></RequireAuth>} />
            <Route path="/settings/chat" element={<RequireAuth><AppLayout><SettingsChat /></AppLayout></RequireAuth>} />
            <Route path="/settings/appearance" element={<RequireAuth><AppLayout><SettingsAppearance /></AppLayout></RequireAuth>} />
            <Route path="/settings/general" element={<RequireAuth><AppLayout><SettingsGeneral /></AppLayout></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><AppLayout><Profile /></AppLayout></RequireAuth>} />
            <Route path="/u/:username" element={<RequireAuth><AppLayout><UserProfile /></AppLayout></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </div>
    </StatusProvider>
    </ToastProvider>
    </ThemeProvider>
    </SettingsProvider>
    </ParallaxProvider>
  );
}
