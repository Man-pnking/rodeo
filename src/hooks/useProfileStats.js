import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useProfileStats(userId) {
  const [stats, setStats] = useState({ followers: 0, likes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const [followers, likes] = await Promise.all([
        supabase
          .from("friendships")
          .select("id", { count: "exact", head: true })
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq("status", "accepted")
          .then((r) => r.count || 0),
        supabase
          .from("posts")
          .select("likes_count", { count: "exact" })
          .eq("author_id", userId)
          .then((r) => {
            // Will return 0 until posts table has likes_count column
            if (!r.data) return 0;
            return r.data.reduce((sum, p) => sum + (p.likes_count || 0), 0);
          })
          .catch(() => 0),
      ]);

      if (!cancelled) {
        setStats({ followers, likes });
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { stats, loading };
}
