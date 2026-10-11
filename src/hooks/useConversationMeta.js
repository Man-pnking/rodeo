import { useMemo } from "react";
import { useConversations } from "./useConversations";
import { useGroups } from "./useGroups";

/**
 * Resolves a conversation id (from useParams) into metadata.
 * Handles both DMs and groups. Never throws — always returns a shape.
 *
 * Returns:
 *   { kind: "dm" | "group" | "unknown", other, group, loading }
 */
export function useConversationMeta(id, userId) {
  const { conversations = [], loading: convLoading } = useConversations(userId) || {};
  const { groups = [], loading: groupLoading } = useGroups(userId) || {};

  return useMemo(() => {
    if (!id) return { kind: "unknown", other: null, group: null, loading: false };

    const group = (groups || []).find((g) => g?.id === id);
    if (group) {
      return { kind: "group", other: null, group, loading: groupLoading };
    }

    const conv = (conversations || []).find((c) => c?.id === id);
    if (conv) {
      return { kind: "dm", other: conv.other || null, group: null, loading: convLoading };
    }

    return { kind: "unknown", other: null, group: null, loading: convLoading || groupLoading };
  }, [id, conversations, groups, convLoading, groupLoading]);
}
