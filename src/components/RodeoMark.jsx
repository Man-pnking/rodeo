export default function RodeoMark({ size = 40, variant = "gradient" }) {
  if (variant === "gradient") {
    return (
      <span
        className="gradient-text"
        style={{
          fontFamily: '"Space Grotesk", Inter, sans-serif',
          fontSize: size,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          display: "inline-block",
        }}
      >
        R
      </span>
    );
  }

  return (
    <span
      style={{
        fontFamily: '"Space Grotesk", Inter, sans-serif',
        fontSize: size,
        fontWeight: 800,
        color: "#ffffff",
        lineHeight: 1,
        letterSpacing: "-0.05em",
        display: "inline-block",
      }}
    >
      R
    </span>
  );
}
