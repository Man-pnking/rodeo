const fs = require("fs");
const p = "src/pages/Conversation.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("chat-open") === -1) {
  s = s.replace(
    "  useEffect(() => {\n    if (scrollRef.current)",
    "  useEffect(() => {\n    document.body.classList.add(\"chat-open\");\n    return () => document.body.classList.remove(\"chat-open\");\n  }, []);\n\n  useEffect(() => {\n    if (scrollRef.current)"
  );
  console.log("body lock added");
}

fs.writeFileSync(p, s);
console.log("written");
