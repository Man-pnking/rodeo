const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("ChatList") === -1) {
  s = s.replace(
    'import Messages from "./pages/Messages.jsx";',
    'import Messages from "./pages/Messages.jsx";\nimport ChatList from "./pages/ChatList.jsx";\nimport Conversation from "./pages/Conversation.jsx";'
  );
}

if (s.indexOf('path="/messages"') === -1) {
  s = s.replace(
    '<Route path="/compose" element={<RequireAuth><AppLayout><Compose /></AppLayout></RequireAuth>} />',
    '<Route path="/compose" element={<RequireAuth><AppLayout><Compose /></AppLayout></RequireAuth>} />\n            <Route path="/messages" element={<RequireAuth><AppLayout><ChatList /></AppLayout></RequireAuth>} />\n            <Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />'
  );
}

fs.writeFileSync(p, s);
console.log("App.jsx routes updated");
