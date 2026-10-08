const fs = require("fs");

// ChatList — pass group handler
const cl = "src/pages/ChatList.jsx";
let s = fs.readFileSync(cl, "utf8");
if (s.indexOf("CreateGroupSheet") === -1) {
  s = s.replace(
    'import NewChatSheet from "../components/NewChatSheet.jsx";',
    'import NewChatSheet from "../components/NewChatSheet.jsx";\nimport CreateGroupSheet from "../components/CreateGroupSheet.jsx";'
  );
  s = s.replace(
    "const [newChatOpen, setNewChatOpen] = useState(false);",
    "const [newChatOpen, setNewChatOpen] = useState(false);\n  const [newGroupOpen, setNewGroupOpen] = useState(false);"
  );
  // Replace "+" button onClick
  s = s.replace(
    'onClick={() => setNewChatOpen(true)}\n            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105"',
    'onClick={() => setNewGroupOpen(true)}\n            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105"'
  );
  // Add CreateGroupSheet render
  s = s.replace(
    '<NewChatSheet open={newChatOpen} onClose={() => setNewChatOpen(false)} />',
    '<NewChatSheet open={newChatOpen} onClose={() => setNewChatOpen(false)} />\n      <CreateGroupSheet\n        open={newGroupOpen}\n        onClose={() => setNewGroupOpen(false)}\n        onCreated={(gid) => navigate(`/messages/${gid}`)}\n      />'
  );
  // Import navigate
  if (s.indexOf("useNavigate") === -1) {
    s = s.replace(
      'import { Link } from "react-router-dom";',
      'import { Link, useNavigate } from "react-router-dom";'
    );
    s = s.replace(
      "export default function ChatList() {\n  const { user } = useAuth();",
      "export default function ChatList() {\n  const navigate = useNavigate();\n  const { user } = useAuth();"
    );
  }
  fs.writeFileSync(cl, s);
  console.log("ChatList.jsx + group sheet wired");
}

// App.jsx — add /group/:id route
const app = "src/App.jsx";
let a = fs.readFileSync(app, "utf8");
if (a.indexOf("GroupInfo") === -1) {
  a = a.replace(
    'import Conversation from "./pages/Conversation.jsx";',
    'import Conversation from "./pages/Conversation.jsx";\nimport GroupInfo from "./pages/GroupInfo.jsx";'
  );
  a = a.replace(
    '<Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />',
    '<Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />\n            <Route path="/group/:id" element={<RequireAuth><AppLayout><GroupInfo /></AppLayout></RequireAuth>} />'
  );
  fs.writeFileSync(app, a);
  console.log("App.jsx + GroupInfo route wired");
}
