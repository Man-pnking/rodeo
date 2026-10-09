export default function ProfileStats({ stats, loading }) {
  const followers = stats?.followers ?? 0;
  const likes = stats?.likes ?? 0;

  return (
    <span className="text-warm-mute text-[13px] inline-flex items-center gap-2">
      <span>
        <span className="font-semibold text-warm tabular-nums">
          {loading ? "—" : followers.toLocaleString()}
        </span>{" "}
        Followers
      </span>
      <span className="opacity-40">·</span>
      <span>
        <span className="font-semibold text-warm tabular-nums">
          {loading ? "—" : likes.toLocaleString()}
        </span>{" "}
        Likes
      </span>
    </span>
  );
}
