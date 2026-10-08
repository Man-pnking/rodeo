const fs = require("fs");
const p = "src/components/StatusViewer.jsx";
let s = fs.readFileSync(p, "utf8");

if (s.indexOf("replyText") === -1) {
  // Add imports
  s = s.replace(
    'import { X, ChevronLeft, ChevronRight } from "lucide-react";',
    'import { X, ChevronLeft, ChevronRight, Send } from "lucide-react";'
  );

  s = s.replace(
    'import { useStatuses } from "../hooks/useStatuses";',
    'import { useStatuses } from "../hooks/useStatuses";\nimport { useConversations } from "../hooks/useConversations";\nimport { useNavigate } from "react-router-dom";'
  );

  // Add state and hooks
  s = s.replace(
    "  const { markViewed } = useStatuses(user?.id);",
    "  const { markViewed } = useStatuses(user?.id);\n  const { getOrCreate } = useConversations(user?.id);\n  const navigate = useNavigate();"
  );

  s = s.replace(
    "  const [progress, setProgress] = useState(0);",
    "  const [progress, setProgress] = useState(0);\n  const [replyText, setReplyText] = useState(\"\");\n  const [sending, setSending] = useState(false);"
  );

  // Add reply handler + function
  s = s.replace(
    "  const next = () => {",
    `  const sendReply = async () => {
    if (!replyText.trim() || !group?.author) return;
    if (group.author.id === user?.id) return; // Can't reply to own status
    setSending(true);
    const { id: convId, error } = await getOrCreate(group.author.id);
    if (error) { alert(error); setSending(false); return; }

    // Insert message with a reference to the status
    const { supabase } = await import("../lib/supabase");
    await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      body: \`↩ Replied to your status: \${replyText.trim()}\`,
      image_url: item.image_url,
    });

    setSending(false);
    setReplyText("");
    onClose?.();
    navigate(\`/messages/\${convId}\`);
  };

  const next = () => {`
  );

  // Add reply input at the bottom (before closing motion.div)
  s = s.replace(
    `        {/* Desktop arrows */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-20"
          style={{ background: "rgba(0,0,0,0.5)" }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>`,
    `        {/* Reply bar */}
        {group.author?.id !== user?.id && (
          <div
            className="absolute bottom-0 left-0 right-0 z-30 flex items-center gap-2 px-4 py-3 safe-bottom"
            style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 40%)" }}
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              placeholder={\`Reply to \${group.author?.display_name || group.author?.username}...\`}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-3 text-white text-sm placeholder:text-white/50 outline-none focus:border-white/40"
            />
            <button
              onClick={sendReply}
              disabled={sending || !replyText.trim()}
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                opacity: sending || !replyText.trim() ? 0.35 : 1,
              }}
              aria-label="Send reply"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Desktop arrows */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-20"
          style={{ background: "rgba(0,0,0,0.5)" }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>`
  );
}

fs.writeFileSync(p, s);
console.log("StatusViewer.jsx reply wired");
