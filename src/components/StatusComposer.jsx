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
    const { error } = await createStatus(user.id, file, caption);
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
