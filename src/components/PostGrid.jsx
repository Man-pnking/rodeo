import { motion } from "framer-motion";
import { Heart, MessageCircle, Image as ImageIcon } from "lucide-react";

export default function PostGrid({ posts, onOpenPost }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {posts.map((post, idx) => {
        const hasImage = !!post.image_url;
        const hasBody = !!post.body?.trim();

        return (
          <motion.button
            key={post.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(idx * 0.02, 0.3), duration: 0.25 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenPost?.(post)}
            className="relative aspect-square overflow-hidden group"
            style={{
              background: "var(--bg-card)",
              border: "none",
            }}
          >
            {/* Image post */}
            {hasImage && (
              <img
                src={post.image_url}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}

            {/* Text-only post */}
            {!hasImage && hasBody && (
              <div
                className="absolute inset-0 flex items-center justify-center p-2.5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,110,199,0.10) 0%, rgba(168,85,247,0.10) 100%)",
                }}
              >
                <p className="text-[11px] leading-snug text-warm text-center line-clamp-5">
                  {post.body}
                </p>
              </div>
            )}

            {/* Multi-image badge */}
            {hasImage && hasBody && (
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                <ImageIcon className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Hover overlay with stats */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <div className="flex items-center gap-1 text-white text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-white" />
                {post.likes_count || 0}
              </div>
              <div className="flex items-center gap-1 text-white text-xs font-semibold">
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                {post.comments_count || 0}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
