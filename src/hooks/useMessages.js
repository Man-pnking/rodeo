import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

async function sendPushToUser(userId, payload) {
  try {
    await supabase.functions.invoke("send-push", {
      body: { user_id: userId, ...payload },
    });
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
  const [error, setError] = useState(null);

  const channelRef = useRef(null);
  const mountedRef = useRef(true);
  const targetCol = groupId ? "group_id" : "conversation_id";
  const targetVal = groupId || conversationId;

  // Track mount state so async callbacks don't setState after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -------- Load --------
  const load = useCallback(async () => {
    setError(null);
    if (!targetVal || !userId) {
      if (mountedRef.current) {
        setMessages([]);
        setLoading(false);
      }
      return;
    }
    if (mountedRef.current) setLoading(true);

    const { data, error: err } = await supabase
      .from("messages")
      .select("*")
      .eq(targetCol, targetVal)
      .order("created_at", { ascending: true });

    if (!mountedRef.current) return;
    if (err) {
      setError(err.message || "Could not load messages.");
      setMessages([]);
      setLoading(false);
      return;
    }
    setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [targetVal, targetCol, userId]);

  useEffect(() => {
    load();
  }, [load]);

  // -------- Realtime --------
  useEffect(() => {
    if (!targetVal) return;

    const channel = supabase
      .channel(`messages:${targetCol}:${targetVal}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `${targetCol}=eq.${targetVal}`,
        },
        (payload) => {
          if (!mountedRef.current || !payload?.new) return;
          setMessages((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            if (list.find((m) => m.id === payload.new.id)) return list;
            return [...list, payload.new];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `${targetCol}=eq.${targetVal}`,
        },
        (payload) => {
          if (!mountedRef.current || !payload?.new) return;
          setMessages((prev) =>
            (Array.isArray(prev) ? prev : []).map((m) =>
              m.id === payload.new.id ? payload.new : m
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [targetVal, targetCol]);

  // -------- Mark incoming as read --------
  useEffect(() => {
    if (!targetVal || !userId) return;
    if (!Array.isArray(messages) || messages.length === 0) return;

    const unread = messages.filter(
      (m) => m && m.sender_id !== userId && !m.read_at
    );
    if (unread.length === 0) return;

    const readAt = new Date().toISOString();
    supabase
      .from("messages")
      .update({ read_at: readAt })
      .in("id", unread.map((m) => m.id))
      .then(() => {
        if (!mountedRef.current) return;
        setMessages((prev) =>
          (Array.isArray(prev) ? prev : []).map((m) =>
            unread.find((u) => u.id === m.id) ? { ...m, read_at: readAt } : m
          )
        );
      });
  }, [messages, targetVal, userId]);

  // -------- Send --------
  const send = async (body, imageUrl) => {
    if (!userId || !targetVal) return { error: "Missing target" };
    if (!body?.trim() && !imageUrl) return { error: "Empty message" };

    const payload = {
      sender_id: userId,
      body: body?.trim() || null,
      image_url: imageUrl || null,
    };
    if (groupId) payload.group_id = groupId;
    else payload.conversation_id = conversationId;

    const { data: inserted, error: err } = await supabase
      .from("messages")
      .insert(payload)
      .select()
      .single();

    if (err) return { error: err.message };

    if (inserted && mountedRef.current) {
      setMessages((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (list.find((m) => m.id === inserted.id)) return list;
        return [...list, inserted];
      });
    }

    // Push notification for DMs only
    if (!groupId && conversationId) {
      const recipientId = await getConversationOtherUser(
        conversationId,
        userId
      );
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

  return { messages, loading, error, reload: load, send };
}
