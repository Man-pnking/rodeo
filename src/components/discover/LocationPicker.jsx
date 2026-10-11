import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Globe2, ChevronRight, MapPin } from "lucide-react";

export default function LocationPicker({ open, onClose, onPick, locations, current }) {
  const [query, setQuery] = useState("");
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [expandedState, setExpandedState] = useState(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return locations;
    return locations
      .map((c) => {
        const matchCountry = c.country.toLowerCase().includes(q);
        const states = c.states
          .map((s) => {
            const matchState = s.state.toLowerCase().includes(q);
            const cities = s.cities.filter((ci) => ci.city.toLowerCase().includes(q));
            if (matchState || cities.length) return { ...s, cities: matchState ? s.cities : cities };
            return null;
          })
          .filter(Boolean);
        if (matchCountry || states.length) return { ...c, states: matchCountry ? c.states : states };
        return null;
      })
      .filter(Boolean);
  }, [locations, q]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90]"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] z-[91] rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>
                Choose location
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-3">
              <div
                className="flex items-center gap-2 h-10 rounded-xl px-3"
                style={{ background: "var(--bg-soft)" }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country, state, or city"
                  className="w-full bg-transparent border-0 outline-none text-[14px]"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ minHeight: 0 }}>
              {/* All countries */}
              <button
                onClick={() => onPick({ country: null, state: null, city: null, label: "All countries" })}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left"
                style={{
                  background: !current?.country ? "var(--accent-soft)" : "transparent",
                  color: "var(--text-primary)",
                }}
              >
                <Globe2 className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                <span className="text-[14px] font-medium">All countries</span>
              </button>

              {filtered.length === 0 && (
                <div className="text-center py-10 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                  {q ? "No locations match" : "No locations yet"}
                </div>
              )}

              {filtered.map((c) => {
                const cOpen = expandedCountry === c.country;
                return (
                  <div key={c.country}>
                    <button
                      onClick={() => setExpandedCountry(cOpen ? null : c.country)}
                      className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <ChevronRight
                        className="w-4 h-4 shrink-0 transition-transform"
                        style={{ transform: cOpen ? "rotate(90deg)" : "none", color: "var(--text-tertiary)" }}
                      />
                      <span className="text-[14px] font-medium truncate">{c.country}</span>
                      <span className="ml-auto text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {c.people}
                      </span>
                    </button>

                    {cOpen && (
                      <div className="pl-5">
                        <button
                          onClick={() => onPick({ country: c.country, state: null, city: null, label: c.country })}
                          className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left text-[13px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          All of {c.country}
                        </button>

                        {c.states.map((s) => {
                          const sOpen = expandedState === `${c.country}|${s.state}`;
                          const sKey = `${c.country}|${s.state}`;
                          return (
                            <div key={sKey}>
                              <button
                                onClick={() => setExpandedState(sOpen ? null : sKey)}
                                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left text-[13px]"
                                style={{ color: "var(--text-primary)" }}
                              >
                                <ChevronRight
                                  className="w-3.5 h-3.5 shrink-0 transition-transform"
                                  style={{ transform: sOpen ? "rotate(90deg)" : "none", color: "var(--text-tertiary)" }}
                                />
                                <span className="truncate">{s.state}</span>
                                <span className="ml-auto text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>
                                  {s.people}
                                </span>
                              </button>

                              {sOpen && (
                                <div className="pl-5">
                                  {s.cities.map((ci) => (
                                    <button
                                      key={ci.city}
                                      onClick={() => onPick({
                                        country: c.country,
                                        state: s.state,
                                        city: ci.city,
                                        label: `${ci.city}, ${s.state}, ${c.country}`,
                                      })}
                                      className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left text-[12.5px]"
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      <MapPin className="w-3 h-3 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                                      <span className="truncate">{ci.city}</span>
                                      <span className="ml-auto text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                        {ci.people}
                                      </span>
                                    </button>
                                  ))}
                                  {s.cities.length === 0 && (
                                    <div className="py-2 px-3 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                                      No cities yet
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {c.states.length === 0 && (
                          <div className="py-2 px-3 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            No states yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
