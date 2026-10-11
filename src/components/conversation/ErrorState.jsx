export default function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-8 px-6">
      <div
        className="text-[15px] font-semibold mb-2"
        style={{ color: "var(--danger)" }}
      >
        Couldn’t load messages
      </div>
      <div
        className="text-[13px] mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        {message || "Something went wrong."}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
