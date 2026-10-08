import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useBlocks(userId) {
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setBlockedIds(new Set());
      setBlockedProfiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: blocks } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", userId);

    const ids = (blocks || []).map((b) => b.blocked_id);
    setBlockedIds(new Set(ids));

    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids);
      setBlockedProfiles(profiles || []);
    } else {
      setBlockedProfiles([]);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const isBlocked = useCallback((otherId) => blockedIds.has(otherId), [blockedIds]);

  const block = useCallback(async (otherId) => {
    if (!userId || !otherId) return { error: "Missing" };
    const { error } = await supabase
      .from("blocks")
      .insert({ blocker_id: userId, blocked_id: otherId });
    if (error) return { error: error.message };
    await load();
    return {};
  }, [userId, load]);

  const unblock = useCallback(async (otherId) => {
    if (!userId || !otherId) return { error: "Missing" };
    const { error } = await supabase
      .from("blocks")
      .delete()
      .eq("blocker_id", userId)
      .eq("blocked_id", otherId);
    if (error) return { error: error.message };
    await load();
    return {};
  }, [userId, load]);

  return { blockedIds, blockedProfiles, loading, isBlocked, block, unblock, reload: load };
}
