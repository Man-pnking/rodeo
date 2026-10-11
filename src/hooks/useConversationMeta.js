import { useMemo } from "react";
import { useConversations } from "./useConversations";
import { useGroups } from "./useGroups";

/**
 * Resolves a conversation id (from useParams) into metadata.
 * Handles both DMs and groups. Never throws.
 *
 * Returns: { kind: "dm" | "group" | "unknown", other, group, loading }
 */
export function useConversationMeta(id, userId) {
  const convResult = useConversations(userId);
  const groupResult = useGroups(userId);

  const conversations = Array.isArray(convResult?.conversations)
    ? convResult.conversations
    : [];
  const groups = Array.isArray(groupResult?.groups) ? groupResult.groups : [];
  const convLoading = !!convResult?.loading;
  const groupLoading = !!groupResult?.loading;

  return useMemo(() => {
    if (!id) {
      return { kind: "unknown", other: null, group: null, loading: false };
    }

    const group = groups.find((g) => g?.id === id);
    if (group) {
      return { kind: "group", other: null, group, loading: groupLoading };
    }

    const conv = conversations.find((c) => c?.id === id);
    if (conv) {
      return {
        kind: "dm",
        other: conv.other || null,
        group: null,
        loading: convLoading,
      };
    }

    return {
      kind: "unknown",
      other: null,
      group: null,
      loading: convLoading || groupLoading,
    };
  }, [id, conversations, groups, convLoading, groupLoading]);
}
