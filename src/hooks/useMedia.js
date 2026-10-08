import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useMedia(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadMedia = async (file, dimensions = {}) => {
    if (!file || !userId) return { error: "Missing file or user" };
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (upErr) return { error: upErr.message };

    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);

    const { data, error } = await supabase
      .from("media")
      .insert({
        user_id: userId,
        url: pub.publicUrl,
        path,
        type: file.type?.startsWith("video") ? "video" : "image",
        width: dimensions.width || null,
        height: dimensions.height || null,
        size_bytes: file.size || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    setItems((prev) => [data, ...prev]);
    return { data };
  };

  const deleteMedia = async (item) => {
    if (!item || item.user_id !== userId) return;
    await supabase.storage.from("media").remove([item.path]);
    await supabase.from("media").delete().eq("id", item.id);
    setItems((prev) => prev.filter((m) => m.id !== item.id));
  };

  return { items, loading, reload: load, uploadMedia, deleteMedia };
}
