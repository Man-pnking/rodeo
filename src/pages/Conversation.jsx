import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useConversationMeta } from "../hooks/useConversationMeta";
import ConversationHeader from "../components/conversation/ConversationHeader.jsx";
import MessageList from "../components/conversation/MessageList.jsx";
import MessageInput from "../components/MessageInput.jsx";

export default function Conversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { kind, other, group } = useConversationMeta(id, user?.id);
  const isGroup = kind === "group";

  const { messages = [], loading, send } = useMessages(
    isGroup ? { groupId: id } : { conversationId: id },
    user?.id
  );

  // "chat-route" class lets the shell hide chrome while in a chat
  useEffect(() => {
    document.body.classList.add("chat-route");
    return () => document.body.classList.remove("chat-route");
  }, []);

  return (
    <div
      className="w-full flex flex-col"
      style={{
        height: "100dvh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <ConversationHeader
        kind={kind}
        other={other}
        group={group}
        onBack={() => navigate("/messages")}
      />

      <MessageList
        messages={messages}
        loading={loading}
        userId={user?.id}
        isGroup={isGroup}
        group={group}
      />

      <div
        className="shrink-0"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0)",
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
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
