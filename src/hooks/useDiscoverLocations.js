import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches all (country, state, city) tuples with people counts and
 * builds a nested tree for the location picker.
 *
 * Shape:
 *   [
 *     { country: "Nigeria", people: 3,
 *       states: [
 *         { state: "Lagos State", people: 2,
 *           cities: [{ city: "Lagos", people: 2 }] },
 *       ] }
 *   ]
 */
export function useDiscoverLocations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase.rpc("discover_locations");
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const tree = useMemo(() => {
    const byCountry = new Map();
    for (const r of rows) {
      if (!r.country) continue;
      if (!byCountry.has(r.country)) {
        byCountry.set(r.country, { country: r.country, people: 0, states: new Map() });
      }
      const c = byCountry.get(r.country);
      c.people += r.people;

      if (!r.state) continue;
      if (!c.states.has(r.state)) {
        c.states.set(r.state, { state: r.state, people: 0, cities: new Map() });
      }
      const s = c.states.get(r.state);
      s.people += r.people;

      if (!r.city) continue;
      if (!s.cities.has(r.city)) {
        s.cities.set(r.city, { city: r.city, people: 0 });
      }
      s.cities.get(r.city).people += r.people;
    }

    return Array.from(byCountry.values())
      .map((c) => ({
        country: c.country,
        people: c.people,
        states: Array.from(c.states.values())
          .map((s) => ({
            state: s.state,
            people: s.people,
            cities: Array.from(s.cities.values()),
          }))
          .sort((a, b) => a.state.localeCompare(b.state)),
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [rows]);

  return { tree, loading, error };
}
