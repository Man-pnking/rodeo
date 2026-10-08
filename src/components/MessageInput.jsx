import { useState } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import MediaPicker from "./MediaPicker.jsx";

export default function MessageInput({ onSend, disabled }) {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if ((!body.trim() && !image) || sending) return;
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
          borderTop: "1px solid rgba(255,255,255,0.06)",
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
            className="flex items-center rounded-full px-4 py-1.5"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
              placeholder="Message..."
              disabled={disabled}
              className="w-full bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none text-[15px] py-1"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={disabled || (!body.trim() && !image) || sending}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity"
          style={{
            background: "linear-gradient(180deg, #0a84ff 0%, #0066cc 100%)",
            boxShadow: "0 4px 14px rgba(10, 132, 255, 0.4)",
            opacity: disabled || (!body.trim() && !image) || sending ? 0.35 : 1,
          }}
          aria-label="Send"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(m) => setImage(m)}
      />
    </>
  );
}
