import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Splash from "./components/Splash.jsx";
import Onboarding from "./components/Onboarding.jsx";
import AppLayout from "./components/AppLayout.jsx";
const Home = lazy(() => import("./pages/Home.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const Friends = lazy(() => import("./pages/Friends.jsx"));
const Discover = lazy(() => import("./pages/Discover.jsx"));
const Messages = lazy(() => import("./pages/Messages.jsx"));
const ChatList = lazy(() => import("./pages/ChatList.jsx"));
const Conversation = lazy(() => import("./pages/Conversation.jsx"));
const GroupInfo = lazy(() => import("./pages/GroupInfo.jsx"));
const Compose = lazy(() => import("./pages/Compose.jsx"));
const Library = lazy(() => import("./pages/Library.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const SettingsAccount = lazy(() => import("./pages/settings/Account.jsx"));
const SettingsPrivacy = lazy(() => import("./pages/settings/Privacy.jsx"));
const SettingsNotifications = lazy(() => import("./pages/settings/Notifications.jsx"));
const SettingsStorage = lazy(() => import("./pages/settings/Storage.jsx"));
const SettingsChat = lazy(() => import("./pages/settings/Chat.jsx"));
const SettingsAppearance = lazy(() => import("./pages/settings/Appearance.jsx"));
const SettingsGeneral = lazy(() => import("./pages/settings/General.jsx"));
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
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-iri-pink border-t-transparent animate-spin" />
            </div>
          }>
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
          </Suspense>
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
