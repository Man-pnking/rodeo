import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useComments } from "../hooks/useComments";
import { useFeed } from "../hooks/useFeed";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function CommentSheet({ open, post, onClose }) {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { comments, loading } = useComments(post?.id);
  const { addComment } = useFeed(user?.id);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    await addComment(post.id, body);
    setBody("");
    setSending(false);
    setTimeout(() => window.location.reload(), 300);
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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-16 md:inset-x-auto md:right-4 md:left-auto md:top-1/2 md:-translate-y-1/2 md:w-[440px] md:rounded-3xl rounded-t-3xl z-50 flex flex-col safe-bottom"
            style={{ background: "var(--bg-soft)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h3 className="display-md">Comments</h3>
              <button onClick={onClose} className="p-2 -m-2" aria-label="Close">
                <X className="w-5 h-5 text-warm-mute" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && <div className="text-warm-mute text-sm text-center py-6">Loading...</div>}

              {!loading && comments.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-body text-sm">No comments yet. Be the first.</p>
                </div>
              )}

              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 py-3">
                  <div
                    className="w-8 h-8 rounded-full shrink-0"
                    style={{
                      background: c.author?.avatar_url
                        ? `url(${c.author.avatar_url}) center/cover`
                        : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-warm-mute mb-1">
                      <span className="text-warm font-medium">
                        {c.author?.display_name || c.author?.username}
                      </span>{" "}
                      · {timeAgo(c.created_at)}
                    </div>
                    <p className="text-sm text-warm break-words">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/8 px-6 py-4 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{
                  background: profile?.avatar_url
                    ? `url(${profile.avatar_url}) center/cover`
                    : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                }}
              />
              <input
                type="text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="flex-1 bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none text-sm"
              />
              <button
                onClick={submit}
                disabled={!body.trim() || sending}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                  opacity: !body.trim() || sending ? 0.4 : 1,
                }}
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
