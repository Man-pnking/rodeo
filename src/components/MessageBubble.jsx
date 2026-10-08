import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

function timeOnly(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message, isOwn, senderName, showSender }) {
  const read = !!message.read_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-1 mb-1 group`}
    >
      <div className="max-w-[78%] sm:max-w-[65%] flex flex-col">
        {showSender && !isOwn && senderName && (
          <div className="text-[11px] text-iri-pink font-medium mb-1 px-2">
            {senderName}
          </div>
        )}

        <div
          className="px-4 py-2.5 relative"
          style={{
            background: isOwn
              ? "linear-gradient(180deg, #0a84ff 0%, #0066cc 100%)"
              : "rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            border: isOwn ? "none" : "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            borderRadius: isOwn
              ? "20px 20px 4px 20px"
              : "20px 20px 20px 4px",
            boxShadow: isOwn
              ? "0 2px 12px rgba(10, 132, 255, 0.28)"
              : "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {message.image_url && (
            <img
              src={message.image_url}
              alt=""
              className="rounded-2xl mb-1.5 max-h-72 object-cover w-full"
              loading="lazy"
            />
          )}

          {message.body && (
            <p className="text-[15px] leading-snug whitespace-pre-wrap break-words">
              {message.body}
            </p>
          )}
        </div>

        <div
          className={`flex items-center gap-1 mt-1 px-2 transition-opacity duration-200 opacity-0 group-hover:opacity-60 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-warm-mute font-mono">
            {timeOnly(message.created_at)}
          </span>
          {isOwn && (
            <span className="flex items-center gap-0.5">
              {read ? (
                <CheckCheck className="w-3 h-3 text-[#0a84ff]" />
              ) : (
                <Check className="w-3 h-3 text-warm-mute" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
