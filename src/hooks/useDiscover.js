import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 30;

export function useDiscover(scope = "world", query = "", location = {}) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const reqIdRef = useRef(0);

  const { country = null, state = null, city = null } = location || {};

  const fetchPage = useCallback(
    async (reset) => {
      const reqId = ++reqIdRef.current;
      const offset = reset ? 0 : offsetRef.current;

      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const { data, error: err } = await supabase.rpc("discover_profiles", {
        p_q: query.trim() || null,
        p_scope: scope,
        p_country: country,
        p_state: state,
        p_city: city,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      });

      if (reqId !== reqIdRef.current) return;

      if (err) {
        setError(err.message || "Could not load people.");
        if (reset) setPeople([]);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      setPeople((prev) => (reset ? rows : [...prev, ...rows]));
      offsetRef.current = offset + rows.length;
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
    },
    [scope, query, country, state, city]
  );

  useEffect(() => {
    offsetRef.current = 0;
    fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchPage(false);
  }, [loading, loadingMore, hasMore, fetchPage]);

  return { people, loading, loadingMore, error, hasMore, loadMore };
}
