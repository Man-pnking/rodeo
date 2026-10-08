import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCloseFriends(userId) {
  const [closeFriends, setCloseFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setCloseFriends([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows } = await supabase
      .from("close_friends")
      .select("friend_id")
      .eq("owner_id", userId);

    const ids = (rows || []).map((r) => r.friend_id);
    if (ids.length === 0) {
      setCloseFriends([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", ids);

    setCloseFriends(profiles || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const isCloseFriend = useCallback(
    (otherId) => closeFriends.some((f) => f.id === otherId),
    [closeFriends]
  );

  const add = useCallback(async (friendId) => {
    if (!userId) return { error: "No user" };
    const { error } = await supabase
      .from("close_friends")
      .insert({ owner_id: userId, friend_id: friendId });
    if (error) return { error: error.message };
    await load();
    return {};
  }, [userId, load]);

  const remove = useCallback(async (friendId) => {
    if (!userId) return { error: "No user" };
    const { error } = await supabase
      .from("close_friends")
      .delete()
      .eq("owner_id", userId)
      .eq("friend_id", friendId);
    if (error) return { error: error.message };
    await load();
    return {};
  }, [userId, load]);

  return { closeFriends, loading, isCloseFriend, add, remove, reload: load };
}
