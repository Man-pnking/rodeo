export default function LoadingSkeleton({ rows = 6 }) {
  return (
    <div className="py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 px-1">
          <div
            className="w-12 h-12 rounded-full shrink-0 animate-pulse"
            style={{ background: "var(--bg-soft)" }}
          />
          <div className="flex-1 min-w-0">
            <div className="h-3.5 w-32 rounded-full mb-2 animate-pulse" style={{ background: "var(--bg-soft)" }} />
            <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: "var(--bg-soft)" }} />
          </div>
          <div className="w-9 h-9 rounded-full shrink-0 animate-pulse" style={{ background: "var(--bg-soft)" }} />
        </div>
      ))}
    </div>
  );
}
