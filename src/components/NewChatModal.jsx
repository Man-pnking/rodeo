import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MessageCircle, UserPlus, Minus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFriendships } from "../hooks/useFriendships";
import { useConversations } from "../hooks/useConversations";
import { supabase } from "../lib/supabase";

const MODAL_W = 336;
const MODAL_H = 460;
const COLLAPSED_H = 48;

export default function NewChatModal({ open, onClose }) {
  const { user } = useAuth();
  const { friends = [], loading: friendsLoading } = useFriendships(user?.id) || {};
  const { getOrCreate } = useConversations(user?.id) || {};
  const [query, setQuery] = useState("");
  const [starting, setStarting] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setAllUsers([]);
      setSearching(false);
      setMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
        .or("username.ilike.%" + q + "%,display_name.ilike.%" + q + "%")
        .neq("id", user?.id)
        .limit(20);
      if (cancelled) return;
      const friendIds = new Set((friends || []).map((f) => f.id));
      setAllUsers((data || []).filter((u) => !friendIds.has(u.id)));
      setSearching(false);
    })();
    return () => { cancelled = true; };
  }, [query, friends, user?.id]);

  const filteredFriends = (friends || []).filter((f) => {
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
    if (error) { alert(error); return; }
    onClose();
    window.location.assign("/messages/" + id);
  };

  const showFriendsSection = filteredFriends.length > 0;
  const showUsersSection = allUsers.length > 0;
  const showEmpty =
    !friendsLoading && !searching && !showFriendsSection && !showUsersSection;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            height: minimized ? COLLAPSED_H : MODAL_H,
          }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          className="fixed z-[100] hidden md:flex flex-col overflow-hidden"
          style={{
            right: 20,
            bottom: 0,
            width: MODAL_W,
            background: "var(--bg)",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            border: "1px solid var(--border)",
            borderBottom: "none",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.14), 0 -2px 10px rgba(0,0,0,0.06)",
          }}
          role="dialog"
          aria-label="New message"
        >
          <div
            className="flex items-center justify-between px-3 py-2 shrink-0"
            style={{
              borderBottom: minimized ? "none" : "1px solid var(--border)",
              background: "var(--bg)",
              height: COLLAPSED_H,
            }}
          >
            <button
              onClick={() => setMinimized((v) => !v)}
              className="flex items-center gap-2 px-1 py-1 rounded-md transition-colors"
              style={{ color: "var(--text-primary)" }}
              aria-label={minimized ? "Expand" : "Collapse"}
            >
              <span className="text-[14px] font-semibold">New Message</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized((v) => !v)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "var(--text-secondary)" }}
                aria-label={minimized ? "Expand" : "Minimize"}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div className="px-3 pt-3 pb-2 shrink-0">
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold pointer-events-none"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    To:
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a name"
                    className="w-full pl-10 pr-3 py-2 rounded-lg text-[14px] outline-none transition-colors"
                    style={{
                      background: "var(--bg-soft)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pb-3" style={{ minHeight: 0 }}>
                {friendsLoading && (
                  <div className="text-sm py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
                    Loading…
                  </div>
                )}

                {showFriendsSection && (
                  <div className="mb-2">
                    <div
                      className="px-2 pt-2 pb-1 text-[10.5px] font-semibold uppercase"
                      style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}
                    >
                      Friends
                    </div>
                    {filteredFriends.map((f) => (
                      <PersonRow
                        key={f.id}
                        person={f}
                        starting={starting === f.id}
                        onPick={handlePick}
                      />
                    ))}
                  </div>
                )}

                {showUsersSection && (
                  <div className="mb-2">
                    <div
                      className="px-2 pt-2 pb-1 text-[10.5px] font-semibold uppercase"
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
                    Searching…
                  </div>
                )}

                {showEmpty && (
                  <div className="text-center py-10">
                    <MessageCircle
                      className="w-7 h-7 mx-auto mb-2"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {query ? "No one matches that search." : "No friends yet."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PersonRow({ person, starting, onPick, isNew }) {
  return (
    <button
      onClick={() => onPick(person)}
      disabled={starting}
      className="w-full flex items-center gap-3 py-2 px-2 rounded-lg text-left transition-colors disabled:opacity-50"
      style={{ color: "var(--text-primary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="w-9 h-9 rounded-full shrink-0"
        style={{
          background: person.avatar_url
            ? "url(" + person.avatar_url + ") center/cover"
            : "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium truncate">
          {person.display_name || person.username}
        </div>
        <div className="text-[12px] truncate" style={{ color: "var(--text-tertiary)" }}>
          @{person.username}
          {isNew && " · new"}
        </div>
      </div>
      {starting ? (
        <div className="text-[11px] shrink-0" style={{ color: "var(--accent)" }}>
          Opening…
        </div>
      ) : isNew ? (
        <UserPlus className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
      ) : null}
    </button>
  );
}
