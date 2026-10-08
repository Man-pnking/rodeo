import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../hooks/useAccount";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

export default function DeleteAccountModal({ open, onClose }) {
  const navigate = useNavigate();
  const { deleteAccount, loading } = useAccount();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (confirm !== "DELETE") {
      setError('Type DELETE (uppercase) to confirm');
      return;
    }
    const { error } = await deleteAccount();
    if (error) {
      setError(error);
      sounds.error();
    } else {
      toast({ title: "Account deleted", type: "info" });
      navigate("/login");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl p-6 safe-bottom"
            style={{ background: "var(--bg-soft)", border: "1px solid rgba(239,68,68,0.3)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="display-md">Delete account</h2>
              </div>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            <div className="mb-6 text-sm text-warm-mute leading-relaxed">
              This permanently deletes your account, profile, posts, statuses, messages, and media. <span className="text-red-400 font-medium">This cannot be undone.</span>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="text-label block mb-2">Type DELETE to confirm</label>
                <input
                  type="text"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-red-400 pb-3 text-warm outline-none text-center font-mono tracking-widest"
                />
              </div>
              {error && <div className="text-sm text-red-400">{error}</div>}
              <button
                type="submit"
                disabled={loading || confirm !== "DELETE"}
                className="w-full py-4 rounded-full font-semibold transition-colors disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", color: "#fff" }}
              >
                {loading ? "Deleting..." : "Permanently delete my account"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
