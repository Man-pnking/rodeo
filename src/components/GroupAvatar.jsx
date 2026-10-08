export default function GroupAvatar({ group, members = [], size = 48 }) {
  const url = group?.avatar_url;

  if (url) {
    return (
      <div
        className="rounded-full shrink-0"
        style={{
          width: size,
          height: size,
          background: `url(${url}) center/cover`,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
    );
  }

  // Auto-generate from first 3 members
  const shown = members.slice(0, 3);
  const colors = ["#ff6ec7", "#a855f7", "#3b82f6"];

  return (
    <div
      className="rounded-full shrink-0 overflow-hidden grid grid-cols-2 gap-[1px]"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.05)",
        padding: 2,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {shown.map((m, i) => (
        <div
          key={m.user_id || i}
          className="rounded-full"
          style={{
            background: m.profile?.avatar_url
              ? `url(${m.profile.avatar_url}) center/cover`
              : colors[i % colors.length],
            gridColumn: shown.length === 1 ? "span 2" : undefined,
          }}
        />
      ))}
    </div>
  );
}
