import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Heart, MessageCircle, Bookmark, Repeat2,
  Trash2, Send, Loader2, MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { usePost } from "../hooks/usePost";
import { useProfile } from "../hooks/useProfile";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  if (diff < 604800) return Math.floor(diff / 86400) + "d";
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const {
    post, comments, loading, error,
    toggleLike, toggleSave, toggleRepost,
    addComment, deleteComment, deletePost,
  } = usePost(id, user?.id);

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleComment = async () => {
    if (!draft.trim() || posting) return;
    setPosting(true);
    const { error } = await addComment(draft);
    setPosting(false);
    if (!error) setDraft("");
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    await deletePost();
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-warm-mute animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-warm-mute text-sm">{error || "Post not found"}</p>
        <button onClick={() => navigate(-1)} className="text-iri-pink text-sm font-medium">
          Go back
        </button>
      </div>
    );
  }

  const isOwner = user?.id === post.author_id;

  return (
    <div className="min-h-screen pb-24">
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(15,12,25,0.75)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="text-warm font-semibold text-[16px] flex-1">Post</h1>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="More">
              <MoreHorizontal className="w-5 h-5 text-warm" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(28,22,42,0.98)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    minWidth: 160,
                  }}
                >
                  <button onClick={handleDelete} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                    Delete post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <Link to={"/u/" + post.author?.username} className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-full shrink-0"
            style={{
              background: post.author?.avatar_url
                ? "url(" + post.author.avatar_url + ") center/cover"
                : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
            }}
          />
          <div className="min-w-0">
            <div className="text-warm font-semibold text-sm truncate">
              {post.author?.display_name || post.author?.username}
            </div>
            <div className="text-warm-mute text-xs truncate">
              @{post.author?.username} · {timeAgo(post.created_at)}
            </div>
          </div>
        </Link>

        {post.body && (
          <p className="text-warm text-[17px] leading-relaxed whitespace-pre-wrap break-words mb-4">
            {post.body}
          </p>
        )}

        {post.image_url && (
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={post.image_url}
            alt=""
            className="rounded-2xl w-full mb-4"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          />
        )}

        <div className="flex items-center gap-1 py-3 mb-4 border-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <ActionButton icon={Heart} count={post.likes_count || 0} active={post.liked} activeColor="var(--danger)" onClick={toggleLike} />
          <ActionButton icon={MessageCircle} count={post.comments_count || 0} onClick={() => document.getElementById("comment-input")?.focus()} />
          <ActionButton icon={Repeat2} count={post.reposts_count || 0} active={post.reposted} activeColor="#10b981" onClick={toggleRepost} />
          <ActionButton icon={Bookmark} active={post.saved} activeColor="var(--accent)" onClick={toggleSave} />
        </div>

        <div>
          <h2 className="text-warm font-semibold text-sm mb-4">
            Comments ({comments.length})
          </h2>

          {comments.length === 0 && (
            <p className="text-warm-mute text-sm text-center py-6">
              No comments yet. Be the first.
            </p>
          )}

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((c) => {
                const canDelete = user?.id === c.user_id;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 group"
                  >
                    <Link
                      to={"/u/" + c.author?.username}
                      className="w-8 h-8 rounded-full shrink-0"
                      style={{
                        background: c.author?.avatar_url
                          ? "url(" + c.author.avatar_url + ") center/cover"
                          : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-warm text-xs font-semibold">
                          {c.author?.display_name || c.author?.username}
                        </span>
                        <span className="text-warm-mute text-[10px]">{timeAgo(c.created_at)}</span>
                        {canDelete && (
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-warm-mute hover:text-red-400"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-warm text-sm leading-snug whitespace-pre-wrap break-words mt-0.5">
                        {c.body}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {user ? (
        <div
          className="fixed inset-x-0 bottom-0 z-20 px-4 py-3"
          style={{
            background: "rgba(15,12,25,0.85)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 12px)",
          }}
        >
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full shrink-0"
              style={{
                background: profile?.avatar_url
                  ? "url(" + profile.avatar_url + ") center/cover"
                  : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
              }}
            />
            <div
              className="flex-1 rounded-full px-4 py-2"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <input
                id="comment-input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Add a comment..."
                className="w-full bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none text-sm"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleComment}
              disabled={!draft.trim() || posting}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30"
              style={{
                background: draft.trim()
                  ? "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)"
                  : "rgba(255,255,255,0.08)",
              }}
              aria-label="Send"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-x-0 bottom-0 z-20 px-4 py-3 text-center"
          style={{
            background: "rgba(15,12,25,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 12px)",
          }}
        >
          <Link to="/login" className="text-iri-pink text-sm font-medium hover:underline">
            Sign in to comment
          </Link>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, count, active, activeColor = "var(--accent)", onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-white/5 transition-colors"
      aria-label="Action"
    >
      <Icon
        className="w-5 h-5 transition-colors"
        style={{
          color: active ? activeColor : "rgba(240,240,245,0.65)",
          fill: active ? activeColor : "none",
        }}
      />
      {count !== undefined && count > 0 && (
        <span
          className="text-xs font-medium"
          style={{ color: active ? activeColor : "rgba(240,240,245,0.65)" }}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
