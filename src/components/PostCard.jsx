import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2, Flag } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import CommentSheet from "./CommentSheet.jsx";
import ReportModal from "./ReportModal.jsx";
import StatusRing from "./StatusRing.jsx";
import StatusViewer from "./StatusViewer.jsx";
import { useStatusContext } from "../context/StatusContext.jsx";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PostCard({ post, onLike, onSave, onRepost, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { groups, getStatusFor, reload } = useStatusContext();
  const statusInfo = getStatusFor(post.author_id);
  const isOwn = post.author_id === user?.id;

  const stop = (e) => e.stopPropagation();

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(`/post/${post.id}`);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleCardClick}
        className="w-full cursor-pointer transition-colors duration-200 hover:bg-white/[0.015]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-4 pb-3">
          <Link
            to={`/u/${post.author?.username}`}
            onClick={stop}
            className="flex items-center gap-3 min-w-0"
          >
            <StatusRing
              src={post.author?.avatar_url}
              size={42}
              hasStatus={statusInfo.hasStatus}
              hasUnseen={statusInfo.hasUnseen}
              fallbackInitial={
                post.author?.display_name || post.author?.username || "?"
              }
              onClick={(e) => {
                if (statusInfo.hasStatus) {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewerOpen(true);
                }
              }}
            />
            <div className="min-w-0">
              <div className="text-warm font-semibold text-[14.5px] truncate">
                {post.author?.display_name || post.author?.username}
              </div>
              <div className="text-[12.5px] text-warm-mute truncate">
                @{post.author?.username} · {timeAgo(post.created_at)}
              </div>
            </div>
          </Link>

          {isOwn ? (
            <button
              onClick={(e) => {
                stop(e);
                onDelete(post);
              }}
              className="p-2 -m-1 rounded-full hover:bg-white/5 transition-colors shrink-0"
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4 text-warm-mute" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                stop(e);
                setReportOpen(true);
              }}
              className="p-2 -m-1 rounded-full hover:bg-white/5 transition-colors shrink-0"
              aria-label="Report post"
            >
              <Flag className="w-3.5 h-3.5 text-warm-mute" />
            </button>
          )}
        </div>

        {post.body && (
          <p className="text-warm whitespace-pre-wrap break-words px-4 sm:px-6 pb-3 text-[15.5px] leading-[1.6]">
            {post.body}
          </p>
        )}

        {post.image_url && (
          <div className="w-full mb-3 bg-black/20">
            <img
              src={post.image_url}
              alt=""
              className="w-full max-h-[600px] object-cover block"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center gap-1 px-2 sm:px-4 pb-2">
          <ActionButton
            icon={Heart}
            count={post.likes_count}
            active={post.liked}
            activeColor="var(--danger)"
            onClick={(e) => {
              stop(e);
              onLike(post);
            }}
            aria="Like"
          />
          <ActionButton
            icon={MessageCircle}
            count={post.comments_count}
            onClick={(e) => {
              stop(e);
              setCommentsOpen(true);
            }}
            aria="Comment"
          />
          <ActionButton
            icon={Repeat2}
            count={post.reposts_count}
            active={post.reposted}
            activeColor="var(--success)"
            onClick={(e) => {
              stop(e);
              onRepost?.(post);
            }}
            aria="Repost"
          />
          <div className="flex-1" />
          <ActionButton
            icon={Bookmark}
            active={post.saved}
            activeColor="var(--violet)"
            onClick={(e) => {
              stop(e);
              onSave(post);
            }}
            aria="Save"
            noCount
          />
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

function ActionButton({ icon: Icon, count, active, activeColor = "var(--accent)", onClick, aria, noCount }) {
  const [hover, setHover] = useState(false);
  const color = active ? activeColor : hover ? "rgba(240,240,245,0.95)" : "rgba(240,240,245,0.6)";

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors"
      style={{
        background: hover ? "rgba(255,255,255,0.05)" : "transparent",
        color,
      }}
      aria-label={aria}
    >
      <Icon
        className="w-[18px] h-[18px] transition-colors"
        style={{
          fill: active ? activeColor : "none",
          stroke: color,
        }}
      />
      {!noCount && count > 0 && (
        <span className="text-[12.5px] font-medium tabular-nums">{count}</span>
      )}
    </motion.button>
  );
}
