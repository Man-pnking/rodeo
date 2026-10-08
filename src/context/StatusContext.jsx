import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const StatusContext = createContext(null);

export function StatusProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: statuses } = await supabase
      .from("statuses")
      .select("id, author_id, image_url, caption, expires_at, created_at")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (!statuses || statuses.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const authorIds = [...new Set(statuses.map((s) => s.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", authorIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    let viewed = new Set();
    if (user?.id) {
      const { data: views } = await supabase
        .from("status_views")
        .select("status_id")
        .eq("viewer_id", user.id)
        .in("status_id", statuses.map((s) => s.id));
      viewed = new Set((views || []).map((v) => v.status_id));
    }

    const map = new Map();
    for (const s of statuses) {
      const author = profileMap.get(s.author_id);
      if (!map.has(s.author_id)) {
        map.set(s.author_id, { author_id: s.author_id, author, items: [] });
      }
      map.get(s.author_id).items.push({ ...s, viewed: viewed.has(s.id) });
    }

    const grouped = Array.from(map.values()).map((g) => ({
      ...g,
      hasUnseen: g.items.some((i) => !i.viewed),
      allViewed: g.items.every((i) => i.viewed),
    }));

    grouped.sort((a, b) => {
      if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
      return 0;
    });

    setGroups(grouped);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const getStatusFor = (userId) => {
    const group = groups.find((g) => g.author_id === userId);
    if (!group) return { hasStatus: false, hasUnseen: false, group: null };
    return { hasStatus: true, hasUnseen: group.hasUnseen, group };
  };

  const markViewed = async (statusId) => {
    if (!user?.id) return;
    await supabase
      .from("status_views")
      .upsert(
        { status_id: statusId, viewer_id: user.id },
        { onConflict: "status_id,viewer_id", ignoreDuplicates: true }
      );
  };

  return (
    <StatusContext.Provider value={{ groups, loading, reload: load, getStatusFor, markViewed }}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatusContext() {
  const ctx = useContext(StatusContext);
  if (!ctx) throw new Error("useStatusContext must be inside StatusProvider");
  return ctx;
}
