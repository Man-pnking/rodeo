const fs = require("fs");
const p = "src/components/Navigation.jsx";
let s = fs.readFileSync(p, "utf8");

// Sidebar nav — add no-scrollbar class
s = s.replace(
  '<nav className="flex-1 px-3 space-y-1">',
  '<nav className="flex-1 px-3 space-y-1 no-scrollbar overflow-y-auto">'
);

fs.writeFileSync(p, s);
console.log("sidebar scrollbar hidden");
