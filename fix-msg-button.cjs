const fs = require("fs");
const p = "src/pages/UserProfile.jsx";
let s = fs.readFileSync(p, "utf8");

// 1. Add imports
if (s.indexOf("useConversations") === -1) {
  s = s.replace(
    'import { useAuth } from "../hooks/useAuth";',
    'import { useAuth } from "../hooks/useAuth";\nimport { useConversations } from "../hooks/useConversations";\nimport { useNavigate } from "react-router-dom";'
  );
  console.log("imports added");
}

// 2. Add navigate + getOrCreate + startingChat state
if (s.indexOf("const navigate = useNavigate()") === -1) {
  s = s.replace(
    'const { user } = useAuth();',
    'const { user } = useAuth();\n  const navigate = useNavigate();\n  const { getOrCreate } = useConversations(user?.id);\n  const [startingChat, setStartingChat] = useState(false);'
  );
  console.log("hooks added");
}

// 3. Replace placeholder onMessage
const oldHandler = 'onMessage={() => alert("DMs coming soon")}';
const newHandler = `onMessage={async () => {
          if (!profile || startingChat) return;
          setStartingChat(true);
          const { id, error } = await getOrCreate(profile.id);
          setStartingChat(false);
          if (error) { alert(error); return; }
          navigate(\`/messages/\${id}\`);
        }}`;

if (s.indexOf(oldHandler) !== -1) {
  s = s.replace(oldHandler, newHandler);
  console.log("onMessage wired");
} else {
  console.log("onMessage NOT found — check formatting");
}

fs.writeFileSync(p, s);
console.log("UserProfile.jsx written");
