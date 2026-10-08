import { motion, AnimatePresence } from "framer-motion";
import { X, Ban, Flag, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useBlocks } from "../hooks/useBlocks";
import { useToast } from "../context/ToastContext.jsx";
import { sounds } from "../lib/sounds";

export default function UserActionsMenu({ open, onClose, profile, onOpenReport }) {
  const { user } = useAuth();
  const { isBlocked, block, unblock } = useBlocks(user?.id);
  const { toast } = useToast();

  if (!profile) return null;
  const blocked = isBlocked(profile.id);

  const handleBlockToggle = async () => {
    if (blocked) {
      const { error } = await unblock(profile.id);
      if (error) { toast({ title: error, type: "error" }); sounds.error(); }
      else { toast({ title: `Unblocked @${profile.username}`, type: "info" }); sounds.success(); onClose(); }
    } else {
      if (!confirm(`Block @${profile.username}? They won't be able to message you or see your content.`)) return;
      const { error } = await block(profile.id);
      if (error) { toast({ title: error, type: "error" }); sounds.error(); }
      else { toast({ title: `Blocked @${profile.username}`, type: "info" }); sounds.success(); onClose(); }
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
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm z-50 rounded-t-3xl md:rounded-3xl p-6 safe-bottom"
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="display-md">@{profile.username}</h2>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenReport?.();
                }}
                className="w-full flex items-center gap-4 py-4 px-2 -mx-2 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                  <Flag className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-warm text-sm font-medium">Report</span>
              </button>

              <button
                onClick={handleBlockToggle}
                className="w-full flex items-center gap-4 py-4 px-2 -mx-2 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                  {blocked ? <ShieldCheck className="w-4 h-4 text-green-400" /> : <Ban className="w-4 h-4 text-red-400" />}
                </div>
                <span className="text-warm text-sm font-medium">
                  {blocked ? "Unblock" : "Block"}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
