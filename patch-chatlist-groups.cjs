const fs = require("fs");
const p = "src/pages/ChatList.jsx";
let s = fs.readFileSync(p, "utf8");

// Import useGroups + GroupAvatar
if (s.indexOf("useGroups") === -1) {
  s = s.replace(
    'import { useConversations } from "../hooks/useConversations";',
    'import { useConversations } from "../hooks/useConversations";\nimport { useGroups } from "../hooks/useGroups";\nimport GroupAvatar from "../components/GroupAvatar.jsx";'
  );
}

// Load groups
if (s.indexOf("const { groups") === -1) {
  s = s.replace(
    "  const { conversations, loading } = useConversations(user?.id);",
    "  const { conversations, loading: convLoading } = useConversations(user?.id);\n  const { groups, loading: groupLoading } = useGroups(user?.id);\n  const loading = convLoading || groupLoading;"
  );
}

// Merge into one list
s = s.replace(
  "  const [newChatOpen, setNewChatOpen] = useState(false);",
  `  const [newChatOpen, setNewChatOpen] = useState(false);

  const mergedItems = [
    ...conversations.map((c) => ({
      type: "dm",
      id: c.id,
      to: \`/messages/\${c.id}\`,
      avatar: c.other?.avatar_url,
      name: c.other?.display_name || c.other?.username,
      sub: c.other?.username,
      lastMessage: c.lastMessage,
      lastAt: c.lastMessage?.created_at || c.last_message_at,
      unread: c.unread,
    })),
    ...groups.map((g) => ({
      type: "group",
      id: g.id,
      to: \`/messages/\${g.id}\`,
      group: g,
      name: g.name,
      sub: \`\${g.members?.length || 1} members\`,
      lastMessage: g.lastMessage,
      lastAt: g.lastMessage?.created_at || g.updated_at,
      unread: g.unread,
    })),
  ].sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));`
);

fs.writeFileSync(p, s);
console.log("ChatList.jsx imports + mergedItems added");
