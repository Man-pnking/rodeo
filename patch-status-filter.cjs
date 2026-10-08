const fs = require("fs");
const p = "src/context/StatusContext.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("useBlocks") === -1) {
  s = s.replace(
    'import { useAuth } from "../hooks/useAuth";',
    'import { useAuth } from "../hooks/useAuth";\nimport { useBlocks } from "../hooks/useBlocks";'
  );

  s = s.replace(
    "export function StatusProvider({ children }) {\n  const { user } = useAuth();",
    "export function StatusProvider({ children }) {\n  const { user } = useAuth();\n  const { blockedIds } = useBlocks(user?.id);"
  );

  s = s.replace(
    `    const map = new Map();
    for (const s of statuses) {`,
    `    const visible = statuses.filter((s) => !blockedIds.has(s.author_id));

    const map = new Map();
    for (const s of visible) {`
  );

  s = s.replace(
    "  }, [user?.id]);\n\n  useEffect(() => {\n    load();",
    "  }, [user?.id, blockedIds]);\n\n  useEffect(() => {\n    load();"
  );
}

fs.writeFileSync(p, s);
console.log("StatusContext.jsx filters blocked users");
