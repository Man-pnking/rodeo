import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAutoUpdate } from "../hooks/useAutoUpdate.jsx";

export default function UpdatePrompt() {
  const { pendingUpdate, acceptUpdate, declineUpdate } = useAutoUpdate();

  return (
    <AnimatePresence>
      {pendingUpdate && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed left-1/2 -translate-x-1/2 z-[201] w-full"
            style={{
              bottom: "calc(env(safe-area-inset-bottom, 0) + 24px)",
              maxWidth: "calc(100vw - 32px)",
            }}
          >
            <div
              className="rounded-3xl p-5"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.10)",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  <Sparkles className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-[16px] font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    New version available
                  </h3>
                  <p
                    className="text-[13.5px] leading-snug"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Update now for the latest features and fixes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={declineUpdate}
                  className="flex-1 py-3 rounded-full text-[14px] font-semibold transition-colors"
                  style={{
                    background: "var(--bg-soft)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Later
                </button>
                <button
                  onClick={acceptUpdate}
                  className="flex-1 py-3 rounded-full text-[14px] font-semibold"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-fg)",
                    boxShadow: "0 8px 24px rgba(59, 123, 255, 0.30)",
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
