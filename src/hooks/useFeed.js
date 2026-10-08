import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useFeed(userId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, author_id, body, image_url, likes_count, comments_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    let likedIds = new Set();
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
    );
    setLoading(false);
  }, [userId]);

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
    setPosts((prev) => [{ ...data, liked: false, saved: false }, ...prev]);
    return { data };
  };

  return { posts, loading, error, reload: load, toggleLike, toggleSave, deletePost, addComment, createPost };
}
