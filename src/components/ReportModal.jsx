import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useReports } from "../hooks/useReports";
import { sounds } from "../lib/sounds";

export default function ReportModal({ open, onClose, targetType, targetId }) {
  const { user } = useAuth();
  const { submit, loading, REASONS } = useReports();
  const [step, setStep] = useState("pick"); // pick | details | done
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setStep("pick");
    setReason(null);
    setDetails("");
    setError("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const submitReport = async () => {
    if (!reason) return;
    setError("");
    const { error } = await submit({
      reporterId: user?.id,
      targetType,
      targetId,
      reason,
      details,
    });
    if (error) {
      setError(error);
      sounds.error();
      return;
    }
    sounds.success();
    setStep("done");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.8)" }} onClick={close} />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl p-6 safe-bottom"
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            <div className="flex items-center justify-between mb-6" style={{ flexShrink: 0 }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
                  <Flag className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="display-md">Report</h2>
              </div>
              <button onClick={close} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            {step === "pick" && (
              <div style={{ overflowY: "auto" }}>
                <p className="text-xs text-warm-mute mb-4">Why are you reporting this?</p>
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setReason(r.id); setStep("details"); }}
                    className="w-full flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <span className="text-warm text-sm">{r.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === "details" && (
              <div>
                <p className="text-xs text-warm-mute mb-4">
                  Reason: <span className="text-warm">{REASONS.find((r) => r.id === reason)?.label}</span>
                </p>
                <label className="text-label block mb-2">Additional details (optional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Anything else we should know?"
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none resize-none text-sm"
                />
                {error && <div className="text-sm text-red-400 mt-3">{error}</div>}
                <button onClick={submitReport} disabled={loading} className="btn-primary w-full mt-6">
                  {loading ? "Submitting..." : "Submit report"}
                </button>
                <button onClick={() => setStep("pick")} className="w-full text-sm text-warm-mute hover:text-warm py-3">
                  Back
                </button>
              </div>
            )}

            {step === "done" && (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="display-md mb-2">Thanks</h3>
                <p className="text-body text-sm mb-6">
                  We've received your report. Our team will review it.
                </p>
                <button onClick={close} className="btn-ghost w-full">
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
