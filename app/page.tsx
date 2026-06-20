"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const videos = [
  { title: "It's Cool", src: "/videos/itscool.mp4" },
  { title: "Video 2", src: "/videos/video2.mp4" },
  { title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function WatchPage() {
  const [index, setIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const video = videos[index];

  useEffect(() => {
    const savedComments = localStorage.getItem(`comments-${video.title}`);
    const savedLikes = localStorage.getItem(`likes-${video.title}`);
    const savedLiked = localStorage.getItem(`liked-${video.title}`);

    setComments(savedComments ? JSON.parse(savedComments) : []);
    setLikes(savedLikes ? Number(savedLikes) : 0);
    setLiked(savedLiked === "true");
  }, [video.title]);

  function nextVideo() {
    setIndex((old) => (old === videos.length - 1 ? 0 : old + 1));
  }

  function addComment() {
    if (!comment.trim()) return;

    const updated = [comment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments-${video.title}`, JSON.stringify(updated));
    setComment("");
  }

  function toggleLike() {
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);

    setLiked(newLiked);
    setLikes(newLikes);

    localStorage.setItem(`liked-${video.title}`, String(newLiked));
    localStorage.setItem(`likes-${video.title}`, String(newLikes));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1>{video.title}</h1>

      <video
        src={video.src}
        controls
        playsInline
        preload="auto"
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: 12,
        }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
        <button
          onClick={toggleLike}
          style={{
            padding: "12px 20px",
            background: liked ? "#ef4444" : "#374151",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          👍 {liked ? "Liked" : "Like"} ({likes})
        </button>

        <button
          onClick={nextVideo}
          style={{
            padding: "12px 20px",
            background: "#f97316",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          Next Video
        </button>
      </div>

      <section
        style={{
          marginTop: 30,
          background: "#1f2937",
          padding: 20,
          borderRadius: 12,
          maxWidth: "1000px",
        }}
      >
        <h2>Comments</h2>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 12,
            borderRadius: 8,
          }}
        />

        <button
          onClick={addComment}
          style={{
            marginTop: 10,
            padding: "10px 18px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          Post Comment
        </button>

        <div style={{ marginTop: 20 }}>
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((c, i) => (
              <div
                key={i}
                style={{
                  background: "#111827",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                {c}
              </div>
            ))
          )}
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
