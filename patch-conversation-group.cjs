const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

// Import useGroups
if (s.indexOf("useGroups") === -1) {
  s = s.replace(
    'import { useConversations } from "../hooks/useConversations";',
    'import { useConversations } from "../hooks/useConversations";\nimport { useGroups } from "../hooks/useGroups";'
  );
}

// Load groups too
if (s.indexOf("const { groups: myGroups }") === -1) {
  s = s.replace(
    "  const { conversations } = useConversations(user?.id);",
    "  const { conversations } = useConversations(user?.id);\n  const { groups: myGroups } = useGroups(user?.id);"
  );
}

// Determine if this is a group
s = s.replace(
  "  const conv = conversations.find((c) => c.id === id);\n  const other = conv?.other;",
  `  const group = myGroups.find((g) => g.id === id);
  const isGroup = !!group;
  const conv = isGroup ? null : conversations.find((c) => c.id === id);
  const other = conv?.other;`
);

// Pass groupId to useMessages
s = s.replace(
  "const { messages, loading, send } = useMessages(id, user?.id);",
  "const { messages, loading, send } = useMessages(\n    isGroup ? { groupId: id } : { conversationId: id },\n    user?.id\n  );"
);

fs.writeFileSync(p, s);
console.log("Conversation.jsx patched for group support");
