import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFeed } from "../hooks/useFeed";
import Composer from "../components/Composer.jsx";
import PostCard from "../components/PostCard.jsx";
import SlideIn from "../components/SlideIn.jsx";

export default function Feed() {
  const { user } = useAuth();
  const { posts, loading, toggleLike, toggleSave, deletePost, reload } = useFeed(user?.id);
  const [composerOpen, setComposerOpen] = useState(true);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <SlideIn variant="up">
        <h1 className="display-lg mb-6">Home</h1>
      </SlideIn>

      {composerOpen && (
        <SlideIn variant="up" delay={0.05}>
          <div className="pb-6 mb-2">
            <Composer onPosted={reload} />
          </div>
        </SlideIn>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="text-warm-mute text-sm">Loading feed...</div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <h3 className="display-md mb-2 text-warm">No posts yet</h3>
          <p className="text-body">Be the first to share something.</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={toggleLike}
              onSave={toggleSave}
              onDelete={deletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
