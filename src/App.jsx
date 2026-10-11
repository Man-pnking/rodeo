import { useEffect, useState, lazy, Suspense , Component } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Splash from "./components/Splash.jsx";
import Onboarding from "./components/Onboarding.jsx";
import { UpdateProvider } from "./hooks/useAutoUpdate.jsx";
import UpdatePrompt from "./components/UpdatePrompt.jsx";
import AppLayout from "./components/AppLayout.jsx";
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const ChatList = lazy(() => import("./pages/ChatList.jsx"));
const Discover = lazy(() => import("./pages/Discover.jsx"));
const DevLogin = lazy(() => import("./pages/DevLogin.jsx"));
const Conversation = lazy(() => import("./pages/Conversation.jsx"));
const GroupInfo = lazy(() => import("./pages/GroupInfo.jsx"));
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

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[AppErrorBoundary]", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#fff", color: "#111" }}>
          <h2 style={{ color: "#dc2626", marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ marginBottom: 16, color: "#666" }}>Tap below to reload the app.</p>
          <button
            onClick={() => { try { localStorage.clear(); } catch (e) {} location.reload(); }}
            style={{ padding: "10px 18px", borderRadius: 999, background: "#3B7BFF", color: "#fff", border: 0, fontWeight: 600, fontSize: 14 }}
          >Reload</button>
          <pre style={{ marginTop: 20, padding: 12, background: "#f5f5f5", borderRadius: 8, fontSize: 11, whiteSpace: "pre-wrap", overflow: "auto" }}>
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}


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
  const { user } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    setOnboarded(stored === "true");
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOnboarded(true);
  };

  return (
    <AppErrorBoundary>
    <UpdateProvider>
    <ParallaxProvider>
    <SettingsProvider>
    <ThemeProvider>
    <ToastProvider>
    <StatusProvider>
    <div className="relative w-full flex-1 min-h-0 flex flex-col overflow-hidden text-warm">
      <UpdatePrompt />
      <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Splash screen */}
        {<Splash onDone={() => setSplashDone(true)} />}

        {splashDone && !onboarded && !user && !["/login", "/signup"].includes(location.pathname) && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {splashDone && (onboarded || user || ["/login", "/signup"].includes(location.pathname)) && (
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-iri-pink border-t-transparent animate-spin" />
            </div>
          }>
          <Routes>
            <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
            <Route path="/dev-login" element={<DevLogin />} />
            <Route path="/signup" element={<RequireGuest><Signup /></RequireGuest>} />

            {/* Home = contact list */}
            <Route path="/" element={<Navigate to="/messages" replace />} />

            <Route path="/discover" element={<RequireAuth><AppLayout><Discover /></AppLayout></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><AppLayout><ChatList /></AppLayout></RequireAuth>} />
            <Route path="/messages/:id" element={<RequireAuth><AppLayout><Conversation /></AppLayout></RequireAuth>} />
            <Route path="/group/:id" element={<RequireAuth><AppLayout><GroupInfo /></AppLayout></RequireAuth>} />

            <Route path="/profile" element={<RequireAuth><AppLayout><Profile /></AppLayout></RequireAuth>} />
            <Route path="/u/:username" element={<RequireAuth><AppLayout><UserProfile /></AppLayout></RequireAuth>} />

            <Route path="/settings" element={<RequireAuth><AppLayout><Settings /></AppLayout></RequireAuth>} />
            <Route path="/settings/account" element={<RequireAuth><AppLayout><SettingsAccount /></AppLayout></RequireAuth>} />
            <Route path="/settings/privacy" element={<RequireAuth><AppLayout><SettingsPrivacy /></AppLayout></RequireAuth>} />
            <Route path="/settings/notifications" element={<RequireAuth><AppLayout><SettingsNotifications /></AppLayout></RequireAuth>} />
            <Route path="/settings/storage" element={<RequireAuth><AppLayout><SettingsStorage /></AppLayout></RequireAuth>} />
            <Route path="/settings/chat" element={<RequireAuth><AppLayout><SettingsChat /></AppLayout></RequireAuth>} />
            <Route path="/settings/appearance" element={<RequireAuth><AppLayout><SettingsAppearance /></AppLayout></RequireAuth>} />
            <Route path="/settings/general" element={<RequireAuth><AppLayout><SettingsGeneral /></AppLayout></RequireAuth>} />

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
    </UpdateProvider>
    </AppErrorBoundary>
  );
}
