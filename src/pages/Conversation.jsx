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
        background:
          "radial-gradient(ellipse at top, rgba(30,15,60,1) 0%, rgba(8,6,18,1) 60%)",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      {/* Animated background orb */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(10,132,255,0.12) 0%, transparent 70%)",
          top: "-200px",
          right: "-200px",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 relative"
        style={{
          flexShrink: 0,
          paddingTop: "calc(env(safe-area-inset-top, 0) + 12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(15,12,25,0.65)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          zIndex: 2,
        }}
      >
        <button
          onClick={() => navigate("/messages")}
          className="p-2 -m-2 rounded-full transition-colors hover:bg-white/5 active:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>

        {isGroup && group ? (
          <button
            onClick={() => navigate(`/group/${id}`)}
            className="flex items-center gap-3 min-w-0 flex-1 text-left"
          >
            <GroupAvatar group={group} members={group.members} size={40} />
            <div className="min-w-0">
              <div className="text-warm font-semibold text-[15px] truncate">
                {group.name}
              </div>
              <div className="text-xs text-warm-mute truncate">
                {group.members?.length || 1} member
                {(group.members?.length || 1) !== 1 ? "s" : ""}
              </div>
            </div>
          </button>
        ) : other ? (
          <Link
            to={`/u/${other.username}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full"
                style={{
                  background: other.avatar_url
                    ? `url(${other.avatar_url}) center/cover`
                    : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                }}
              />
              <motion.div
                className="absolute -inset-0.5 rounded-full pointer-events-none"
                style={{
                  border: "2px solid rgba(10,132,255,0.4)",
                }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-warm font-semibold text-[15px] truncate">
                {other.display_name || other.username}
              </div>
              <div className="text-xs text-warm-mute truncate">
                Active now
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 text-warm-mute text-sm">Loading...</div>
        )}
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
          background: "rgba(15,12,25,0.7)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
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
