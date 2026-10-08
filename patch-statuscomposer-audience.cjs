const fs = require("fs");
const p = "src/components/StatusComposer.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("audience") === -1) {
  // Add audience state
  s = s.replace(
    'const [caption, setCaption] = useState("");',
    'const [caption, setCaption] = useState("");\n  const [audience, setAudience] = useState("contacts");'
  );

  // Pass audience to createStatus
  s = s.replace(
    "const { error } = await createStatus(user.id, file, caption);",
    "const { error } = await createStatus(user.id, file, caption, audience);"
  );

  // Add audience picker between caption and share button
  s = s.replace(
    `                  <button
                    onClick={submit}
                    disabled={posting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {posting ? "Posting..." : "Share status"}
                  </button>`,
    `                  <div className="mb-4">
                    <label className="text-label block mb-3">Who can see this</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "everyone", label: "Everyone" },
                        { id: "contacts", label: "Friends" },
                        { id: "close_friends", label: "Close" },
                      ].map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setAudience(a.id)}
                          className="py-3 rounded-xl text-xs font-medium transition-colors"
                          style={{
                            background: audience === a.id
                              ? "linear-gradient(135deg, rgba(255,110,199,0.15) 0%, rgba(168,85,247,0.18) 100%)"
                              : "rgba(255,255,255,0.04)",
                            border: audience === a.id
                              ? "1px solid rgba(168,85,247,0.5)"
                              : "1px solid rgba(255,255,255,0.06)",
                            color: audience === a.id ? "#fff" : "var(--text-secondary)",
                          }}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={submit}
                    disabled={posting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {posting ? "Posting..." : "Share status"}
                  </button>`
  );

  // Reset audience on close
  s = s.replace(
    "setMedia(null);\n    setCaption(\"\");\n    onClose();",
    "setMedia(null);\n    setCaption(\"\");\n    setAudience(\"contacts\");\n    onClose();"
  );
}

fs.writeFileSync(p, s);
console.log("StatusComposer.jsx audience wired");
