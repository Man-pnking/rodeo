import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useConversations(userId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (!convs || convs.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const otherIds = convs.map((c) => (c.user_a === userId ? c.user_b : c.user_a));

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", otherIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Last message + unread count per conversation
    const enriched = await Promise.all(
      convs.map(async (c) => {
        const otherId = c.user_a === userId ? c.user_b : c.user_a;
        const other = profileMap.get(otherId);

        const { data: lastMsgs } = await supabase
          .from("messages")
          .select("id, body, image_url, sender_id, created_at, read_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count: unread } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .neq("sender_id", userId)
          .is("read_at", null);

        return {
          ...c,
          other,
          lastMessage: lastMsgs?.[0] || null,
          unread: unread || 0,
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const getOrCreate = async (otherUserId) => {
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      other_user_id: otherUserId,
    });
    if (error) return { error: error.message };
    await load();
    return { id: data };
  };

  return { conversations, loading, reload: load, getOrCreate };
}
