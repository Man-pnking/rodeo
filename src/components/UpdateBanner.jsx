import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [updating, setUpdating] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every 30 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn("[SW] registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) setShowBanner(true);
  }, [needRefresh]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateServiceWorker(true);
      // updateServiceWorker(true) triggers a reload
    } catch {
      setUpdating(false);
    }
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
              style={{
                background: "rgba(255,255,255,0.22)",
                color: "#fff",
              }}
            >
              {updating ? "Updating..." : "Refresh"}
            </button>
            <button
              onClick={() => setShowBanner(false)}
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
