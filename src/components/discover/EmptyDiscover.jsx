import { Globe2 } from "lucide-react";

export default function EmptyDiscover({ scope, query }) {
  const headline = query
    ? "No one matches that search"
    : scope === "nearby"
    ? "No one nearby yet"
    : scope === "country"
    ? "No one in your country yet"
    : "No one here yet";

  const detail = query
    ? "Try a different name or username."
    : "Invite friends or update your location in Settings to find people.";

  return (
    <div className="text-center py-16 px-6">
      <Globe2
        className="w-10 h-10 mx-auto mb-4"
        style={{ color: "var(--text-tertiary)" }}
        strokeWidth={1.6}
      />
      <div
        className="text-[16px] font-semibold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {headline}
      </div>
      <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
        {detail}
      </div>
    </div>
  );
}
