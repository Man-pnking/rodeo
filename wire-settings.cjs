const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("Settings") === -1) {
  s = s.replace(
    'import Library from "./pages/Library.jsx";',
    'import Library from "./pages/Library.jsx";\nimport Settings from "./pages/Settings.jsx";'
  );
  s = s.replace(
    '<Route path="/library" element={<RequireAuth><AppLayout><Library /></AppLayout></RequireAuth>} />',
    '<Route path="/library" element={<RequireAuth><AppLayout><Library /></AppLayout></RequireAuth>} />\n            <Route path="/settings" element={<RequireAuth><AppLayout><Settings /></AppLayout></RequireAuth>} />'
  );
  console.log("Settings route added");
}

fs.writeFileSync(p, s);
console.log("App.jsx written");
