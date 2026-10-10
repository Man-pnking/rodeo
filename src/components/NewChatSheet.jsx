import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MessageCircle, UserPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFriendships } from "../hooks/useFriendships";
import { useConversations } from "../hooks/useConversations";
import { supabase } from "../lib/supabase";

export default function NewChatSheet({ open, onClose }) {
  const { user } = useAuth();
  const { friends, loading: friendsLoading } = useFriendships(user?.id);
  const { getOrCreate } = useConversations(user?.id);
  const [query, setQuery] = useState("");
  const [starting, setStarting] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [searching, setSearching] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setAllUsers([]);
      setSearching(false);
    }
  }, [open]);

  // Search all users when query >= 2 chars
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setAllUsers([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .neq("id", user?.id)
        .limit(20);

      if (cancelled) return;
      const friendIds = new Set(friends.map((f) => f.id));
      setAllUsers((data || []).filter((u) => !friendIds.has(u.id)));
      setSearching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [query, friends, user?.id]);

  // Friends filtered by query (shown when typing too)
  const filteredFriends = friends.filter((f) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (f.username || "").toLowerCase().includes(q) ||
      (f.display_name || "").toLowerCase().includes(q)
    );
  });

  const handlePick = async (person) => {
    if (starting) return;
    setStarting(person.id);
    const { id, error } = await getOrCreate(person.id);
    setStarting(null);
    if (error) {
      alert(error);
      return;
    }
    onClose();
    window.location.assign(`/messages/${id}`);
  };

  const showFriendsSection = filteredFriends.length > 0;
  const showUsersSection = allUsers.length > 0;
  const showEmpty = !friendsLoading && !searching && !showFriendsSection && !showUsersSection;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 rounded-t-3xl md:rounded-3xl safe-bottom"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5" style={{ flexShrink: 0 }}>
              <h2 className="text-[20px] font-bold" style={{ color: "var(--text-primary)" }}>
                New chat
              </h2>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-full hover:bg-white/5"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div className="px-6 pb-4" style={{ flexShrink: 0 }}>
              <div className="relative">
                <Search
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search people by name or username..."
                  autoFocus
                  className="w-full px-4 pl-9 py-3 rounded-2xl text-[14px] outline-none transition-colors"
                  style={{
                    background: "var(--bg-soft)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ minHeight: 0 }}>
              {friendsLoading && (
                <div className="text-sm py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
                  Loading...
                </div>
              )}

              {/* Friends section */}
              {showFriendsSection && (
                <div className="mb-2">
                  <div
                    className="px-2 py-2 text-[11px] font-semibold uppercase"
                    style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}
                  >
                    Friends
                  </div>
                  {filteredFriends.map((friend) => (
                    <PersonRow
                      key={friend.id}
                      person={friend}
                      starting={starting === friend.id}
                      onPick={handlePick}
                    />
                  ))}
                </div>
              )}

              {/* All users section (non-friends) */}
              {showUsersSection && (
                <div className="mb-2">
                  <div
                    className="px-2 py-2 text-[11px] font-semibold uppercase"
                    style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}
                  >
                    Others
                  </div>
                  {allUsers.map((u) => (
                    <PersonRow
                      key={u.id}
                      person={u}
                      starting={starting === u.id}
                      onPick={handlePick}
                      isNew
                    />
                  ))}
                </div>
              )}

              {searching && (
                <div className="text-xs py-3 text-center" style={{ color: "var(--text-tertiary)" }}>
                  Searching...
                </div>
              )}

              {showEmpty && (
                <div className="text-center py-12">
                  <MessageCircle
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                    {query ? "No one matches that search." : "No friends yet."}
                  </p>
                  <p className="text-[12px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                    {query
                      ? "Try a different name or username."
                      : "Search anyone by name or username to start chatting."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PersonRow({ person, starting, onPick, isNew }) {
  return (
    <button
      onClick={() => onPick(person)}
      disabled={starting}
      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl text-left transition-colors hover:bg-white/[0.03] disabled:opacity-50"
    >
      <div
        className="w-11 h-11 rounded-full shrink-0"
        style={{
          background: person.avatar_url
            ? `url(${person.avatar_url}) center/cover`
            : "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
          {person.display_name || person.username}
        </div>
        <div className="text-[12.5px] truncate" style={{ color: "var(--text-tertiary)" }}>
          @{person.username}
          {isNew && " · new"}
        </div>
      </div>
      {starting ? (
        <div className="text-[11px] shrink-0" style={{ color: "var(--accent)" }}>
          Opening...
        </div>
      ) : isNew ? (
        <UserPlus className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
      ) : null}
    </button>
  );
}
