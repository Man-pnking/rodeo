import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("comments")
        .select(`
          id, body, created_at, user_id,
          author:profiles!comments_user_id_fkey (id, username, display_name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        setComments(data || []);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [postId]);

  return { comments, loading };
}
