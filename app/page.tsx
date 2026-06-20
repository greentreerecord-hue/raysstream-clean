"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

const videos: Record<string, { title: string; file: string }> = {
  itscool: {
    title: "It's Cool",
    file: "/videos/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    file: "/videos/video2.mp4",
  },
  video3: {
    title: "Spaceship Video",
    file: "/videos/video3.mp4",
  },
};

export default function WatchPage() {
  const params = useParams();
  const slug = String(params.slug);
  const video = videos[slug];

  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  if (!video) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Video not found</h1>
        <a href="/">Back home</a>
      </main>
    );
  }

  function addComment() {
    if (!comment.trim()) return;
    setComments([comment, ...comments]);
    setComment("");
  }

  return (
    <main style={{ padding: 20 }}>
      <a href="/">← Back home</a>

      <h1>{video.title}</h1>

      <video
        key={video.file}
        controls
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "black",
        }}
      >
        <source src={video.file} type="video/mp4" />
        Your browser does not support video.
      </video>

      <p>👁 Views: 1</p>

      <button onClick={() => setLikes(likes + 1)}>
        👍 Like ({likes})
      </button>

      <section style={{ marginTop: 20 }}>
        <h2>Comments</h2>

        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment"
        />

        <button onClick={addComment}>Post</button>

        {comments.map((c, i) => (
          <p key={i}>{c}</p>
        ))}
      </section>
    </main>
  );
} 

