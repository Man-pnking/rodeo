/**
 * Full-screen 100dvh layout for the conversation view.
 * Header (fixed top), messages (scroll), composer (fixed bottom).
 * Uses CSS grid so no child needs absolute positioning.
 */
export default function ConversationShell({ header, children, composer }) {
  return (
    <div
      className="w-full flex-1 min-h-0"
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {header}
      {children}
      {composer}
    </div>
  );
}
