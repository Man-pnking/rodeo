const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

// 1. Add ChatList + Conversation imports if missing
if (s.indexOf("ChatList") === -1) {
  s = s.replace(
    'import Messages from "./pages/Messages.jsx";',
    'import Messages from "./pages/Messages.jsx";\nimport ChatList from "./pages/ChatList.jsx";\nimport Conversation from "./pages/Conversation.jsx";'
  );
  console.log("imports added");
}

// 2. Replace /messages route to use ChatList
const oldMessagesRoute = '<Route path="/messages" element={<RequireAuth><AppLayout><Messages /></AppLayout></RequireAuth>} />';
const newMessagesRoute = '<Route path="/messages" element={<RequireAuth><AppLayout><ChatList /></AppLayout></RequireAuth>} />\n            <Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />';

if (s.indexOf(oldMessagesRoute) !== -1) {
  s = s.replace(oldMessagesRoute, newMessagesRoute);
  console.log("messages route replaced + conversation route added");
} else if (s.indexOf('path="/messages/:id"') === -1) {
  // Route exists but with different text — append conversation route
  s = s.replace(
    '<Route path="/messages" element={<RequireAuth><AppLayout><Messages /></AppLayout></RequireAuth>} />',
    newMessagesRoute
  );
  console.log("fallback applied");
} else {
  console.log("routes already present");
}

fs.writeFileSync(p, s);
console.log("App.jsx written");
