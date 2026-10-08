import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
import { useAccount } from "../hooks/useAccount";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

export default function TwoFactorModal({ open, onClose }) {
  const { listFactors, enrollTotp, verifyTotp, unenrollTotp, loading } = useAccount();
  const { toast } = useToast();
  const [factors, setFactors] = useState([]);
  const [enrolling, setEnrolling] = useState(null); // { factorId, qrCode, secret }
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    const { totp } = await listFactors();
    setFactors(totp || []);
  };

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  const startEnroll = async () => {
    setError("");
    const res = await enrollTotp();
    if (res.error) setError(res.error);
    else setEnrolling(res);
  };

  const confirmEnroll = async () => {
    setError("");
    const res = await verifyTotp(enrolling.factorId, code);
    if (res.error) {
      setError(res.error);
      sounds.error();
    } else {
      sounds.success();
      toast({ title: "Two-factor enabled", type: "success" });
      setEnrolling(null);
      setCode("");
      refresh();
    }
  };

  const disable = async (factorId) => {
    const res = await unenrollTotp(factorId);
    if (res.error) toast({ title: res.error, type: "error" });
    else {
      toast({ title: "Two-factor disabled", type: "info" });
      refresh();
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(enrolling.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const verified = factors.find((f) => f.status === "verified");

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
              <h2 className="display-md">Two-factor auth</h2>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            {!enrolling && verified && (
              <div>
                <div className="flex items-start gap-3 p-4 rounded-2xl mb-6" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-warm font-medium text-sm">Enabled</div>
                    <div className="text-xs text-warm-mute mt-0.5">TOTP authentication is active on your account</div>
                  </div>
                </div>
                <button onClick={() => disable(verified.id)} className="btn-ghost w-full flex items-center justify-center gap-2">
                  <ShieldOff className="w-4 h-4" /> Disable two-factor
                </button>
              </div>
            )}

            {!enrolling && !verified && (
              <div>
                <p className="text-sm text-warm-mute mb-6">
                  Add an extra layer of security. After enabling, you'll need a code from your authenticator app when signing in.
                </p>
                <button onClick={startEnroll} disabled={loading} className="btn-primary w-full">
                  Enable two-factor
                </button>
              </div>
            )}

            {enrolling && (
              <div>
                <p className="text-sm text-warm-mute mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password).
                </p>
                <div className="flex justify-center mb-4 p-4 rounded-2xl" style={{ background: "#fff" }}>
                  <img src={enrolling.qrCode} alt="QR" className="w-48 h-48" />
                </div>
                <div className="mb-4">
                  <div className="text-label mb-2">Or enter the secret manually</div>
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "var(--bg-card)" }}>
                    <code className="text-xs text-warm-dim flex-1 break-all font-mono">{enrolling.secret}</code>
                    <button onClick={copySecret} className="p-2 -m-2" aria-label="Copy">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-warm-mute" />}
                    </button>
                  </div>
                </div>
                <label className="text-label block mb-2">Enter the 6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none text-center text-2xl font-mono tracking-widest"
                />
                {error && <div className="text-sm text-red-400 mt-3">{error}</div>}
                <button onClick={confirmEnroll} disabled={loading || code.length !== 6} className="btn-primary w-full mt-6">
                  {loading ? "Verifying..." : "Verify and enable"}
                </button>
                <button onClick={() => { setEnrolling(null); setCode(""); setError(""); }}
                  className="w-full text-sm text-warm-mute hover:text-warm py-3 mt-1">
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
