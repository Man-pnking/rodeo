import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Send, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useFeed } from "../hooks/useFeed";
import { useMedia } from "../hooks/useMedia";

const MAX_FILES = 4;
const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

export default function Composer({ open, onClose, onPosted }) {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { createPost } = useFeed(user?.id);
  const { uploadMedia } = useMedia(user?.id);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setBody("");
      setAttachments([]);
      setUploadError(null);
      setUploading(false);
      setPosting(false);
    }
  }, [open]);

  const canPost =
    (body.trim() || attachments.length > 0) && !posting && !uploading;

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const valid = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setUploadError(`${file.name}: only images are supported`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`${file.name} is over ${MAX_SIZE_MB}MB`);
        continue;
      }
      if (attachments.length + valid.length >= MAX_FILES) {
        setUploadError(`Max ${MAX_FILES} images`);
        break;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    setUploading(true);
    const uploaded = [];
    for (const file of valid) {
      const dims = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({});
        img.src = URL.createObjectURL(file);
      });
      const { data, error } = await uploadMedia(file, dims);
      if (error) {
        setUploadError(error);
        continue;
      }
      uploaded.push(data);
    }
    setUploading(false);
    if (uploaded.length > 0) setAttachments((prev) => [...prev, ...uploaded]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    const imageUrls = attachments.map((a) => a.url);
    const { error } = await createPost(body, imageUrls);
    setPosting(false);
    if (!error) {
      onPosted?.();
      onClose?.();
    } else {
      setUploadError(error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={posting ? undefined : onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[81] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl rounded-t-3xl md:rounded-3xl safe-bottom overflow-hidden flex flex-col"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,22,42,0.98) 0%, rgba(15,12,24,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-warm font-semibold text-[17px]">New post</h2>
              <button
                onClick={onClose}
                disabled={posting || uploading}
                className="p-2 -m-2 rounded-full hover:bg-white/5 disabled:opacity-30"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: "45vh" }}>
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-full shrink-0"
                  style={{
                    background: profile?.avatar_url
                      ? `url(${profile.avatar_url}) center/cover`
                      : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                  }}
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 500))}
                  placeholder="What's on your mind?"
                  rows={3}
                  autoFocus
                  className="flex-1 bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none resize-none text-[15px] leading-relaxed"
                />
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="relative aspect-square rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <img src={a.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeAttachment(a.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.75)" }}
                        aria-label="Remove"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploading && (
                <div className="flex items-center gap-2 text-xs text-warm-mute mt-4">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading...
                </div>
              )}
              {uploadError && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs mt-4"
                  style={{
                    background: "rgba(255,59,48,0.10)",
                    border: "1px solid rgba(255,59,48,0.25)",
                    color: "rgb(252,165,165)",
                  }}
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {uploadError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 -m-2 rounded-full hover:bg-white/5 transition-colors disabled:opacity-30"
                  aria-label="Add image"
                >
                  <Plus className="w-5 h-5 text-iri-pink" strokeWidth={2.5} />
                </button>
                <span className="text-xs text-warm-mute">{body.length}/500</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={submit}
                disabled={!canPost}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{
                  background: canPost
                    ? "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)"
                    : "rgba(255,255,255,0.08)",
                  color: "#fff",
                  boxShadow: canPost
                    ? "0 4px 16px rgba(251, 113, 133, 0.35)"
                    : "none",
                }}
              >
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </motion.button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
