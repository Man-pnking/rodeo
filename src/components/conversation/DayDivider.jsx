import { dayLabel } from "../../lib/formatTime";

export default function DayDivider({ date }) {
  const label = dayLabel(date);
  if (!label) return null;
  return (
    <div className="flex items-center justify-center my-3">
      <span
        className="text-[11px] font-semibold px-3 py-1 rounded-full"
        style={{
          background: "var(--bg-soft)",
          color: "var(--text-tertiary)",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
