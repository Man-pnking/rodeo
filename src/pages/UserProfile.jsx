import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useProfile } from "../hooks/useProfile";
import { useProfileStats } from "../hooks/useProfileStats";
import { useAuth } from "../hooks/useAuth";
import { useConversations } from "../hooks/useConversations";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader.jsx";
import ProfileStats from "../components/ProfileStats.jsx";
import ProfileTabs from "../components/ProfileTabs.jsx";
import SlideIn from "../components/SlideIn.jsx";

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getOrCreate } = useConversations(user?.id);
  const [startingChat, setStartingChat] = useState(false);
  const [resolvedId, setResolvedId] = useState(null);
  const [lookupDone, setLookupDone] = useState(false);
  const [tab, setTab] = useState("posts");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setResolvedId(data?.id || null);
          setLookupDone(true);
        }
      });
    return () => { cancelled = true; };
  }, [username]);

  const { profile, loading } = useProfile(resolvedId);
  const { stats, loading: statsLoading } = useProfileStats(resolvedId);

  if (!lookupDone || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warm-mute text-sm">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="display-lg mb-2">User not found</h1>
          <p className="text-body">@{username} doesn't exist or was deleted.</p>
        </div>
      </div>
    );
  }

  const isOwn = profile.id === user?.id;

  return (
    <div className="min-h-screen">
      <ProfileHeader
        profile={profile}
        isOwn={isOwn}
        onMessage={async () => {
          if (!profile || startingChat) return;
          setStartingChat(true);
          const { id, error } = await getOrCreate(profile.id);
          setStartingChat(false);
          if (error) { alert(error); return; }
          navigate(`/messages/${id}`);
        }}
        onAddFriend={() => alert("Friend requests coming soon")}
      />

      <SlideIn variant="up" delay={0.1}>
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-4">
          <h1 className="display-lg mb-1">{profile.display_name || profile.username}</h1>
          <p className="text-warm-dim text-sm mb-3">@{profile.username}</p>
          <p className="text-body max-w-2xl">
            {profile.bio || "Hey there! I am using Rodeo."}
          </p>
        </div>
      </SlideIn>

      <SlideIn variant="up" delay={0.15}>
        <ProfileStats stats={stats} loading={statsLoading} />
      </SlideIn>

      <ProfileTabs isOwn={false} value={tab} onChange={setTab} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center py-16">
          <p className="text-body">Nothing here yet.</p>
        </div>
      </div>
    </div>
  );
}
