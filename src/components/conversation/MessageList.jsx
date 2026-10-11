import MessageBubble from "./MessageBubble.jsx";
import DayDivider from "./DayDivider.jsx";
import EmptyState from "./EmptyState.jsx";
import LoadingState from "./LoadingState.jsx";
import ErrorState from "./ErrorState.jsx";
import { sameDay } from "../../lib/formatTime";
import { useAutoScroll } from "../../hooks/useAutoScroll";

function getPosition(prev, next, senderId) {
  const sameAsPrev = prev && prev.sender_id === senderId;
  const sameAsNext = next && next.sender_id === senderId;
  if (!sameAsPrev && !sameAsNext) return "single";
  if (!sameAsPrev && sameAsNext) return "first";
  if (sameAsPrev && sameAsNext) return "middle";
  if (sameAsPrev && !sameAsNext) return "last";
  return "single";
}

export default function MessageList({
  messages = [],
  loading,
  error,
  onRetry,
  userId,
  isGroup,
  group,
}) {
  const scrollRef = useAutoScroll(messages.length);
  const list = Array.isArray(messages) ? messages : [];

  return (
    <div
      ref={scrollRef}
      className="px-4 py-5"
      style={{
        overflowY: "auto",
        minHeight: 0,
        background:
          "radial-gradient(ellipse at 50% 0%, var(--accent-soft) 0%, transparent 60%)",
      }}
    >
      {loading && <LoadingState />}

      {!loading && error && (
        <ErrorState message={error} onRetry={onRetry} />
      )}

      {!loading && !error && list.length === 0 && <EmptyState />}

      {!loading &&
        !error &&
        list.map((m, idx) => {
          const prev = list[idx - 1];
          const next = list[idx + 1];
          const showDay = !prev || !sameDay(prev.created_at, m.created_at);
          const position = getPosition(prev, next, m.sender_id);

          const senderMember = isGroup
            ? group?.members?.find((gm) => gm.user_id === m.sender_id)
            : null;
          const senderName =
            senderMember?.profile?.display_name ||
            senderMember?.profile?.username;

          return (
            <div key={m.id}>
              {showDay && <DayDivider date={m.created_at} />}
              <MessageBubble
                message={m}
                isOwn={m.sender_id === userId}
                senderName={senderName}
                showSender={isGroup && position === "first"}
                position={position}
              />
            </div>
          );
        })}
    </div>
  );
}
