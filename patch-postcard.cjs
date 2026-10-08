const fs = require("fs");
const p = "src/components/PostCard.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("StatusRing") === -1) {
  s = s.replace(
    'import CommentSheet from "./CommentSheet.jsx";',
    'import CommentSheet from "./CommentSheet.jsx";\nimport StatusRing from "./StatusRing.jsx";\nimport StatusViewer from "./StatusViewer.jsx";\nimport { useStatusContext } from "../context/StatusContext.jsx";'
  );
}

s = s.replace(
  "  const [commentsOpen, setCommentsOpen] = useState(false);",
  "  const [commentsOpen, setCommentsOpen] = useState(false);\n  const [viewerOpen, setViewerOpen] = useState(false);\n  const { groups, getStatusFor, reload } = useStatusContext();\n  const statusInfo = getStatusFor(post.author_id);"
);

const oldAvatar = `<div
              className="w-10 h-10 rounded-full shrink-0"
              style={{
                background: post.author?.avatar_url
                  ? \`url(\${post.author.avatar_url}) center/cover\`
                  : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
              }}
            />`;

const newAvatar = `<StatusRing
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
            />`;

if (s.indexOf(oldAvatar) !== -1) {
  s = s.replace(oldAvatar, newAvatar);
  console.log("avatar replaced");
} else {
  console.log("avatar block NOT FOUND");
}

const beforeClose = `    </>
  );
}`;

const withViewer = `      {viewerOpen && statusInfo.group && (
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
}`;

if (s.indexOf(beforeClose) !== -1) {
  s = s.replace(beforeClose, withViewer);
  console.log("viewer added");
} else {
  console.log("close block NOT FOUND");
}

fs.writeFileSync(p, s);
console.log("PostCard.jsx written");
