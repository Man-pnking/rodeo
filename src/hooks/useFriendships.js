import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useFriendships(userId) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error) {
      setLoading(false);
      return;
    }

    const accepted = data.filter((f) => f.status === "accepted");
    const pending = data.filter(
      (f) => f.status === "pending" && f.friend_id === userId
    );

    // Fetch profiles for accepted friends
    const friendIds = accepted.map((f) =>
      f.user_id === userId ? f.friend_id : f.user_id
    );

    let profiles = [];
    if (friendIds.length > 0) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", friendIds);
      profiles = p || [];
    }

    // Fetch profiles for incoming requests
    const requesterIds = pending.map((f) => f.user_id);
    let requesters = [];
    if (requesterIds.length > 0) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", requesterIds);
      requesters = p || [];
    }

    setFriends(profiles);
    setRequests(
      pending.map((f) => ({
        ...f,
        profile: requesters.find((p) => p.id === f.user_id),
      }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const sendRequest = async (targetUserId) => {
    const { error } = await supabase.from("friendships").insert({
      user_id: userId,
      friend_id: targetUserId,
      status: "pending",
    });
    await load();
    return { error: error?.message || null };
  };

  const acceptRequest = async (friendshipId) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", friendshipId);
    await load();
    return { error: error?.message || null };
  };

  const declineRequest = async (friendshipId) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);
    await load();
    return { error: error?.message || null };
  };

  const pendingTo = (targetUserId) =>
    requests.some((r) => r.user_id === targetUserId);

  const isFriend = (targetUserId) =>
    friends.some((f) => f.id === targetUserId);

  return {
    friends,
    requests,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    isFriend,
    pendingTo,
    reload: load,
  };
}
