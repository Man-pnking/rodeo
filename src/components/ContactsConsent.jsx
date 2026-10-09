import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Shield, X } from "lucide-react";

export default function ContactsConsent({ open, onClose, onGrant, onManual }) {
  const [ownPhone, setOwnPhone] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl p-6 sm:p-8 safe-bottom"
            style={{ background: "var(--bg-soft)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)" }}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            <h2 className="display-md mb-3">Find your friends</h2>
            <p className="text-body text-sm mb-6">
              Rodeo matches your contacts privately. Phone numbers are hashed on your
              device before upload — we never see the raw numbers.
            </p>

            <div className="flex items-start gap-3 mb-6 text-xs text-warm-mute">
              <Shield className="w-4 h-4 text-iri-pink shrink-0 mt-0.5" />
              <span>
                Only you can see the matches. Nothing is shared without your action.
              </span>
            </div>

            <div className="mb-6">
              <label className="text-label block mb-2">Your phone number</label>
              <input
                type="tel"
                value={ownPhone}
                onChange={(e) => setOwnPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none transition-colors"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onGrant(ownPhone)}
                disabled={!ownPhone}
                className="btn-primary w-full"
              >
                Sync my contacts
              </button>
              <button
                onClick={() => onManual(ownPhone)}
                disabled={!ownPhone}
                className="btn-ghost w-full"
              >
                Enter numbers manually
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
