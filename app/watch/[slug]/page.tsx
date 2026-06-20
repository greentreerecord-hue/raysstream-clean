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

export default function WatchPage({
  params,
}: {
  params: { slug: string };
}) {
  const video =
    videos[params.slug as keyof typeof videos];

  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!video) return;

    const viewKey = `views-${params.slug}`;
    const likeKey = `likes-${params.slug}`;
    const commentKey = `comments-${params.slug}`;

    const savedViews =
      Number(localStorage.getItem(viewKey) || "0") + 1;

    localStorage.setItem(
      viewKey,
      String(savedViews)
    );

    setViews(savedViews);
    setLikes(
      Number(localStorage.getItem(likeKey) || "0")
    );

    setComments(
      JSON.parse(
        localStorage.getItem(commentKey) || "[]"
      )
    );
  }, [params.slug, video]);

  if (!video) {
    return (
      <main
        style={{
          background: "#050505",
          color: "white",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        <h1>Video not found</h1>

        <Link
          href="/"
          style={{ color: "#00ffff" }}
        >
          ← Back Home
        </Link>
      </main>
    );
  }

  function handleLike() {
    const newLikes = likes + 1;

    setLikes(newLikes);

    localStorage.setItem(
      `likes-${params.slug}`,
      String(newLikes)
    );
  }

  function addComment() {
    if (!comment.trim()) return;

    const updated = [comment, ...comments];

    setComments(updated);

    localStorage.setItem(
      `comments-${params.slug}`,
      JSON.stringify(updated)
    );

    setComment("");
  }

  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <h1
        style={{
          color: "#ff6a00",
          fontSize: 36,
        }}
      >
        🔥 Ray'sStream
      </h1>

      <video
        src={video.src}
        controls
        autoPlay
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

      <p>{views} views</p>

      <button
        onClick={handleLike}
        style={{
          padding: "10px 16px",
          marginRight: 10,
        }}
      >
        👍 Like ({likes})
      </button>

      <h3 style={{ marginTop: 30 }}>
        Comments
      </h3>

      <textarea
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        placeholder="Add a comment..."
        style={{
          width: "100%",
          maxWidth: 700,
          height: 100,
          padding: 10,
        }}
      />

      <br />

      <button
        onClick={addComment}
        style={{
          marginTop: 10,
          padding: "10px 16px",
        }}
      >
        Post Comment
      </button>

      <div style={{ marginTop: 20 }}>
        {comments.map((c, i) => (
          <div
            key={i}
            style={{
              background: "#151515",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            {c}
          </div>
        ))}
      </div>

      <br />

      <Link
        href="/"
        style={{ color: "#00ffff" }}
      >
        ← Back Home
      </Link>
    </main>
  );
} 

