import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function usePost(postId, userId) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select(`
        id, author_id, body, image_url, likes_count, comments_count, reposts_count, created_at,
        author:profiles!posts_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      setError(postError.message);
      setLoading(false);
      return;
    }
    if (!postData) {
      setError("Post not found");
      setLoading(false);
      return;
    }

    const { data: commentsData } = await supabase
      .from("comments")
      .select(`
        id, post_id, user_id, body, created_at,
        author:profiles!comments_user_id_fkey (id, username, display_name, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    let liked = false, saved = false, reposted = false;
    if (userId) {
      const [l, s, r] = await Promise.all([
        supabase.from("likes").select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle(),
        supabase.from("saves").select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle(),
        supabase.from("reposts").select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle(),
      ]);
      liked = !!l.data;
      saved = !!s.data;
      reposted = !!r.data;
    }

    setPost({ ...postData, liked, saved, reposted });
    setComments(commentsData || []);
    setLoading(false);
  }, [postId, userId]);

  useEffect(() => { load(); }, [load]);

  const toggleLike = async () => {
    if (!userId || !post) return;
    if (post.liked) {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      await supabase.from("likes").insert({ post_id: post.id, user_id: userId });
    }
    setPost((p) => ({ ...p, liked: !p.liked, likes_count: p.likes_count + (p.liked ? -1 : 1) }));
  };

  const toggleSave = async () => {
    if (!userId || !post) return;
    if (post.saved) {
      await supabase.from("saves").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      await supabase.from("saves").insert({ post_id: post.id, user_id: userId });
    }
    setPost((p) => ({ ...p, saved: !p.saved }));
  };

  const toggleRepost = async () => {
    if (!userId || !post) return;
    if (post.reposted) {
      await supabase.from("reposts").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      await supabase.from("reposts").insert({ post_id: post.id, user_id: userId });
    }
    setPost((p) => ({ ...p, reposted: !p.reposted }));
  };

  const addComment = async (body) => {
    if (!userId || !body.trim()) return;
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, user_id: userId, body: body.trim() })
      .select(`
        id, post_id, user_id, body, created_at,
        author:profiles!comments_user_id_fkey (id, username, display_name, avatar_url)
      `)
      .single();
    if (error) return { error: error.message };
    setComments((prev) => [...prev, data]);
    setPost((p) => ({ ...p, comments_count: (p.comments_count || 0) + 1 }));
    return {};
  };

  const deleteComment = async (commentId) => {
    if (!userId) return;
    await supabase.from("comments").delete().eq("id", commentId).eq("user_id", userId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPost((p) => ({ ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) }));
  };

  const deletePost = async () => {
    if (!userId || !post || post.author_id !== userId) return;
    await supabase.from("posts").delete().eq("id", post.id);
  };

  return {
    post, comments, loading, error,
    toggleLike, toggleSave, toggleRepost,
    addComment, deleteComment, deletePost,
    reload: load,
  };
}
