"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

const videos = {
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
  const slug = params.slug as string;
  const video = videos[slug as keyof typeof videos];

  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<string[]>([]);
  const [comment, setComment] = useState("");

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
        src={video.file}
        controls
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "black",
        }}
      />

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

