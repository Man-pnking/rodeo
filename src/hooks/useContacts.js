import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { hashPhone, last4 } from "../lib/phoneHash";

export function useContacts() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save current user's own phone (hashed)
  const saveOwnPhone = useCallback(async (userId, phone) => {
    const hash = await hashPhone(phone);
    const l4 = last4(phone);
    const { error } = await supabase
      .from("profiles")
      .update({ phone_hash: hash, phone_last4: l4 })
      .eq("id", userId);
    return { error: error?.message || null };
  }, []);

  // Upload a list of contact phone numbers, match them, save matches
  const syncContacts = useCallback(async (userId, phones) => {
    setLoading(true);
    setError(null);

    const hashes = [];
    for (const p of phones) {
      const h = await hashPhone(p);
      if (h) hashes.push({ owner_id: userId, contact_hash: h });
    }

    if (hashes.length === 0) {
      setLoading(false);
      setMatches([]);
      return { matches: [] };
    }

    // Save contacts (dedup by unique constraint)
    const { error: insErr } = await supabase
      .from("contacts")
      .upsert(hashes, { onConflict: "owner_id,contact_hash", ignoreDuplicates: true });

    if (insErr) {
      setError(insErr.message);
      setLoading(false);
      return { error: insErr.message };
    }

    // Find matched users
    const hashList = hashes.map((h) => h.contact_hash);
    const { data, error: rpcErr } = await supabase.rpc("find_users_by_hashes", {
      hashes: hashList,
    });

    if (rpcErr) {
      setError(rpcErr.message);
      setLoading(false);
      return { error: rpcErr.message };
    }

    setMatches(data || []);
    setLoading(false);
    return { matches: data || [] };
  }, []);

  // Load existing matches (without re-uploading)
  const loadMatches = useCallback(async (userId) => {
    setLoading(true);
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("contact_hash")
      .eq("owner_id", userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!contacts || contacts.length === 0) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const hashes = contacts.map((c) => c.contact_hash);
    const { data, error: rpcErr } = await supabase.rpc("find_users_by_hashes", {
      hashes,
    });

    if (rpcErr) setError(rpcErr.message);
    else setMatches(data || []);
    setLoading(false);
  }, []);

  return { matches, loading, error, saveOwnPhone, syncContacts, loadMatches };
}
