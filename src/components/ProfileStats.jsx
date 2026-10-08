export default function ProfileStats({ stats, loading }) {
  const items = [
    { label: "Followers", value: stats?.followers ?? 0 },
    { label: "Likes", value: stats?.likes ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto px-6 py-6">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-warm font-mono">
            {loading ? "—" : item.value.toLocaleString()}
          </div>
          <div className="text-label mt-1.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
