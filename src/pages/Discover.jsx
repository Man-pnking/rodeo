import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MapPin, ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFriendships } from "../hooks/useFriendships";
import { useConversations } from "../hooks/useConversations";
import { useDiscover } from "../hooks/useDiscover";
import { useDiscoverLocations } from "../hooks/useDiscoverLocations";
import FilterTabs from "../components/discover/FilterTabs.jsx";
import PersonRow from "../components/discover/PersonRow.jsx";
import PersonPreviewSheet from "../components/discover/PersonPreviewSheet.jsx";
import LocationPicker from "../components/discover/LocationPicker.jsx";
import EmptyDiscover from "../components/discover/EmptyDiscover.jsx";
import LoadingSkeleton from "../components/discover/LoadingSkeleton.jsx";

const PAD = "px-5";

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends = [] } = useFriendships(user?.id) || {};
  const { getOrCreate } = useConversations(user?.id) || {};
  const { tree: locations } = useDiscoverLocations();

  const [scope, setScope] = useState("nearby");
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState({ country: null, state: null, city: null, label: null });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pendingIds, setPendingIds] = useState(() => new Set());

  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const effectiveScope = location.country ? "place" : scope;

  const { people, loading, loadingMore, error, hasMore, loadMore } = useDiscover(
    effectiveScope,
    query,
    location.country ? location : {}
  );

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);

  const handleTabChange = (nextScope) => {
    setScope(nextScope);
    if (nextScope !== "place") {
      setLocation({ country: null, state: null, city: null, label: null });
    }
  };

  const handlePickLocation = (loc) => {
    setLocation(loc);
    setPickerOpen(false);
  };

  const handleClearLocation = () => {
    setLocation({ country: null, state: null, city: null, label: null });
  };

  const handleOpen = (person) => setSelected(person);

  const handleMessage = async (person) => {
    const { id, error: err } = await getOrCreate(person.id);
    if (err) return alert(err);
    navigate(`/messages/${id}`);
  };

  const handleAdd = (person) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.add(person.id);
      return next;
    });
  };

  return (
    <div
      className="w-full"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0) + 20px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 120px)",
      }}
    >
      <div className={`${PAD} mb-5`}>
        <h1
          className="text-[32px] font-bold leading-[1.05] mb-4"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.028em" }}
        >
          Discover
        </h1>

        <div
          className="flex items-center gap-2 h-12 rounded-2xl px-4 mb-3"
          style={{ background: "var(--bg-soft)" }}
        >
          <Search
            className="w-[18px] h-[18px] shrink-0"
            style={{ color: "var(--text-tertiary)" }}
            strokeWidth={2}
          />
          <input
            type="text"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search by name or @username"
            className="w-full bg-transparent border-0 outline-none text-[15px]"
            style={{ color: "var(--text-primary)" }}
          />
          {rawQuery && (
            <button
              onClick={() => setRawQuery("")}
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}
              aria-label="Clear"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}
        </div>

        <button
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center gap-2 h-10 rounded-2xl px-4 mb-3 text-left"
          style={{
            background: location.country ? "var(--accent-soft)" : "var(--bg-soft)",
          }}
        >
          <MapPin
            className="w-4 h-4 shrink-0"
            style={{ color: location.country ? "var(--accent)" : "var(--text-tertiary)" }}
            strokeWidth={2}
          />
          <span
            className="flex-1 text-[14px] font-medium truncate"
            style={{ color: location.country ? "var(--accent)" : "var(--text-secondary)" }}
          >
            {location.label || "Filter by location"}
          </span>
          {location.country ? (
            <span
              onClick={(e) => { e.stopPropagation(); handleClearLocation(); }}
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}
              role="button"
              aria-label="Clear location"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </span>
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
          )}
        </button>

        {!location.country && (
          <FilterTabs value={scope} onChange={handleTabChange} />
        )}
      </div>

      <div className={PAD}>
        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <div className="text-center py-12">
            <div className="text-[15px] font-semibold mb-2" style={{ color: "var(--danger)" }}>
              Couldn’t load people
            </div>
            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && people.length === 0 && (
          <EmptyDiscover scope={effectiveScope} query={query} />
        )}

        {!loading && !error && people.length > 0 && (
          <div className="flex flex-col">
            {people.map((p) => (
              <PersonRow
                key={p.id}
                person={p}
                isFriend={friendIds.has(p.id)}
                isPending={pendingIds.has(p.id)}
                onOpen={handleOpen}
                onMessage={handleMessage}
                onAdd={handleAdd}
              />
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-4 mx-auto px-5 py-2.5 rounded-full text-[13px] font-semibold"
                style={{
                  background: "var(--bg-soft)",
                  color: "var(--text-primary)",
                  opacity: loadingMore ? 0.6 : 1,
                }}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>

      <LocationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickLocation}
        locations={locations}
        current={location}
      />

      <PersonPreviewSheet
        person={selected}
        onClose={() => setSelected(null)}
        onMessage={handleMessage}
        onAdd={(p) => { handleAdd(p); setSelected(null); }}
        isFriend={selected ? friendIds.has(selected.id) : false}
        isPending={selected ? pendingIds.has(selected.id) : false}
      />
    </div>
  );
}
