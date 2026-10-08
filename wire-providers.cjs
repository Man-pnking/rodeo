const fs = require("fs");
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");

// Add imports
if (s.indexOf("ThemeProvider") === -1) {
  s = s.replace(
    'import { StatusProvider } from "./context/StatusContext.jsx";',
    'import { StatusProvider } from "./context/StatusContext.jsx";\nimport { ThemeProvider } from "./context/ThemeContext.jsx";\nimport { ToastProvider } from "./context/ToastContext.jsx";'
  );
}

// Wrap contents in providers
if (s.indexOf("ThemeProvider>") === -1) {
  s = s.replace(
    "    <StatusProvider>",
    "    <ThemeProvider>\n    <ToastProvider>\n    <StatusProvider>"
  );
  s = s.replace(
    "    </StatusProvider>",
    "    </StatusProvider>\n    </ToastProvider>\n    </ThemeProvider>"
  );
}

fs.writeFileSync(p, s);
console.log("App.jsx providers wired");
