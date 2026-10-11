export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <div className="text-4xl mb-3">👋</div>
      <div className="text-[15px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Say hi
      </div>
      <div className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
        This is the beginning of your conversation
      </div>
    </div>
  );
}
