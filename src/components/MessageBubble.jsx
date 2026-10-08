function timeOnly(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message, isOwn, senderName, showSender }) {
  const read = !!message.read_at;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-1 mb-1`}>
      <div className="max-w-[78%] sm:max-w-[65%]">
        {showSender && !isOwn && senderName && (
          <div className="text-[11px] text-iri-pink font-medium mb-1 px-2">
            {senderName}
          </div>
        )}
        <div
          className="px-4 py-2.5"
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
              ? "0 2px 12px rgba(10, 132, 255, 0.25)"
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
          className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? "justify-end" : "justify-start"}`}
          style={{ opacity: 0.55 }}
        >
          <span className="text-[10px] text-warm-mute font-mono">
            {timeOnly(message.created_at)}
          </span>
          {isOwn && (
            <span className="text-[10px] text-warm-mute">
              {read ? "· Read" : "· Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
