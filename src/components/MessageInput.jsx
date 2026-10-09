import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Plus, X, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMedia } from "../hooks/useMedia";

const MAX_FILES = 4;
const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

export default function MessageInput({ onSend, disabled }) {
  const { user } = useAuth();
  const { uploadMedia } = useMedia(user?.id);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]); // uploaded media objects
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef(null);

  const canSend =
    (body.trim() || attachments.length > 0) && !sending && !uploading && !disabled;

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
        setUploadError(`Max ${MAX_FILES} images per message`);
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
    if (uploaded.length > 0) {
      setAttachments((prev) => [...prev, ...uploaded]);
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const submit = async () => {
    if (!canSend) return;
    setSending(true);

    // Send the first image (your schema has a single image_url column).
    // If you later add multi-image support, this is where you'd send an array.
    const imageUrl = attachments.length > 0 ? attachments[0].url : null;
    await onSend(body, imageUrl);

    setBody("");
    setAttachments([]);
    setSending(false);
  };

  return (
    <div
      className="flex flex-col px-4 py-3 safe-bottom gap-2"
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      {/* Attachment preview strip */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-1 pb-1 overflow-x-auto">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <img src={a.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeAttachment(a.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.75)" }}
                aria-label="Remove"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload status / error */}
      {uploading && (
        <div className="flex items-center gap-2 text-xs text-warm-mute px-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Uploading...
        </div>
      )}
      {uploadError && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
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

      {/* Input row */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="p-2 rounded-full hover:bg-white/5 transition-colors shrink-0 disabled:opacity-30"
          aria-label="Add image"
        >
          <Plus className="w-5 h-5 text-iri-pink" strokeWidth={2.5} />
        </button>

        <div className="flex-1 min-w-0">
          <div
            className="flex items-center rounded-full px-4 py-1.5 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: focused
                ? "1px solid rgba(99, 102, 241,0.55)"
                : "1px solid rgba(255,255,255,0.10)",
              boxShadow: focused
                ? "0 0 0 3px rgba(99, 102, 241,0.15)"
                : "none",
            }}
          >
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
              placeholder="Message..."
              disabled={disabled}
              className="w-full bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none text-[15px] py-1"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={submit}
          disabled={!canSend}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: canSend
              ? "linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)"
              : "rgba(255,255,255,0.08)",
            boxShadow: canSend
              ? "0 4px 14px rgba(99, 102, 241, 0.4)"
              : "none",
            transition: "background 0.2s, box-shadow 0.2s",
            opacity: disabled ? 0.4 : 1,
          }}
          aria-label="Send"
        >
          <Send
            className={`w-4 h-4 ${canSend ? "text-white" : "text-warm-mute"}`}
          />
        </motion.button>
      </div>

      {/* Hidden file input — opens OS picker directly */}
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
    </div>
  );
}
