import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useStatuses(viewerId) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const { data: statuses } = await supabase
      .from("statuses")
      .select(`
        id, author_id, image_url, caption, expires_at, created_at,
        author:profiles!statuses_author_id_fkey (id, username, display_name, avatar_url)
      `)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (!statuses) {
      setGroups([]);
      setLoading(false);
      return;
    }

    let viewedIds = new Set();
    if (viewerId && statuses.length) {
      const { data: views } = await supabase
        .from("status_views")
        .select("status_id")
        .eq("viewer_id", viewerId)
        .in("status_id", statuses.map((s) => s.id));
      viewedIds = new Set((views || []).map((v) => v.status_id));
    }

    // Group by author
    const map = new Map();
    for (const s of statuses) {
      const key = s.author_id;
      if (!map.has(key)) {
        map.set(key, {
          author_id: s.author_id,
          author: s.author,
          items: [],
        });
      }
      map.get(key).items.push({ ...s, viewed: viewedIds.has(s.id) });
    }

    // Mark group as fully seen if all items are viewed
    const grouped = Array.from(map.values()).map((g) => ({
      ...g,
      allViewed: g.items.every((i) => i.viewed),
      hasUnseen: g.items.some((i) => !i.viewed),
    }));

    // Unseen first, then by latest
    grouped.sort((a, b) => {
      if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
      return 0;
    });

    setGroups(grouped);
    setLoading(false);
  }, [viewerId]);

  useEffect(() => {
    load();
  }, [load]);

  const createStatus = async (userId, file, caption, audience = "contacts") => {
    if (!file || !userId) return { error: "Missing file" };
    const ext = file.name.split(".").pop();
    const path = `${userId}/status-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("statuses").upload(path, file);
    if (upErr) return { error: upErr.message };

    const { data: pub } = supabase.storage.from("statuses").getPublicUrl(path);

    const { error } = await supabase.from("statuses").insert({
      author_id: userId,
      image_url: pub.publicUrl,
      caption: caption?.trim() || null,
      audience,
    });
    if (error) return { error: error.message };

    await load();
    return {};
  };

  const markViewed = async (statusId, viewerId) => {
    if (!viewerId) return;
    await supabase
      .from("status_views")
      .upsert(
        { status_id: statusId, viewer_id: viewerId },
        { onConflict: "status_id,viewer_id", ignoreDuplicates: true }
      );
  };

  const getViewers = async (statusId) => {
    const { data } = await supabase
      .from("status_views")
      .select(`
        viewer_id,
        viewer:profiles!status_views_viewer_id_fkey (id, username, display_name, avatar_url)
      `)
      .eq("status_id", statusId);
    return (data || []).map((v) => v.viewer);
  };

  const deleteStatus = async (statusId) => {
    await supabase.from("statuses").delete().eq("id", statusId);
    await load();
  };

  return { groups, loading, reload: load, createStatus, markViewed, getViewers, deleteStatus };
}
