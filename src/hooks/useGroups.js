import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useGroups(userId) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Groups I'm a member of
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, role")
      .eq("user_id", userId);

    if (!memberships || memberships.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = memberships.map((m) => m.group_id);

    const { data: groupRows } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds)
      .order("updated_at", { ascending: false });

    // Members for all groups
    const { data: allMembers } = await supabase
      .from("group_members")
      .select(`
        group_id, user_id, role,
        profile:profiles!group_members_user_id_fkey (id, username, display_name, avatar_url)
      `)
      .in("group_id", groupIds);

    const membersByGroup = new Map();
    for (const m of allMembers || []) {
      if (!membersByGroup.has(m.group_id)) membersByGroup.set(m.group_id, []);
      membersByGroup.get(m.group_id).push(m);
    }

    // Last message per group
    const enriched = await Promise.all(
      (groupRows || []).map(async (g) => {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("id, body, image_url, sender_id, created_at, read_at")
          .eq("group_id", g.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count: unread } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("group_id", g.id)
          .neq("sender_id", userId)
          .is("read_at", null);

        return {
          ...g,
          members: membersByGroup.get(g.id) || [],
          lastMessage: lastMsg?.[0] || null,
          unread: unread || 0,
          isGroup: true,
        };
      })
    );

    setGroups(enriched);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const createGroup = async (name, memberIds) => {
    const { data: groupId, error } = await supabase.rpc("create_group", {
      group_name: name,
      member_ids: memberIds,
    });
    if (error) return { error: error.message };
    await load();
    return { id: groupId };
  };

  const addMembers = async (groupId, memberIds) => {
    const rows = memberIds.map((uid) => ({ group_id: groupId, user_id: uid, role: "member" }));
    const { error } = await supabase.from("group_members").insert(rows);
    if (error) return { error: error.message };
    await load();
    return {};
  };

  const removeMember = async (groupId, uid) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", uid);
    if (error) return { error: error.message };
    await load();
    return {};
  };

  const leaveGroup = async (groupId) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    await load();
    return {};
  };

  const updateGroup = async (groupId, patch) => {
    const { error } = await supabase
      .from("groups")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", groupId);
    if (error) return { error: error.message };
    await load();
    return {};
  };

  const deleteGroup = async (groupId) => {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) return { error: error.message };
    await load();
    return {};
  };

  return { groups, loading, reload: load, createGroup, addMembers, removeMember, leaveGroup, updateGroup, deleteGroup };
}
