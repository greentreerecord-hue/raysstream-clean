"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const videos = [
  { title: "It's Cool", src: "/videos/itscool.mp4" },
  { title: "Video 2", src: "/videos/video2.mp4" },
  { title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const video = videos[index];

  useEffect(() => {
    const saved = localStorage.getItem(`comments-${video.title}`);
    setComments(saved ? JSON.parse(saved) : []);
  }, [video.title]);

  function nextVideo() {
    setIndex((old) => (old + 1) % videos.length);
  }

  function addComment() {
    if (!comment.trim()) return;

    const updated = [comment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments-${video.title}`, JSON.stringify(updated));
    setComment("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: 20,
      }}
    >
      <h1>{video.title}</h1>

      <video
        ref={videoRef}
        src={video.src}
        controls
        playsInline
        preload="auto"
        onEnded={nextVideo}
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: 12,
        }}
      />

      <br />

      <button
        onClick={nextVideo}
        style={{
          marginTop: 20,
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

      <section
        style={{
          marginTop: 30,
          maxWidth: "1000px",
          background: "#1f2937",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h2>Comments</h2>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          style={{
            width: "100%",
            minHeight: 90,
            padding: 12,
            borderRadius: 8,
            border: "none",
            resize: "vertical",
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
            <p style={{ color: "#9ca3af" }}>No comments yet.</p>
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
        <Link href="/" style={{ color: "#93c5fd" }}>
          ← Back Home
        </Link>
      </div>
    </main>
  );
} 
