import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useConversations } from "../hooks/useConversations";
import { useGroups } from "../hooks/useGroups";
import GroupAvatar from "../components/GroupAvatar.jsx";
import NewChatSheet from "../components/NewChatSheet.jsx";
import CreateGroupSheet from "../components/CreateGroupSheet.jsx";

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading: convLoading } = useConversations(user?.id);
  const { groups, loading: groupLoading } = useGroups(user?.id);
  const loading = convLoading || groupLoading;
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [query, setQuery] = useState("");

  const mergedItems = useMemo(() => {
    return [
      ...conversations.map((c) => ({
        type: "dm",
        id: c.id,
        to: `/messages/${c.id}`,
        avatar: c.other?.avatar_url,
        name: c.other?.display_name || c.other?.username || "Unknown",
        sub: c.other?.username,
        lastMessage: c.lastMessage,
        lastAt: c.lastMessage?.created_at || c.last_message_at,
        unread: c.unread,
      })),
      ...groups.map((g) => ({
        type: "group",
        id: g.id,
        to: `/messages/${g.id}`,
        group: g,
        name: g.name,
        sub: `${g.members?.length || 1} members`,
        lastMessage: g.lastMessage,
        lastAt: g.lastMessage?.created_at || g.updated_at,
        unread: g.unread,
      })),
    ].sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
  }, [conversations, groups]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return mergedItems;
    const q = query.toLowerCase();
    return mergedItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.sub?.toLowerCase().includes(q) ||
        item.lastMessage?.body?.toLowerCase().includes(q)
    );
  }, [mergedItems, query]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1
          className="text-[28px] font-bold tracking-tight"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.022em" }}
        >
          Contact
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setNewChatOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--text-primary)" }}
            aria-label="Search contacts"
          >
            <Search className="w-[20px] h-[20px]" strokeWidth={2} />
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNewGroupOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
            aria-label="New chat"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl"
          style={{ background: "var(--bg-soft)" }}
        >
          <Search
            className="w-[18px] h-[18px] shrink-0"
            style={{ color: "var(--text-tertiary)" }}
            strokeWidth={2}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for contacts"
            className="w-full bg-transparent border-0 outline-none text-[15px]"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="text-center py-16 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          Loading...
        </div>
      )}

      {/* Empty state */}
      {!loading && mergedItems.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle
            className="w-10 h-10 mx-auto mb-4"
            style={{ color: "var(--text-tertiary)" }}
          />
          <h3
            className="text-[18px] font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No conversations yet
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Start chatting with your friends.
          </p>
          <button
            onClick={() => setNewChatOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New chat
          </button>
        </div>
      )}

      {/* No search results */}
      {!loading && mergedItems.length > 0 && filteredItems.length === 0 && (
        <div
          className="text-center py-16 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          No results for "{query}"
        </div>
      )}

      {/* List */}
      {!loading && filteredItems.length > 0 && (
        <div className="flex flex-col">
          {filteredItems.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.to}
              className="flex items-center gap-3.5 py-3.5 transition-colors rounded-2xl -mx-2 px-2"
              style={{ color: "var(--text-primary)" }}
            >
              {item.type === "group" ? (
                <GroupAvatar
                  group={item.group}
                  members={item.group.members}
                  size={48}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full shrink-0"
                  style={{
                    background: item.avatar
                      ? `url(${item.avatar}) center/cover`
                      : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                  }}
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-semibold text-[15px] truncate">
                    {item.name}
                  </div>
                  <div
                    className="text-[11.5px] shrink-0 tabular-nums"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {timeAgo(item.lastAt)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 mt-0.5">
                  <div
                    className="text-[13.5px] truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.lastMessage?.image_url && !item.lastMessage?.body
                      ? "📷 Photo"
                      : item.lastMessage?.body ||
                        (item.type === "group"
                          ? "Group created"
                          : "Start the conversation")}
                  </div>
                  {item.unread > 0 && (
                    <span
                      className="shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold px-1.5"
                      style={{
                        background: "var(--accent)",
                        color: "var(--accent-fg)",
                      }}
                    >
                      {item.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewChatSheet open={newChatOpen} onClose={() => setNewChatOpen(false)} />
      <CreateGroupSheet
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        onCreated={(gid) => navigate(`/messages/${gid}`)}
      />
    </div>
  );
}
