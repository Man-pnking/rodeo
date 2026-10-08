const fs = require("fs");
const p = "src/hooks/useFeed.js";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("useBlocks") === -1) {
  s = s.replace(
    'import { supabase } from "../lib/supabase";',
    'import { supabase } from "../lib/supabase";\nimport { useBlocks } from "./useBlocks";'
  );

  s = s.replace(
    "export function useFeed(userId) {",
    "export function useFeed(userId) {\n  const { blockedIds } = useBlocks(userId);"
  );

  // Filter posts
  s = s.replace(
    `    setPosts(
      (data || []).map((p) => ({
        ...p,
        liked: likedIds.has(p.id),
        saved: savedIds.has(p.id),
        reposted: repostedIds.has(p.id),
      }))
    );`,
    `    const filtered = (data || []).filter((p) => !blockedIds.has(p.author_id));
    setPosts(
      filtered.map((p) => ({
        ...p,
        liked: likedIds.has(p.id),
        saved: savedIds.has(p.id),
        reposted: repostedIds.has(p.id),
      }))
    );`
  );

  s = s.replace(
    "  }, [userId]);\n\n  useEffect(() => {\n    load();",
    "  }, [userId, blockedIds]);\n\n  useEffect(() => {\n    load();"
  );
}

fs.writeFileSync(p, s);
console.log("useFeed.js filters blocked users");
