/**
 * Full-screen conversation layout.
 *
 * Uses position: fixed so it escapes any parent-height ambiguity, then
 * a grid with minmax(0, 1fr) for the scrollable middle row. This is the
 * only pattern that reliably pins the composer at the bottom on both
 * desktop Safari and iOS Safari.
 */
export default function ConversationShell({ header, children, composer }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr) auto",
        background: "var(--bg)",
        overflow: "hidden",
        zIndex: 5,
      }}
    >
      {header}
      <div style={{ minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      {composer}
    </div>
  );
}
