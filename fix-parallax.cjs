const fs = require("fs");
const p = "src/components/ParallaxLayer.jsx";
let s = fs.readFileSync(p, "utf8");

// Add style prop
s = s.replace(
  'export default function ParallaxLayer({\n  children,\n  speed = 0.15,\n  className = "",\n  as = "div",\n}) {',
  'export default function ParallaxLayer({\n  children,\n  speed = 0.15,\n  className = "",\n  style = {},\n  as = "div",\n}) {'
);

// Merge style + y
s = s.replace(
  'style={{ y }}',
  'style={{ y, ...style }}'
);

fs.writeFileSync(p, s);
console.log("ParallaxLayer fixed");
