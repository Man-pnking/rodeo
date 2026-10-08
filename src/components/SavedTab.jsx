import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFeed } from "../hooks/useFeed";
import PostCard from "./PostCard.jsx";

export default function SavedTab() {
  const { user } = useAuth();
  const { getSavedPosts, toggleLike, toggleSave, toggleRepost, deletePost } = useFeed(user?.id);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getSavedPosts(user?.id);
      if (!cancelled) {
        setPosts(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return <div className="text-center py-16 text-warm-mute text-sm">Loading saved...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark className="w-10 h-10 text-warm-mute mx-auto mb-4" />
        <h3 className="display-md mb-2 text-warm">Nothing saved</h3>
        <p className="text-body text-sm">Posts you bookmark will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onLike={toggleLike}
          onSave={toggleSave}
          onRepost={toggleRepost}
          onDelete={deletePost}
        />
      ))}
    </div>
  );
}
