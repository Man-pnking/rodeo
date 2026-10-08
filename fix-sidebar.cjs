const fs = require("fs");
const p = "src/components/Navigation.jsx";
let s = fs.readFileSync(p, "utf8");

// Ensure sidebar nav has no-scrollbar
s = s.replace(
  /<nav className="flex-1 px-3 space-y-1[^"]*">/,
  '<nav className="flex-1 px-3 space-y-1 no-scrollbar overflow-y-auto">'
);

// Ensure sidebar aside has no-scrollbar too
s = s.replace(
  /<aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-40"/,
  '<aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-40 no-scrollbar overflow-y-auto"'
);

fs.writeFileSync(p, s);
console.log("sidebar scrollbars hidden");
