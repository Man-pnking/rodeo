import { useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useConversations } from "../hooks/useConversations";
import { useGroups } from "../hooks/useGroups";
import MessageBubble from "../components/MessageBubble.jsx";
import MessageInput from "../components/MessageInput.jsx";
import GroupAvatar from "../components/GroupAvatar.jsx";
import DateSeparator from "../components/DateSeparator.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";

function sameDay(aIso, bIso) {
  if (!aIso || !bIso) return false;
  const a = new Date(aIso);
  const b = new Date(bIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Determine bubble grouping position
function getPosition(prev, next, currentSender) {
  const sameAsPrev = prev && prev.sender_id === currentSender;
  const sameAsNext = next && next.sender_id === currentSender;

  if (!sameAsPrev && !sameAsNext) return "single";
  if (!sameAsPrev && sameAsNext) return "first";
  if (sameAsPrev && sameAsNext) return "middle";
  if (sameAsPrev && !sameAsNext) return "last";
  return "single";
}

export default function Conversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups: myGroups } = useGroups(user?.id);
  const { conversations } = useConversations(user?.id);
  const scrollRef = useRef(null);

  const group = myGroups.find((g) => g.id === id);
  const isGroup = !!group;
  const conv = isGroup ? null : conversations.find((c) => c.id === id);
  const other = conv?.other;

  const { messages, loading, send } = useMessages(
    isGroup ? { groupId: id } : { conversationId: id },
    user?.id
  );

  useEffect(() => {
    document.body.classList.add("chat-route");
    return () => document.body.classList.remove("chat-route");
  }, []);

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
        background: "var(--bg)",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      
      {/* Header */}
      <div
        className="relative flex items-center justify-between px-2 py-2"
        style={{
          flexShrink: 0,
          paddingTop: "calc(env(safe-area-inset-top, 0) + 10px)",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
          zIndex: 2,
        }}
      >
        <button
          onClick={() => navigate("/messages")}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ color: "var(--text-primary)" }}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none max-w-[60%]">
          {isGroup && group ? (
            <button
              onClick={() => navigate("/group/" + id)}
              className="flex items-center gap-2 pointer-events-auto"
            >
              <GroupAvatar group={group} members={group.members} size={32} />
              <div className="min-w-0 text-left">
                <div className="text-[15px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {group.name}
                </div>
                <div className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                  {group.members?.length || 1} member{(group.members?.length || 1) !== 1 ? "s" : ""}
                </div>
              </div>
            </button>
          ) : other ? (
            <Link to={"/u/" + other.username} className="flex items-center gap-2 pointer-events-auto">
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{
                  background: other.avatar_url
                    ? "url(" + other.avatar_url + ") center/cover"
                    : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                }}
              />
              <div className="min-w-0 text-left">
                <div className="text-[15px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {other.display_name || other.username}
                </div>
                <div className="text-[11px] truncate" style={{ color: "var(--accent)" }}>
                  Active now
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>
          )}
        </div>

        <button
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ color: "var(--text-primary)" }}
          aria-label="Call"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="px-4 py-4 relative"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", zIndex: 1 }}
      >
        {loading && (
          <div className="text-center text-warm-mute text-sm py-6">
            Loading...
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center text-warm-mute text-sm py-12">
            Say hi 👋
          </div>
        )}

        {messages.map((m, idx) => {
          const prev = messages[idx - 1];
          const next = messages[idx + 1];
          const showDateSeparator =
            !prev || !sameDay(prev.created_at, m.created_at);
          const position = getPosition(prev, next, m.sender_id);

          const senderMember = isGroup
            ? group?.members?.find((gm) => gm.user_id === m.sender_id)
            : null;
          const senderName =
            senderMember?.profile?.display_name ||
            senderMember?.profile?.username;

          return (
            <div key={m.id}>
              {showDateSeparator && <DateSeparator date={m.created_at} />}
              <MessageBubble
                message={m}
                isOwn={m.sender_id === user?.id}
                senderName={senderName}
                showSender={isGroup && position === "first"}
                position={position}
              />
            </div>
          );
        })}

        <AnimatePresence>
          {false && <TypingIndicator key="typing" />}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div
        style={{
          flexShrink: 0,
          paddingBottom: "env(safe-area-inset-bottom, 0)",
          background: "var(--bg)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          zIndex: 2,
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
