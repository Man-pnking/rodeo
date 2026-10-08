import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useMessages(conversationId, userId) {
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
  }, [conversationId]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
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
          filter: `conversation_id=eq.${conversationId}`,
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
  }, [conversationId]);

  // Mark incoming messages as read
  useEffect(() => {
    if (!conversationId || !userId || messages.length === 0) return;
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
  }, [messages, conversationId, userId]);

  const send = async (body, imageUrl) => {
    if (!userId || !conversationId) return { error: "Missing" };
    if (!body?.trim() && !imageUrl) return { error: "Empty" };

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: body?.trim() || null,
      image_url: imageUrl || null,
    });
    return { error: error?.message || null };
  };

  return { messages, loading, reload: load, send };
}
