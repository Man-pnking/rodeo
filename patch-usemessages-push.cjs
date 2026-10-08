const fs = require("fs");
const p = "src/hooks/useMessages.js";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("sendPushToUser") === -1) {
  // Insert helper at the top
  s = s.replace(
    'import { supabase } from "../lib/supabase";',
    `import { supabase } from "../lib/supabase";

async function sendPushToUser(userId, payload) {
  try {
    await supabase.functions.invoke("send-push", { body: { user_id: userId, ...payload } });
  } catch (e) {
    console.warn("[push] failed", e);
  }
}

async function getConversationOtherUser(conversationId, senderId) {
  const { data } = await supabase
    .from("conversations")
    .select("user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();
  if (!data) return null;
  return data.user_a === senderId ? data.user_b : data.user_a;
}`
  );

  // Push after successful send
  s = s.replace(
    `    const { error } = await supabase.from("messages").insert(payload);
    return { error: error?.message || null };`,
    `    const { error } = await supabase.from("messages").insert(payload);
    if (error) return { error: error.message };

    // Fire push to the other user (DM only, not groups for now)
    if (!groupId && conversationId) {
      const recipientId = await getConversationOtherUser(conversationId, userId);
      if (recipientId) {
        sendPushToUser(recipientId, {
          title: "New message",
          body: body?.trim() || "📷 Photo",
          url: \`/messages/\${conversationId}\`,
          tag: \`conv-\${conversationId}\`,
        });
      }
    }

    return {};`
  );
}

fs.writeFileSync(p, s);
console.log("useMessages.js push wired");
