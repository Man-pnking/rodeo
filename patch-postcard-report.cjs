const fs = require("fs");
const p = "src/components/PostCard.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("ReportModal") === -1) {
  s = s.replace(
    'import ParallaxLayer from "./ParallaxLayer.jsx";',
    'import ReportModal from "./ReportModal.jsx";\nimport { Flag } from "lucide-react";'
  );

  s = s.replace(
    "const [commentsOpen, setCommentsOpen] = useState(false);",
    "const [commentsOpen, setCommentsOpen] = useState(false);\n  const [reportOpen, setReportOpen] = useState(false);"
  );

  // Add Flag button next to trash for non-own posts
  s = s.replace(
    `          {isOwn && (
            <button
              onClick={() => onDelete(post)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors shrink-0"
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4 text-warm-mute" />
            </button>
          )}`,
    `          {isOwn ? (
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
          )}`
  );

  // Add ReportModal at the end
  s = s.replace(
    `      <CommentSheet
        open={commentsOpen}
        post={post}
        onClose={() => setCommentsOpen(false)}
      />`,
    `      <CommentSheet
        open={commentsOpen}
        post={post}
        onClose={() => setCommentsOpen(false)}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />`
  );
}

fs.writeFileSync(p, s);
console.log("PostCard.jsx report wired");
