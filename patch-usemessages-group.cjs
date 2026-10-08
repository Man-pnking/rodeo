const fs = require("fs");
const p = "src/hooks/useMessages.js";
let s = fs.readFileSync(p, "utf8");

// Change signature to accept either {conversationId, groupId}
s = s.replace(
  "export function useMessages(conversationId, userId) {",
  "export function useMessages({ conversationId, groupId }, userId) {"
);

// Build filter condition
s = s.replace(
  `    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });`,
  `    const column = groupId ? "group_id" : "conversation_id";
    const value = groupId || conversationId;
    if (!value) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq(column, value)
        .order("created_at", { ascending: true });`
);

s = s.replace(
  "  }, [conversationId]);",
  "  }, [conversationId, groupId]);"
);

// Realtime subscription — replace conversationId filter
s = s.replace(
  `  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(\`messages:\${conversationId}\`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: \`conversation_id=eq.\${conversationId}\`,
        },`,
  `  useEffect(() => {
    const filterValue = groupId || conversationId;
    const filterCol = groupId ? "group_id" : "conversation_id";
    if (!filterValue) return;

    const channel = supabase
      .channel(\`messages:\${filterCol}:\${filterValue}\`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: \`\${filterCol}=eq.\${filterValue}\`,
        },`
);

s = s.replace(
  `        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: \`conversation_id=eq.\${conversationId}\`,
        },`,
  `        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: \`\${filterCol}=eq.\${filterValue}\`,
        },`
);

s = s.replace(
  "  }, [conversationId]);\n\n  // Mark incoming",
  "  }, [conversationId, groupId]);\n\n  // Mark incoming"
);

// Mark-read block
s = s.replace(
  "    if (!conversationId || !userId || messages.length === 0) return;",
  "    const targetId = groupId || conversationId;\n    if (!targetId || !userId || messages.length === 0) return;"
);

s = s.replace(
  "  }, [messages, conversationId, userId]);",
  "  }, [messages, conversationId, groupId, userId]);"
);

// Send function
s = s.replace(
  `    if (!userId || !conversationId) return { error: "Missing" };`,
  `    const targetValue = groupId || conversationId;
    if (!userId || !targetValue) return { error: "Missing" };`
);

s = s.replace(
  `    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: body?.trim() || null,
      image_url: imageUrl || null,
    });`,
  `    const payload = {
      sender_id: userId,
      body: body?.trim() || null,
      image_url: imageUrl || null,
    };
    if (groupId) payload.group_id = groupId;
    else payload.conversation_id = conversationId;

    const { error } = await supabase.from("messages").insert(payload);`
);

fs.writeFileSync(p, s);
console.log("useMessages.js updated for groups");
