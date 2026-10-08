import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useProfileStats(userId) {
  const [stats, setStats] = useState({ friends: 0, posts: 0, status: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const [friends, posts, status] = await Promise.all([
        supabase
          .from("friendships")
          .select("id", { count: "exact", head: true })
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq("status", "accepted")
          .then((r) => r.count || 0),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userId)
          .then((r) => r.count || 0),
        supabase
          .from("statuses")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userId)
          .gt("expires_at", new Date().toISOString())
          .then((r) => r.count || 0),
      ]);

      if (!cancelled) {
        setStats({ friends, posts, status });
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
