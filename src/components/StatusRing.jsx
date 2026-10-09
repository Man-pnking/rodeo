export default function StatusRing({
  src,
  size = 44,
  hasStatus = false,
  hasUnseen = false,
  ringWidth = 3,
  gap = 2,
  fallbackInitial = "",
  onClick,
  className = "",
}) {
  const ringSize = size + (ringWidth + gap) * 2;
  const totalPadding = ringWidth + gap;

  const inner = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: src
          ? `url(${src}) center/cover`
          : "linear-gradient(135deg, var(--brand) 0%, var(--violet) 50%, #3b82f6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!src && fallbackInitial && (
        <span
          style={{
            fontFamily: '"Space Grotesk", Inter, sans-serif',
            fontSize: size * 0.4,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {fallbackInitial[0]?.toUpperCase()}
        </span>
      )}
    </div>
  );

  if (!hasStatus) {
    return (
      <div className={`shrink-0 ${className}`} onClick={onClick} style={{ lineHeight: 0 }}>
        {inner}
      </div>
    );
  }

  // Ring present
  const ringBackground = hasUnseen
    ? "conic-gradient(from 180deg, var(--brand) 0%, var(--violet) 30%, #3b82f6 60%, #22d3ee 85%, var(--brand) 100%)"
    : "conic-gradient(from 180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.18) 100%)";

  return (
    <div
      className={`shrink-0 ${className}`}
      onClick={onClick}
      style={{
        width: ringSize,
        height: ringSize,
        borderRadius: "50%",
        background: ringBackground,
        padding: ringWidth,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        lineHeight: 0,
      }}
    >
      <div
        style={{
          width: size + gap * 2,
          height: size + gap * 2,
          borderRadius: "50%",
          background: "var(--bg)",
          padding: gap,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {inner}
      </div>
    </div>
  );
}
