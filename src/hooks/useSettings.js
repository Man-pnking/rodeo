import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useSettings(userId) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setSettings(data);
    } else {
      // Create default row if missing
      const { data: created } = await supabase
        .from("user_settings")
        .insert({ user_id: userId })
        .select()
        .single();
      setSettings(created);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(async (patch) => {
    if (!userId) return { error: "No user" };
    setSettings((prev) => ({ ...prev, ...patch }));
    const { error } = await supabase
      .from("user_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) {
      await load();
      return { error: error.message };
    }
    return {};
  }, [userId, load]);

  return { settings, loading, update, reload: load };
}
