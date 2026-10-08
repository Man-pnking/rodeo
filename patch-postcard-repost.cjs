const fs = require("fs");
const p = "src/components/PostCard.jsx";
let s = fs.readFileSync(p, "utf8");

// Add Repeat icon import
s = s.replace(
  'import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";',
  'import { Heart, MessageCircle, Bookmark, Trash2, Repeat2 } from "lucide-react";'
);

// Accept onRepost prop
s = s.replace(
  "export default function PostCard({ post, onLike, onSave, onDelete }) {",
  "export default function PostCard({ post, onLike, onSave, onRepost, onDelete }) {"
);

// Insert repost button before the save button
s = s.replace(
  `          <button
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
          </button>`,
  `          <button
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
          </button>`
);

fs.writeFileSync(p, s);
console.log("PostCard.jsx patched");
