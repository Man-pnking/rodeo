import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, FileText, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMedia } from "../hooks/useMedia";

const MAX_FILES = 4;
const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

export default function AttachmentSheet({ open, onClose, onPick }) {
  const { user } = useAuth();
  const { uploadMedia } = useMedia(user?.id);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setUploading(false);
      setError(null);
    }
  }, [open]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setError(null);

    // Validate
    const valid = [];
    for (const file of files) {
      if (!ACCEPTED.includes(file.type) && !file.type.startsWith("image/")) {
        setError(`${file.name}: unsupported type`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`${file.name} is over ${MAX_SIZE_MB}MB`);
        continue;
      }
      if (valid.length >= MAX_FILES) {
        setError(`Max ${MAX_FILES} files`);
        break;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;

    setUploading(true);
    const uploaded = [];

    for (const file of valid) {
      // Get dimensions for images
      let dims = {};
      if (file.type.startsWith("image/")) {
        dims = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({});
          img.src = URL.createObjectURL(file);
        });
      }
      const { data, error } = await uploadMedia(file, dims);
      if (error) {
        setError(error);
        continue;
      }
      uploaded.push(data);
    }

    setUploading(false);

    if (uploaded.length > 0) {
      onPick?.(uploaded.length === 1 ? uploaded[0] : uploaded);
      onClose?.();
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
            className="fixed inset-0 z-[70]"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            onClick={uploading ? undefined : onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[71] rounded-t-3xl safe-bottom"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,22,42,0.98) 0%, rgba(15,12,24,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h3 className="text-warm font-semibold text-[16px]">
                {uploading ? "Uploading..." : "Share"}
              </h3>
              <button
                onClick={onClose}
                disabled={uploading}
                className="p-2 -m-2 rounded-full hover:bg-white/5 disabled:opacity-30"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mx-6 mb-3 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: "rgba(255,59,48,0.10)",
                  border: "1px solid rgba(255,59,48,0.25)",
                  color: "rgb(252,165,165)",
                }}
              >
                {error}
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-3 gap-3 px-6 pb-8">
              <OptionButton
                icon={Camera}
                label="Camera"
                accent="linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)"
                disabled={uploading}
                onClick={() => cameraRef.current?.click()}
              />
              <OptionButton
                icon={ImageIcon}
                label="Gallery"
                accent="linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              />
              <OptionButton
                icon={FileText}
                label="File"
                accent="linear-gradient(135deg, var(--success) 0%, var(--success) 100%)"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              />
            </div>

            {/* Hidden inputs */}
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFiles([e.target.files[0]]);
                e.target.value = "";
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function OptionButton({ icon: Icon, label, accent, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2.5 py-4 rounded-2xl transition-colors hover:bg-white/[0.03] disabled:opacity-40"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: accent,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        }}
      >
        <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
      <span className="text-xs font-medium text-warm">{label}</span>
    </motion.button>
  );
}
