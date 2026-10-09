export default function ProfileStats({ stats, loading }) {
  const items = [
    { label: "Posts", value: stats?.posts ?? stats?.tweets ?? 0 },
    { label: "Followers", value: stats?.followers ?? 0 },
    { label: "Likes", value: stats?.likes ?? 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-[18px] sm:text-[20px] font-bold text-warm tabular-nums leading-none">
            {loading ? "—" : formatCount(item.value)}
          </div>
          <div
            className="text-[11px] mt-1.5 font-medium tracking-wide"
            style={{ color: "var(--text-tertiary)" }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatCount(n) {
  if (n === 0) return "0";
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (n < 1000000) return Math.round(n / 1000) + "k";
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
}
