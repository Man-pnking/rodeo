const fs = require("fs");
const p = "src/components/Navigation.jsx";
let s = fs.readFileSync(p, "utf8");

// Add extra padding-bottom to the mobile nav
if (s.indexOf("paddingBottom: \"env(safe-area-inset-bottom, 0)\"") === -1) {
  s = s.replace(
    /className="flex items-center justify-around px-2 pt-2 pb-2"/,
    'className="flex items-center justify-around px-2 pt-2 pb-2"\n          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 8px)" }}'
  );
  fs.writeFileSync(p, s);
  console.log("nav safe-area fixed");
}
