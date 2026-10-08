import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Check, X, Phone, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useContacts } from "../hooks/useContacts";
import { useFriendships } from "../hooks/useFriendships";
import ContactsConsent from "../components/ContactsConsent.jsx";
import SlideIn from "../components/SlideIn.jsx";

export default function Discover() {
  const { user } = useAuth();
  const { matches, loading, loadMatches, syncContacts, saveOwnPhone } = useContacts();
  const { requests, acceptRequest, declineRequest, sendRequest, isFriend, pendingTo } = useFriendships(user?.id);
  const [consentOpen, setConsentOpen] = useState(false);
  const [manualPhones, setManualPhones] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.id) loadMatches(user.id);
  }, [user?.id, loadMatches]);

  const onGrant = async (ownPhone) => {
    if (!ownPhone || !user) return;
    setBusy(true);
    await saveOwnPhone(user.id, ownPhone);

    if (navigator.contacts && navigator.contacts.select) {
      try {
        const props = ["tel"];
        const contacts = await navigator.contacts.select(props, { multiple: true });
        const phones = contacts.flatMap((c) => c.tel || []);
        await syncContacts(user.id, phones);
      } catch (e) {
        console.warn("Contacts API denied or unavailable:", e);
      }
    } else {
      // Fallback: no native picker — user pastes numbers manually
      setConsentOpen(false);
      setManualPhones("");
    }
    setBusy(false);
    setConsentOpen(false);
  };

  const onManual = async (ownPhone) => {
    if (!ownPhone || !user) return;
    setBusy(true);
    await saveOwnPhone(user.id, ownPhone);
    setConsentOpen(false);
    setBusy(false);
  };

  const syncManual = async () => {
    if (!manualPhones || !user) return;
    const phones = manualPhones
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (phones.length === 0) return;
    setBusy(true);
    await syncContacts(user.id, phones);
    setBusy(false);
    setManualPhones("");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <SlideIn variant="up">
        <h1 className="display-lg mb-2">Discover</h1>
        <p className="text-body mb-8">Find friends already on Rodeo.</p>
      </SlideIn>

      {requests.length > 0 && (
        <SlideIn variant="up" delay={0.05}>
          <div className="mb-10">
            <div className="text-label mb-4">Friend requests</div>
            <div className="space-y-3">
              {requests.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-full shrink-0"
                      style={{
                        background: r.profile?.avatar_url
                          ? `url(${r.profile.avatar_url}) center/cover`
                          : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-warm font-medium truncate">
                        {r.profile?.display_name || r.profile?.username}
                      </div>
                      <div className="text-xs text-warm-mute truncate">
                        @{r.profile?.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => acceptRequest(r.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(34, 197, 94, 0.15)" }}
                      aria-label="Accept"
                    >
                      <Check className="w-4 h-4 text-green-400" />
                    </button>
                    <button
                      onClick={() => declineRequest(r.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                      aria-label="Decline"
                    >
                      <X className="w-4 h-4 text-warm-mute" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="divider-full mt-6" />
          </div>
        </SlideIn>
      )}

      <SlideIn variant="up" delay={0.1}>
        <div className="mb-10">
          <div className="text-label mb-4">Sync contacts</div>
          <button
            onClick={() => setConsentOpen(true)}
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Find friends from contacts
          </button>
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.15}>
        <div>
          <div className="text-label mb-4">From your contacts</div>
          {loading && <div className="text-warm-mute text-sm py-6">Loading...</div>}

          {!loading && matches.length === 0 && (
            <div className="text-center py-10">
              <Search className="w-8 h-8 text-warm-mute mx-auto mb-3" />
              <p className="text-body text-sm">
                No matches yet. Sync your contacts to find friends.
              </p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div className="space-y-3">
              {matches.map((m) => {
                const friend = isFriend(m.user_id);
                const pending = pendingTo(m.user_id);
                return (
                  <div key={m.user_id} className="flex items-center justify-between gap-3">
                    <Link
                      to={`/u/${m.username}`}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <div
                        className="w-11 h-11 rounded-full shrink-0"
                        style={{
                          background: m.avatar_url
                            ? `url(${m.avatar_url}) center/cover`
                            : "linear-gradient(135deg, #ff6ec7 0%, #a855f7 100%)",
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-warm font-medium truncate">
                          {m.display_name || m.username}
                        </div>
                        <div className="text-xs text-warm-mute truncate">
                          @{m.username}{m.phone_last4 ? ` · ····${m.phone_last4}` : ""}
                        </div>
                      </div>
                    </Link>
                    {!friend && (
                      <button
                        onClick={() => sendRequest(m.user_id)}
                        disabled={pending}
                        className="btn-ghost text-xs flex items-center gap-1.5 shrink-0 px-4 py-2"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {pending ? "Requested" : "Add"}
                      </button>
                    )}
                    {friend && (
                      <span className="text-xs text-iri-pink shrink-0">Friends</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.2} className="mt-12">
        <div className="text-label mb-4">Manual entry</div>
        <textarea
          value={manualPhones}
          onChange={(e) => setManualPhones(e.target.value)}
          placeholder="+234 800 111 2222&#10;+1 555 000 3333&#10;one per line or comma-separated"
          rows={4}
          className="w-full bg-transparent border-0 border-b border-white/15 focus:border-iri-pink pb-3 text-warm placeholder:text-warm-mute outline-none transition-colors resize-none text-sm"
        />
        <button
          onClick={syncManual}
          disabled={busy || !manualPhones.trim()}
          className="btn-primary mt-4 w-full"
        >
          {busy ? "Searching..." : "Search numbers"}
        </button>
      </SlideIn>

      <ContactsConsent
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onGrant={onGrant}
        onManual={onManual}
      />
    </div>
  );
}
