const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

// Remove import line
s = s.replace('import AnimatedBackground from "./components/AnimatedBackground.jsx";\n', '');
s = s.replace('import AnimatedBackground from "./components/AnimatedBackground.jsx";', '');

// Remove <AnimatedBackground /> JSX (with surrounding whitespace)
s = s.replace(/\s*<AnimatedBackground \/>\s*\n/g, '\n');

fs.writeFileSync(p, s);
console.log("App.jsx cleaned");
