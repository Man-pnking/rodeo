import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function EditProfileModal({ open, profile, onClose, onSave }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [phoneVis, setPhoneVis] = useState(profile?.phone_visibility || "contacts");
  const [emailVis, setEmailVis] = useState(profile?.email_visibility || "contacts");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      display_name: displayName.trim(),
      bio: bio.trim().slice(0, 150),
      phone_visibility: phoneVis,
      email_visibility: emailVis,
    });
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50 rounded-t-3xl md:rounded-3xl p-6 sm:p-8 safe-bottom"
            style={{ background: "#0f0e18", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="display-md">Edit profile</h2>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="text-label block mb-2">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-label block mb-2">Bio ({bio.length}/150)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  rows={3}
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-label block mb-2">Phone visibility</label>
                <select
                  value={phoneVis}
                  onChange={(e) => setPhoneVis(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none transition-colors"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div>
                <label className="text-label block mb-2">Email visibility</label>
                <select
                  value={emailVis}
                  onChange={(e) => setEmailVis(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm outline-none transition-colors"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
