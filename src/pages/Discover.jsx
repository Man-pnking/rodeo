export default function Discover() {
  return (
    <div className="w-full" style={{ paddingTop: 40, paddingBottom: 200 }}>
      <h1 className="px-5 text-[32px] font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Discover Scroll Test
      </h1>
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="px-5 py-4 mx-5 mb-2 rounded-2xl"
          style={{ background: i % 2 ? "var(--bg-soft)" : "var(--accent-soft)" }}
        >
          Row {i + 1}
        </div>
      ))}
    </div>
  );
}
