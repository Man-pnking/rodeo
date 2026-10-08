import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) setError(error.message);
    else setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (patch) => {
    if (!userId) return { error: "Not signed in" };
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();
    if (error) return { error: error.message };
    setProfile(data);
    return { data };
  };

  return { profile, loading, error, refetch: load, update };
}
