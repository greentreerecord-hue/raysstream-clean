"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const videos = {
  "its-cool": {
    title: "It's Cool",
    src: "/videos/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    src: "/videos/video2.mp4",
  },
  video3: {
    title: "Spaceship",
    src: "/videos/video3.mp4",
  },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug as keyof typeof videos];

  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    if (!video) return;

    const viewKey = `views-${params.slug}`;
    const likeKey = `likes-${params.slug}`;
    const subKey = "subscribers";
    const commentKey = `comments-${params.slug}`;

    const savedViews = Number(localStorage.getItem(viewKey) || "0") + 1;
    const savedLikes = Number(localStorage.getItem(likeKey) || "0");
    const savedSubs = Number(localStorage.getItem(subKey) || "0");
    const savedComments = JSON.parse(localStorage.getItem(commentKey) || "[]");

    localStorage.setItem(viewKey, String(savedViews));

    setViews(savedViews);
    setLikes(savedLikes);
    setSubscribers(savedSubs);
    setComments(savedComments);
  }, [params.slug, video]);

  if (!video) {
    return (
      <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
        <h1>Video not found</h1>
        <Link href="/" style={{ color: "#00ffff" }}>Back Home</Link>
      </main>
    );
  }

  function handleLike() {
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem(`likes-${params.slug}`, String(newLikes));
  }

  function handleSubscribe() {
    const newSubs = subscribers + 1;
    setSubscribers(newSubs);
    localStorage.setItem("subscribers", String(newSubs));
  }

  function addComment() {
    if (!comment.trim()) return;

    const newComments = [comment, ...comments];
    setComments(newComments);
    setComment("");
    localStorage.setItem(`comments-${params.slug}`, JSON.stringify(newComments));
  }

  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
      <h1 style={{ color: "#ff6a00", fontSize: 36 }}>🔥 Ray'sStream</h1>

      <video
        src={video.src}
        controls
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{
          width: "100%",
          maxWidth: 1000,
          background: "black",
          borderRadius: 12,
        }}
      />

      <h2>{video.title}</h2>

      <p style={{ color: "#aaa" }}>{views} views</p>

      <button onClick={handleLike} style={{ padding: "10px 18px", marginRight: 10 }}>
        👍 Like {likes}
      </button>

      <button
        onClick={handleSubscribe}
        style={{
          padding: "10px 18px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
        }}
      >
        Subscribe {subscribers}
      </button>

      <section style={{ marginTop: 30, maxWidth: 700 }}>
        <h3>Comments</h3>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          style={{ width: "100%", height: 80, padding: 10 }}
        />

        <br />

        <button onClick={addComment} style={{ marginTop: 10, padding: "10px 18px" }}>
          Post Comment
        </button>

        {comments.map((c, i) => (
          <p key={i} style={{ background: "#151515", padding: 12, borderRadius: 8 }}>
            {c}
          </p>
        ))}
      </section>

      <br />
      <Link href="/" style={{ color: "#00ffff" }}>Back Home</Link>
    </main>
  );
} 
