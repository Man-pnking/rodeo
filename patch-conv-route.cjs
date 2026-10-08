const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

// Remove AppLayout wrapper from Conversation route
const oldRoute = '<Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />';
const newRoute = '<Route path="/messages/:id" element={<RequireAuth><Conversation /></RequireAuth>} />';

// Check if it's already wrapped in AppLayout
const oldRouteWithLayout = '<Route path="/messages/:id" element={<RequireAuth><AppLayout><Conversation /></AppLayout></RequireAuth>} />';

if (s.indexOf(oldRouteWithLayout) !== -1) {
  s = s.replace(oldRouteWithLayout, newRoute);
  console.log("Removed AppLayout from Conversation route");
} else if (s.indexOf(oldRoute) !== -1) {
  console.log("Route is already unwrapped");
} else {
  console.log("Route pattern not found — need to inspect");
}

fs.writeFileSync(p, s);
console.log("App.jsx written");
