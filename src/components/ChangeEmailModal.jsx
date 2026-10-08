import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAccount } from "../hooks/useAccount";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

export default function ChangeEmailModal({ open, onClose }) {
  const { user } = useAuth();
  const { changeEmail, loading } = useAccount();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email");
    const { error } = await changeEmail(email);
    if (error) {
      setError(error);
      sounds.error();
    } else {
      sounds.success();
      toast({ title: "Confirmation sent", message: `Check ${email} to confirm.`, type: "success" });
      setEmail("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl p-6 safe-bottom"
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="display-md">Change email</h2>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>
            <p className="text-xs text-warm-mute mb-6">
              Current: {user?.email}<br />
              A confirmation link will be sent to the new address.
            </p>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="text-label block mb-2">New email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none"
                />
              </div>
              {error && <div className="text-sm text-red-400">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sending..." : "Send confirmation"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
