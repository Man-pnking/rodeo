const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("ParallaxProvider") === -1) {
  s = s.replace(
    'import { ToastProvider } from "./context/ToastContext.jsx";',
    'import { ToastProvider } from "./context/ToastContext.jsx";\nimport { ParallaxProvider } from "./context/ParallaxContext.jsx";'
  );
  s = s.replace(
    "    <ThemeProvider>",
    "    <ParallaxProvider>\n    <ThemeProvider>"
  );
  s = s.replace(
    "    </ThemeProvider>",
    "    </ThemeProvider>\n    </ParallaxProvider>"
  );
}

fs.writeFileSync(p, s);
console.log("App.jsx parallax wired");
