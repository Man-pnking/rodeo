import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
function timeOnly(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Sharper tail on the appropriate corner for the "speech direction"
function getBubbleRadius(isOwn, position) {
  if (position === "single") {
    return isOwn ? "20px 20px 4px 20px" : "20px 20px 20px 4px";
  }
  if (position === "first") {
    return isOwn ? "20px 20px 6px 20px" : "20px 20px 20px 6px";
  }
  if (position === "middle") {
    return isOwn ? "20px 6px 6px 20px" : "6px 20px 20px 6px";
  }
  if (position === "last") {
    return isOwn ? "20px 6px 4px 20px" : "6px 20px 20px 4px";
  }
  return "20px";
}

export default function MessageBubble({
  message,
  isOwn,
  senderName,
  showSender,
  position = "single",
}) {
  const read = !!message.read_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} px-1 ${
        position === "middle" || position === "last" ? "mb-0.5" : "mb-1.5"
      }`}
    >
      <div className="max-w-[78%] sm:max-w-[65%] flex flex-col">
        {showSender && !isOwn && senderName && (
          <div
            className="text-[11px] font-semibold mb-1 px-2"
            style={{ color: "var(--accent)" }}
          >
            {senderName}
          </div>
        )}

        <div
          className="px-3.5 py-2 relative"
          style={{
            background: isOwn
              ? "var(--bubble-out-bg)"
              : "var(--bubble-in-bg)",
            color: isOwn ? "var(--bubble-out-fg)" : "var(--bubble-in-fg)",
            borderRadius: getBubbleRadius(isOwn, position),
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

          {/* Inline timestamp + read status for outgoing */}
          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
            style={{
              opacity: 0.75,
              fontSize: "10.5px",
              marginBottom: "-2px",
            }}
          >
            <span className="font-mono tabular-nums">
              {timeOnly(message.created_at)}
            </span>
            {isOwn && (
              <span className="flex items-center">
                {read ? (
                  <CheckCheck
                    className="w-3 h-3"
                    style={{ color: "var(--bubble-out-fg)" }}
                  />
                ) : (
                  <Check
                    className="w-3 h-3"
                    style={{ color: "var(--bubble-out-fg)" }}
                  />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
