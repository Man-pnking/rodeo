import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useBlocks } from "./useBlocks";

export function useFeed(userId) {
  const { blockedIds } = useBlocks(userId);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Get accepted friend IDs (both directions)
    let friendIds = [];
    if (userId) {
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id, status")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

      friendIds = (friendships || []).map((f) =>
        f.user_id === userId ? f.friend_id : f.user_id
      );
    }

    // 2. Build the author filter: self + friends
    //    If no userId (logged out), show nothing.
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const authorIds = [userId, ...friendIds];

    // 3. Fetch posts authored by self or friends
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, author_id, body, image_url, likes_count, comments_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .in("author_id", authorIds)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // 4. Fetch viewer's likes / saves / reposts
    let likedIds = new Set();
    let savedIds = new Set();
    let repostedIds = new Set();

    if (data?.length) {
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

    // 5. Filter out blocked users
    const filtered = (data || []).filter((p) => !blockedIds.has(p.author_id));

    setPosts(
      filtered.map((p) => ({
        ...p,
        liked: likedIds.has(p.id),
        saved: savedIds.has(p.id),
        reposted: repostedIds.has(p.id),
      }))
    );
    setLoading(false);
  }, [userId, blockedIds]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async (post) => {
    if (!userId) return;
    if (post.liked) {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      await supabase.from("likes").insert({ post_id: post.id, user_id: userId });
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, liked: !p.liked, likes_count: p.likes_count + (p.liked ? -1 : 1) }
          : p
      )
    );
  };

  const toggleSave = async (post) => {
    if (!userId) return;
    if (post.saved) {
      await supabase.from("saves").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      await supabase.from("saves").insert({ post_id: post.id, user_id: userId });
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, saved: !p.saved } : p))
    );
  };

  const toggleRepost = async (post) => {
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

  const deletePost = async (post) => {
    if (!userId || post.author_id !== userId) return;
    await supabase.from("posts").delete().eq("id", post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  const addComment = async (postId, body) => {
    if (!userId || !body.trim()) return;
    await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      body: body.trim(),
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      )
    );
  };

  const createPost = async (body, imageUrls) => {
    if (!userId) return { error: "Not signed in" };
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: userId,
        body: body.trim(),
        image_url: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : (imageUrls || null),
      })
      .select(`
        id, author_id, body, image_url, likes_count, comments_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .single();
    if (error) return { error: error.message };
    setPosts((prev) => [{ ...data, liked: false, saved: false, reposted: false }, ...prev]);
    return { data };
  };

  const getSavedPosts = async (targetUserId) => {
    if (!targetUserId) return [];
    const { data: saves } = await supabase
      .from("saves")
      .select("post_id")
      .eq("user_id", targetUserId);
    if (!saves || saves.length === 0) return [];
    const postIds = saves.map((s) => s.post_id);
    const { data } = await supabase
      .from("posts")
      .select(`
        id, author_id, body, image_url, likes_count, comments_count, reposts_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .in("id", postIds)
      .order("created_at", { ascending: false });
    return (data || []).map((p) => ({ ...p, liked: false, saved: true, reposted: false }));
  };

  return {
    posts, loading, error,
    reload: load,
    toggleLike, toggleSave, toggleRepost, deletePost,
    addComment, createPost, getSavedPosts,
  };
}
