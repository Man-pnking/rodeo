export function sameDay(aIso, bIso) {
  if (!aIso || !bIso) return false;
  const a = new Date(aIso);
  const b = new Date(bIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function timeOnly(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dayLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d.toISOString(), today.toISOString())) return "Today";
  if (sameDay(d.toISOString(), yesterday.toISOString())) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
