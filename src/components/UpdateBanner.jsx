import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";

const VERSION_KEY = "rodeo_app_version";

export default function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dismissed = useRef(false);

  // On mount, save current version and start polling
  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?_=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.version) return;

        const stored = localStorage.getItem(VERSION_KEY);

        // First run — just save the current version, no banner
        if (!stored) {
          localStorage.setItem(VERSION_KEY, data.version);
          return;
        }

        // Version mismatch → show banner
        if (stored !== data.version && !dismissed.current) {
          setShowBanner(true);
        }
      } catch {
        // silent — offline or network issue
      }
    };

    checkVersion();

    // Check on app focus
    const onFocus = () => checkVersion();
    window.addEventListener("focus", onFocus);

    // Poll every 15 minutes while the app is open
    const interval = setInterval(checkVersion, 15 * 60 * 1000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Clear SW caches before reload (Safari-friendly)
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      // Unregister service workers so a fresh one loads
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {
      // continue regardless
    }
    // Save new version so banner doesn't reappear
    try {
      const res = await fetch(`/version.json?_=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.version) localStorage.setItem(VERSION_KEY, data.version);
    } catch {}
    // Hard reload
    window.location.reload();
  };

  const handleDismiss = () => {
    dismissed.current = true;
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed left-1/2 -translate-x-1/2 z-[200]"
          style={{
            top: "calc(env(safe-area-inset-top, 0) + 12px)",
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          <div
            className="flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-full"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              boxShadow: "0 12px 32px rgba(59, 123, 255, 0.35)",
            }}
          >
            <RefreshCw
              className={`w-4 h-4 shrink-0 ${updating ? "animate-spin" : ""}`}
            />
            <span className="text-[13.5px] font-semibold whitespace-nowrap">
              New version available
            </span>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-opacity disabled:opacity-60"
              style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
            >
              {updating ? "Updating..." : "Refresh"}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 -mr-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
