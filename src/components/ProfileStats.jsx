export default function ProfileStats({ stats, loading }) {
  const items = [
    { label: "Friends", value: stats?.friends ?? 0 },
    { label: "Posts", value: stats?.posts ?? 0 },
    { label: "Status", value: stats?.status ?? 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto px-6 py-6">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-2xl sm:text-3xl font-black text-warm font-mono">
            {loading ? "—" : item.value}
          </div>
          <div className="text-label mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
