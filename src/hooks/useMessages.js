import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

async function sendPushToUser(userId, payload) {
  try {
    await supabase.functions.invoke("send-push", { body: { user_id: userId, ...payload } });
  } catch (e) {
    console.warn("[push] failed", e);
  }
}

async function getConversationOtherUser(conversationId, senderId) {
  const { data } = await supabase
    .from("conversations")
    .select("user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();
  if (!data) return null;
  return data.user_a === senderId ? data.user_b : data.user_a;
}

export function useMessages({ conversationId, groupId }, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const load = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  }, [conversationId, groupId]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    const filterValue = groupId || conversationId;
    const filterCol = groupId ? "group_id" : "conversation_id";
    if (!filterValue) return;

    const channel = supabase
      .channel(`messages:${filterCol}:${filterValue}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `${filterCol}=eq.${filterValue}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Dedupe
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `${filterCol}=eq.${filterValue}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conversationId, groupId]);

  // Mark incoming messages as read
  useEffect(() => {
    const targetId = groupId || conversationId;
    if (!targetId || !userId || messages.length === 0) return;
    const unread = messages.filter(
      (m) => m.sender_id !== userId && !m.read_at
    );
    if (unread.length === 0) return;

    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread.map((m) => m.id))
      .then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            unread.find((u) => u.id === m.id)
              ? { ...m, read_at: new Date().toISOString() }
              : m
          )
        );
      });
  }, [messages, conversationId, groupId, userId]);

  const send = async (body, imageUrl) => {
    const targetValue = groupId || conversationId;
    if (!userId || !targetValue) return { error: "Missing" };
    if (!body?.trim() && !imageUrl) return { error: "Empty" };

    const payload = {
      sender_id: userId,
      body: body?.trim() || null,
      image_url: imageUrl || null,
    };
    if (groupId) payload.group_id = groupId;
    else payload.conversation_id = conversationId;

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert(payload)
      .select()
      .single();
    if (error) return { error: error.message };

    // Optimistically add to local state so the sender sees it instantly
    if (inserted) {
      setMessages((prev) => {
        if (prev.find((m) => m.id === inserted.id)) return prev;
        return [...prev, inserted];
      });
    }

    // Fire push to the other user (DM only, not groups for now)
    if (!groupId && conversationId) {
      const recipientId = await getConversationOtherUser(conversationId, userId);
      if (recipientId) {
        sendPushToUser(recipientId, {
          title: "New message",
          body: body?.trim() || "📷 Photo",
          url: `/messages/${conversationId}`,
          tag: `conv-${conversationId}`,
        });
      }
    }

    return {};
  };

  return { messages, loading, reload: load, send };
}
