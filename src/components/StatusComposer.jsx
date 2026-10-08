import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Send } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useStatuses } from "../hooks/useStatuses";
import MediaPicker from "./MediaPicker.jsx";

export default function StatusComposer({ open, onClose, onPosted }) {
  const { user } = useAuth();
  const { createStatus } = useStatuses(user?.id);
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState("contacts");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const submit = async () => {
    if (!media) return;
    setPosting(true);
    // Fetch the file from the public URL and pass to uploader
    const res = await fetch(media.url);
    const blob = await res.blob();
    const ext = media.url.split(".").pop() || "jpg";
    const file = new File([blob], `status-${Date.now()}.${ext}`, { type: blob.type });
    const { error } = await createStatus(user.id, file, caption, audience);
    setPosting(false);
    if (!error) {
      setMedia(null);
      setCaption("");
      onPosted?.();
    } else {
      alert(error);
    }
  };

  const close = () => {
    setMedia(null);
    setCaption("");
    setAudience("contacts");
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.85)" }}
              onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl p-6 safe-bottom max-h-[90vh] overflow-y-auto"
              style={{ background: "var(--bg-soft)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="display-md">New status</h2>
                <button onClick={close} className="p-2 -m-2" aria-label="Close">
                  <X className="w-5 h-5 text-warm-mute" />
                </button>
              </div>

              {!media ? (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors"
                  style={{
                    border: "2px dashed rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <ImageIcon className="w-10 h-10 text-iri-pink" />
                  <span className="text-sm text-warm-dim">Tap to add a photo</span>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  <img src={media.url} alt="" className="w-full max-h-[60vh] object-contain" />
                  <button
                    onClick={() => setMedia(null)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {media && (
                <>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 100))}
                    placeholder="Add a caption..."
                    className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors text-sm mb-4"
                  />
                  <div className="mb-4">
                    <label className="text-label block mb-3">Who can see this</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "everyone", label: "Everyone" },
                        { id: "contacts", label: "Friends" },
                        { id: "close_friends", label: "Close" },
                      ].map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setAudience(a.id)}
                          className="py-3 rounded-xl text-xs font-medium transition-colors"
                          style={{
                            background: audience === a.id
                              ? "linear-gradient(135deg, rgba(255,110,199,0.15) 0%, rgba(168,85,247,0.18) 100%)"
                              : "rgba(255,255,255,0.04)",
                            border: audience === a.id
                              ? "1px solid rgba(168,85,247,0.5)"
                              : "1px solid rgba(255,255,255,0.06)",
                            color: audience === a.id ? "#fff" : "var(--text-secondary)",
                          }}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={submit}
                    disabled={posting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {posting ? "Posting..." : "Share status"}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(m) => setMedia(m)}
      />
    </>
  );
}
