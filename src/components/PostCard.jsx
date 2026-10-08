import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import CommentSheet from "./CommentSheet.jsx";
import ReportModal from "./ReportModal.jsx";
import { Flag } from "lucide-react";
import StatusRing from "./StatusRing.jsx";
import StatusViewer from "./StatusViewer.jsx";
import { useStatusContext } from "../context/StatusContext.jsx";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function PostCard({ post, onLike, onSave, onRepost, onDelete }) {
  const { user } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { groups, getStatusFor, reload } = useStatusContext();
  const statusInfo = getStatusFor(post.author_id);
  const isOwn = post.author_id === user?.id;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="py-6"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link to={`/u/${post.author?.username}`} className="flex items-center gap-3 min-w-0">
            <StatusRing
              src={post.author?.avatar_url}
              size={40}
              hasStatus={statusInfo.hasStatus}
              hasUnseen={statusInfo.hasUnseen}
              fallbackInitial={post.author?.display_name || post.author?.username || "?"}
              onClick={(e) => {
                if (statusInfo.hasStatus) {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewerOpen(true);
                }
              }}
            />
            <div className="min-w-0">
              <div className="text-warm font-semibold text-sm truncate">
                {post.author?.display_name || post.author?.username}
              </div>
              <div className="text-xs text-warm-mute truncate">
                @{post.author?.username} · {timeAgo(post.created_at)}
              </div>
            </div>
          </Link>

          {isOwn ? (
            <button
              onClick={() => onDelete(post)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors shrink-0"
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4 text-warm-mute" />
            </button>
          ) : (
            <button
              onClick={() => setReportOpen(true)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors shrink-0"
              aria-label="Report post"
            >
              <Flag className="w-3.5 h-3.5 text-warm-mute" />
            </button>
          )}
        </div>

        {post.body && (
          <p className="text-warm whitespace-pre-wrap mb-3 text-[15px] leading-relaxed">
            {post.body}
          </p>
        )}

        {post.image_url && (
          <div className="rounded-2xl overflow-hidden mb-4">
            <img
              src={post.image_url}
              alt=""
              className="w-full max-h-[500px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center gap-6 text-warm-mute">
          <button
            onClick={() => onLike(post)}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: post.liked ? "#ff6ec7" : undefined }}
            aria-label="Like"
          >
            <Heart
              className="w-4 h-4"
              fill={post.liked ? "#ff6ec7" : "none"}
              stroke={post.liked ? "#ff6ec7" : "currentColor"}
            />
            <span>{post.likes_count || 0}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(true)}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-warm"
            aria-label="Comment"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count || 0}</span>
          </button>

          <button
            onClick={() => onRepost?.(post)}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: post.reposted ? "#22c55e" : undefined }}
            aria-label="Repost"
          >
            <Repeat2
              className="w-4 h-4"
              stroke={post.reposted ? "#22c55e" : "currentColor"}
            />
            {(post.reposts_count || 0) > 0 && <span>{post.reposts_count}</span>}
          </button>

          <button
            onClick={() => onSave(post)}
            className="flex items-center gap-1.5 text-xs ml-auto transition-colors"
            style={{ color: post.saved ? "#a855f7" : undefined }}
            aria-label="Save"
          >
            <Bookmark
              className="w-4 h-4"
              fill={post.saved ? "#a855f7" : "none"}
              stroke={post.saved ? "#a855f7" : "currentColor"}
            />
          </button>
        </div>
      </motion.article>

      <CommentSheet
        open={commentsOpen}
        post={post}
        onClose={() => setCommentsOpen(false)}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />
      {viewerOpen && statusInfo.group && (
        <StatusViewer
          groups={groups}
          startIndex={groups.indexOf(statusInfo.group)}
          onClose={() => {
            setViewerOpen(false);
            reload();
          }}
        />
      )}
    </>
  );
}
