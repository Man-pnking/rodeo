const fs = require("fs");
const p = "src/hooks/useFeed.js";
let s = fs.readFileSync(p, "utf8");

// Load repost state alongside liked/saved
s = s.replace(
  `    let likedIds = new Set();
    let savedIds = new Set();

    if (userId && data?.length) {
      const postIds = data.map((p) => p.id);
      const [likesRes, savesRes] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
        supabase.from("saves").select("post_id").eq("user_id", userId).in("post_id", postIds),
      ]);
      likedIds = new Set((likesRes.data || []).map((l) => l.post_id));
      savedIds = new Set((savesRes.data || []).map((s) => s.post_id));
    }

    setPosts(
      (data || []).map((p) => ({
        ...p,
        liked: likedIds.has(p.id),
        saved: savedIds.has(p.id),
      }))
    );`,
  `    let likedIds = new Set();
    let savedIds = new Set();
    let repostedIds = new Set();

    if (userId && data?.length) {
      const postIds = data.map((p) => p.id);
      const [likesRes, savesRes, repostsRes] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
        supabase.from("saves").select("post_id").eq("user_id", userId).in("post_id", postIds),
        supabase.from("reposts").select("post_id").eq("user_id", userId).in("post_id", postIds),
      ]);
      likedIds = new Set((likesRes.data || []).map((l) => l.post_id));
      savedIds = new Set((savesRes.data || []).map((s) => s.post_id));
      repostedIds = new Set((repostsRes.data || []).map((r) => r.post_id));
    }

    setPosts(
      (data || []).map((p) => ({
        ...p,
        liked: likedIds.has(p.id),
        saved: savedIds.has(p.id),
        reposted: repostedIds.has(p.id),
      }))
    );`
);

// Add toggleRepost
s = s.replace(
  `  const deletePost = async (post) => {`,
  `  const toggleRepost = async (post) => {
    if (!userId) return;
    if (post.reposted) {
      await supabase.from("reposts").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      await supabase.from("reposts").insert({ post_id: post.id, user_id: userId });
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, reposted: !p.reposted, reposts_count: (p.reposts_count || 0) + (p.reposted ? -1 : 1) }
          : p
      )
    );
  };

  const deletePost = async (post) => {`
);

// Export toggleRepost
s = s.replace(
  "return { posts, loading, error, reload: load, toggleLike, toggleSave, deletePost, addComment, createPost };",
  "return { posts, loading, error, reload: load, toggleLike, toggleSave, toggleRepost, deletePost, addComment, createPost };"
);

// Add getSavedPosts helper
s = s.replace(
  `  return { posts, loading, error, reload: load, toggleLike, toggleSave, toggleRepost, deletePost, addComment, createPost };`,
  `  const getSavedPosts = async (targetUserId) => {
    if (!targetUserId) return [];
    const { data: saves } = await supabase
      .from("saves")
      .select("post_id")
      .eq("user_id", targetUserId);
    if (!saves || saves.length === 0) return [];
    const postIds = saves.map((s) => s.post_id);
    const { data } = await supabase
      .from("posts")
      .select(\`
        id, author_id, body, image_url, likes_count, comments_count, reposts_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      \`)
      .in("id", postIds)
      .order("created_at", { ascending: false });
    return (data || []).map((p) => ({ ...p, liked: false, saved: true, reposted: false }));
  };

  return { posts, loading, error, reload: load, toggleLike, toggleSave, toggleRepost, deletePost, addComment, createPost, getSavedPosts };`
);

fs.writeFileSync(p, s);
console.log("useFeed.js patched");
