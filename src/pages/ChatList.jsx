import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useConversations } from "../hooks/useConversations";
import NewChatSheet from "../components/NewChatSheet.jsx";
import SlideIn from "../components/SlideIn.jsx";

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function ChatList() {
  const { user } = useAuth();
  const { conversations, loading } = useConversations(user?.id);
  const [newChatOpen, setNewChatOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <SlideIn variant="up">
        <div className="flex items-center justify-between mb-6">
          <h1 className="display-lg">Messages</h1>
          <button
            onClick={() => setNewChatOpen(true)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #ff6ec7 0%, #a855f7 50%, #3b82f6 100%)",
              boxShadow: "0 8px 24px rgba(168, 85, 247, 0.4)",
            }}
            aria-label="New chat"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </SlideIn>

      {loading && (
        <div className="text-center py-16 text-warm-mute text-sm">Loading...</div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle className="w-10 h-10 text-warm-mute mx-auto mb-4" />
          <h3 className="display-md mb-2 text-warm">No messages yet</h3>
          <p className="text-body mb-6">Start a conversation with a friend.</p>
          <button
            onClick={() => setNewChatOpen(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>
      )}

      {!loading && conversations.length > 0 && (
        <div>
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/messages/${c.id}`}
              className="flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-xl"
            >
              <div
                className="w-12 h-12 rounded-full shrink-0"
                style={{
                  background: c.other?.avatar_url
                    ? `url(${c.other.avatar_url}) center/cover`
                    : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="text-warm font-medium truncate">
                    {c.other?.display_name || c.other?.username}
                  </div>
                  <div className="text-xs text-warm-mute shrink-0">
                    {timeAgo(c.lastMessage?.created_at || c.last_message_at)}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm text-warm-mute truncate">
                    {c.lastMessage?.image_url && !c.lastMessage?.body
                      ? "📷 Photo"
                      : c.lastMessage?.body || "Start the conversation"}
                  </div>
                  {c.unread > 0 && (
                    <span
                      className="shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold px-1.5 text-white"
                      style={{ background: "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)" }}
                    >
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewChatSheet open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </div>
  );
}
