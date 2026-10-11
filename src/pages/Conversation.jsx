import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useConversationMeta } from "../hooks/useConversationMeta";
import ConversationShell from "../components/conversation/ConversationShell.jsx";
import ConversationHeader from "../components/conversation/ConversationHeader.jsx";
import MessageList from "../components/conversation/MessageList.jsx";
import Composer from "../components/conversation/Composer.jsx";

export default function Conversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { kind, other, group } = useConversationMeta(id, user?.id);
  const isGroup = kind === "group";

  const { messages, loading, error, reload, send } = useMessages(
    isGroup ? { groupId: id } : { conversationId: id },
    user?.id
  );

  return (
    <ConversationShell
      header={
        <ConversationHeader
          kind={kind}
          other={other}
          group={group}
          onBack={() => navigate("/messages")}
        />
      }
      composer={
        <Composer
          onSend={(body, imageUrl) => send(body, imageUrl)}
          disabled={loading}
        />
      }
    >
      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        onRetry={reload}
        userId={user?.id}
        isGroup={isGroup}
        group={group}
      />
    </ConversationShell>
  );
}
