import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFeed } from "../hooks/useFeed";
import PostCard from "../components/PostCard.jsx";
import SlideIn from "../components/SlideIn.jsx";

export default function Feed() {
  const { user } = useAuth();
  const {
    posts,
    loading,
    toggleLike,
    toggleSave,
    toggleRepost,
    deletePost,
    reload,
  } = useFeed(user?.id);

  // Refresh feed whenever the tab/window regains focus
  // (so a post created on Profile shows up when you come back)
  useEffect(() => {
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload]);

  return (
    <div className="w-full py-6">
      <SlideIn variant="up">
        <h1 className="display-lg mb-6">Feed</h1>
      </SlideIn>

      {loading && (
        <div className="text-center py-16">
          <div className="text-warm-mute text-sm">Loading feed...</div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <h3 className="display-md mb-2 text-warm">Your feed is empty</h3>
          <p className="text-body">
            Add friends and their posts will show up here.
          </p>
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
              onRepost={toggleRepost}
              onDelete={deletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
