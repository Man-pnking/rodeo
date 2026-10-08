import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { useAccount } from "../hooks/useAccount";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

export default function ChangePasswordModal({ open, onClose }) {
  const { changePassword, loading } = useAccount();
  const { toast } = useToast();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (pw1.length < 6) return setError("Password must be at least 6 characters");
    if (pw1 !== pw2) return setError("Passwords don't match");
    const { error } = await changePassword(pw1);
    if (error) {
      setError(error);
      sounds.error();
    } else {
      sounds.success();
      toast({ title: "Password updated", type: "success" });
      setPw1(""); setPw2("");
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
              <h2 className="display-md">Change password</h2>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="text-label block mb-2">New password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none pr-10"
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-0 top-2 p-2 -m-2" aria-label="Toggle">
                    {show ? <EyeOff className="w-4 h-4 text-warm-mute" /> : <Eye className="w-4 h-4 text-warm-mute" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-label block mb-2">Confirm password</label>
                <input
                  type={show ? "text" : "password"}
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none"
                />
              </div>
              {error && <div className="text-sm text-red-400">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
