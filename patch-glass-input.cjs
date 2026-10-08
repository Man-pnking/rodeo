const fs = require("fs");
const p = "src/components/MessageInput.jsx";
let s = fs.readFileSync(p, "utf8");

// Remove the borderTop from the wrapper
s = s.replace(
  `        className="flex items-end gap-2 px-4 py-3 safe-bottom"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}`,
  `        className="flex items-end gap-2 px-4 py-3 safe-bottom"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}`
);

// Glass pill for the input field
s = s.replace(
  `          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
            placeholder="Message..."
            disabled={disabled}
            className="w-full bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none text-[15px] py-2"
          />`,
  `          <div
            className="flex items-center rounded-full px-4 py-1.5"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
              placeholder="Message..."
              disabled={disabled}
              className="w-full bg-transparent border-0 text-warm placeholder:text-warm-mute outline-none text-[15px] py-1"
            />
          </div>`
);

// iMessage-style blue send button
s = s.replace(
  `          style={{
            background: "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
            opacity: disabled || (!body.trim() && !image) || sending ? 0.35 : 1,
          }}`,
  `          style={{
            background: "linear-gradient(180deg, #0a84ff 0%, #0066cc 100%)",
            boxShadow: "0 4px 14px rgba(10, 132, 255, 0.4)",
            opacity: disabled || (!body.trim() && !image) || sending ? 0.35 : 1,
          }}`
);

fs.writeFileSync(p, s);
console.log("MessageInput.jsx glassed");
