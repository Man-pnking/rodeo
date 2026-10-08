import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MessageCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFriendships } from "../hooks/useFriendships";
import { useConversations } from "../hooks/useConversations";

export default function NewChatSheet({ open, onClose }) {
  const { user } = useAuth();
  const { friends, loading } = useFriendships(user?.id);
  const { getOrCreate } = useConversations(user?.id);
  const [query, setQuery] = useState("");
  const [starting, setStarting] = useState(null);

  const filtered = friends.filter((f) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.username || "").toLowerCase().includes(q) ||
      (f.display_name || "").toLowerCase().includes(q)
    );
  });

  const handlePick = async (friend) => {
    if (starting) return;
    setStarting(friend.id);
    const { id, error } = await getOrCreate(friend.id);
    setStarting(null);
    if (error) {
      alert(error);
      return;
    }
    onClose();
    window.location.href = `/messages/${id}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl safe-bottom"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5" style={{ flexShrink: 0 }}>
              <h2 className="display-md">New chat</h2>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            <div className="px-6 pb-4" style={{ flexShrink: 0 }}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-warm-mute pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search friends..."
                  autoFocus
                  className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pl-9 pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ minHeight: 0 }}>
              {loading && (
                <div className="text-warm-mute text-sm py-8 text-center">Loading friends...</div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-8 h-8 text-warm-mute mx-auto mb-3" />
                  <p className="text-body text-sm">
                    {query ? "No friends match that search." : "No friends yet."}
                  </p>
                  <p className="text-xs text-warm-mute mt-2">
                    Add friends from Discover to start chatting.
                  </p>
                </div>
              )}

              {!loading && filtered.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handlePick(friend)}
                  disabled={starting === friend.id}
                  className="w-full flex items-center gap-3 py-3 hover:bg-white/[0.03] transition-colors -mx-2 px-2 rounded-xl text-left"
                >
                  <div
                    className="w-11 h-11 rounded-full shrink-0"
                    style={{
                      background: friend.avatar_url
                        ? `url(${friend.avatar_url}) center/cover`
                        : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-warm font-medium text-sm truncate">
                      {friend.display_name || friend.username}
                    </div>
                    <div className="text-xs text-warm-mute truncate">@{friend.username}</div>
                  </div>
                  {starting === friend.id && (
                    <div className="text-xs text-iri-pink shrink-0">Opening...</div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
