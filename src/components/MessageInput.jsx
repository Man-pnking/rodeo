import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Image as ImageIcon, X } from "lucide-react";
import MediaPicker from "./MediaPicker.jsx";

export default function MessageInput({ onSend, disabled }) {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);

  const canSend = (body.trim() || image) && !sending && !disabled;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    await onSend(body, image?.url || null);
    setBody("");
    setImage(null);
    setSending(false);
  };

  return (
    <>
      <div
        className="flex items-end gap-2 px-4 py-3 safe-bottom"
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        <button
          onClick={() => setPickerOpen(true)}
          className="p-2 rounded-full hover:bg-white/5 transition-colors shrink-0"
          aria-label="Add media"
        >
          <ImageIcon className="w-5 h-5 text-iri-pink" />
        </button>

        <div className="flex-1 min-w-0">
          {image && (
            <div className="relative mb-2 rounded-xl overflow-hidden inline-block">
              <img src={image.url} alt="" className="max-h-32 object-contain" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)" }}
                aria-label="Remove"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          <div
            className="flex items-center rounded-full px-4 py-1.5 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: focused
                ? "1px solid rgba(10,132,255,0.55)"
                : "1px solid rgba(255,255,255,0.10)",
              boxShadow: focused
                ? "0 0 0 3px rgba(10,132,255,0.15)"
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
              ? "linear-gradient(180deg, #0a84ff 0%, #0066cc 100%)"
              : "rgba(255,255,255,0.08)",
            boxShadow: canSend
              ? "0 4px 14px rgba(10, 132, 255, 0.4)"
              : "none",
            transition: "background 0.2s, box-shadow 0.2s",
            opacity: disabled ? 0.4 : 1,
          }}
          aria-label="Send"
        >
          <Send className={`w-4 h-4 ${canSend ? "text-white" : "text-warm-mute"}`} />
        </motion.button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(m) => setImage(m)}
      />
    </>
  );
}
