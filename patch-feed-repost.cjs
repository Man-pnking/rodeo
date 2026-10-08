const fs = require("fs");
const p = "src/pages/Feed.jsx";
let s = fs.readFileSync(p, "utf8");

// Destructure toggleRepost
s = s.replace(
  "const { posts, loading, toggleLike, toggleSave, deletePost, reload } = useFeed(user?.id);",
  "const { posts, loading, toggleLike, toggleSave, toggleRepost, deletePost, reload } = useFeed(user?.id);"
);

// Pass onRepost to PostCard
s = s.replace(
  `            <PostCard
              key={post.id}
              post={post}
              onLike={toggleLike}
              onSave={toggleSave}
              onDelete={deletePost}
            />`,
  `            <PostCard
              key={post.id}
              post={post}
              onLike={toggleLike}
              onSave={toggleSave}
              onRepost={toggleRepost}
              onDelete={deletePost}
            />`
);

fs.writeFileSync(p, s);
console.log("Feed.jsx patched");
