import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { useState } from "react";

function timeOnly(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Group consecutive bubbles from same sender — tighter radius on middle ones
function getBubbleRadius(isOwn, position) {
  if (position === "single") {
    return isOwn ? "22px 22px 4px 22px" : "22px 22px 22px 4px";
  }
  if (position === "first") {
    return isOwn ? "22px 22px 8px 22px" : "22px 22px 22px 8px";
  }
  if (position === "middle") {
    return isOwn ? "8px 22px 8px 22px" : "22px 8px 22px 8px";
  }
  if (position === "last") {
    return isOwn ? "22px 8px 4px 22px" : "8px 22px 22px 4px";
  }
  return "22px";
}

export default function MessageBubble({
  message,
  isOwn,
  senderName,
  showSender,
  position = "single",
}) {
  const read = !!message.read_at;
  const [showTime, setShowTime] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.6,
      }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-1 ${
        position === "middle" || position === "last" ? "mb-0.5" : "mb-1.5"
      }`}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
      onClick={() => setShowTime((v) => !v)}
    >
      <div className="max-w-[78%] sm:max-w-[65%] flex flex-col">
        {showSender && !isOwn && senderName && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[11px] font-semibold mb-1 px-2"
            style={{ color: "var(--brand)" }}
          >
            {senderName}
          </motion.div>
        )}

        <div
          className="px-4 py-2.5 relative overflow-hidden"
          style={{
            background: isOwn
              ? "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: isOwn ? "none" : "1px solid rgba(255,255,255,0.09)",
            color: "#fff",
            borderRadius: getBubbleRadius(isOwn, position),
            boxShadow: isOwn
              ? "0 4px 20px rgba(99, 102, 241, 0.28), 0 1px 0 rgba(255,255,255,0.15) inset"
              : "0 4px 16px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.05) inset",
          }}
        >
          {/* Subtle top sheen */}
          <div
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{
              background: isOwn
                ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            }}
          />

          {message.image_url && (
            <img
              src={message.image_url}
              alt=""
              className="rounded-2xl mb-1.5 max-h-72 object-cover w-full"
              loading="lazy"
            />
          )}

          {message.body && (
            <p className="text-[15px] leading-[1.45] whitespace-pre-wrap break-words relative">
              {message.body}
            </p>
          )}
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: showTime ? 0.7 : 0, height: showTime ? "auto" : 0 }}
          transition={{ duration: 0.15 }}
          className={`flex items-center gap-1 px-2 overflow-hidden ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-warm-mute font-mono mt-1">
            {timeOnly(message.created_at)}
          </span>
          {isOwn && (
            <span className="flex items-center gap-0.5 mt-1">
              {read ? (
                <CheckCheck className="w-3 h-3 text-[var(--accent)]" />
              ) : (
                <Check className="w-3 h-3 text-warm-mute" />
              )}
            </span>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
