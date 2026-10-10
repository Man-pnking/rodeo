import { createContext, useContext, useEffect, useRef, useState } from "react";

const VERSION_KEY = "rodeo_app_version";
const POLL_MS = 3000;

const UpdateContext = createContext(null);

export function UpdateProvider({ children }) {
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [pendingVersion, setPendingVersion] = useState(null);
  const reloadingRef = useRef(false);
  const snoozeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      if (reloadingRef.current || snoozeRef.current) return;
      try {
        const res = await fetch(`/version.json?_=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!data?.version || cancelled) return;

        const stored = localStorage.getItem(VERSION_KEY);

        if (!stored) {
          localStorage.setItem(VERSION_KEY, data.version);
          return;
        }

        if (stored !== data.version) {
          setPendingVersion(data.version);
          setPendingUpdate(true);
        }
      } catch {
        // silent
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, POLL_MS);

    const onFocus = () => checkVersion();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const acceptUpdate = () => {
    if (pendingVersion) {
      localStorage.setItem(VERSION_KEY, pendingVersion);
    }
    reloadingRef.current = true;
    window.location.reload();
  };

  const declineUpdate = () => {
    snoozeRef.current = true;
    setPendingUpdate(false);
    // Back off for 5 minutes before showing again
    setTimeout(() => {
      snoozeRef.current = false;
    }, 5 * 60 * 1000);
  };

  return (
    <UpdateContext.Provider value={{ pendingUpdate, acceptUpdate, declineUpdate }}>
      {children}
    </UpdateContext.Provider>
  );
}

export function useAutoUpdate() {
  const ctx = useContext(UpdateContext);
  if (!ctx) throw new Error("useAutoUpdate must be inside UpdateProvider");
  return ctx;
}
