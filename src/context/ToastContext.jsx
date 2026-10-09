import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const ACCENTS = {
  success: "linear-gradient(135deg, var(--success) 0%, #16a34a 100%)",
  error: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
  info: "linear-gradient(135deg, var(--violet) 0%, #3b82f6 100%)",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ title, message, type = "info", duration = 3000 }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none safe-top w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || ICONS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full rounded-2xl px-4 py-3 flex items-start gap-3"
                style={{
                  background: "var(--bg-soft)",
                  backdropFilter: "blur(24px) saturate(150%)",
                  WebkitBackdropFilter: "blur(24px) saturate(150%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: ACCENTS[t.type] || ACCENTS.info }}
                >
                  <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  {t.title && (
                    <div className="text-warm font-semibold text-sm">{t.title}</div>
                  )}
                  {t.message && (
                    <div className="text-warm-dim text-xs mt-0.5 break-words">{t.message}</div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="p-1 -m-1 shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5 text-warm-mute" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
