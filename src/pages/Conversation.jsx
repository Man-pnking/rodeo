import { useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useConversations } from "../hooks/useConversations";
import MessageBubble from "../components/MessageBubble.jsx";
import MessageInput from "../components/MessageInput.jsx";

export default function Conversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, loading, send } = useMessages(id, user?.id);
  const { conversations } = useConversations(user?.id);
  const scrollRef = useRef(null);

  const conv = conversations.find((c) => c.id === id);
  const other = conv?.other;

  // Lock body scroll while in chat
  useEffect(() => {
    document.body.classList.add("chat-route");
    return () => document.body.classList.remove("chat-route");
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, rgba(10,8,20,0.92) 0%, rgba(5,5,16,0.96) 100%)",
        zIndex: 30,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          flexShrink: 0,
          paddingTop: "calc(env(safe-area-inset-top, 0) + 12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "var(--bg-card)",
          backdropFilter: "blur(28px) saturate(150%)",
          WebkitBackdropFilter: "blur(28px) saturate(150%)",
        }}
      >
        <button
          onClick={() => navigate("/messages")}
          className="p-2 -m-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>

        {other ? (
          <Link to={`/u/${other.username}`} className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-full shrink-0"
              style={{
                background: other.avatar_url
                  ? `url(${other.avatar_url}) center/cover`
                  : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
              }}
            />
            <div className="min-w-0">
              <div className="text-warm font-semibold text-sm truncate">
                {other.display_name || other.username}
              </div>
              <div className="text-xs text-warm-mute truncate">@{other.username}</div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 text-warm-mute text-sm">Loading...</div>
        )}
      </div>

      {/* Messages area — scrolls internally */}
      <div
        ref={scrollRef}
        className="px-4 py-4"
        style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
      >
        {loading && (
          <div className="text-center text-warm-mute text-sm py-6">Loading...</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center text-warm-mute text-sm py-6">Say hi 👋</div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isOwn={m.sender_id === user?.id} />
        ))}
      </div>

      {/* Input — pinned at bottom */}
      <div
        style={{
          flexShrink: 0,
          paddingBottom: "env(safe-area-inset-bottom, 0)",
          background: "var(--bg-card)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <MessageInput
          onSend={(body, imageUrl) => send(body, imageUrl)}
          disabled={loading}
        />
      </div>
    </div>
  );
}
