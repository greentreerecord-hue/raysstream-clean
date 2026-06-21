"use client";

import { useState } from "react";

const videos = [
  { title: "It's Cool", file: "/video1.mp4" },
  { title: "Video 2", file: "/video2.mp4" },
  { title: "Spaceship", file: "/video3.mp4" },
];

export default function Home() {
  const [current, setCurrent] = useState(videos[0]);
  const [likes, setLikes] = useState(0);
  const [subs, setSubs] = useState(0);
  const [views, setViews] = useState(1);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Ray'sStream</h1>

      <video
        src={current.file}
        controls
        playsInline
        onPlay={() => setViews((v) => v + 1)}
        style={{ width: "100%", maxWidth: 900, background: "black" }}
      />

      <h2>{current.title}</h2>
      <p>👁 Views: {views}</p>

      <button onClick={() => setLikes(likes + 1)}>👍 Like {likes}</button>

      <button onClick={() => setSubs(subs + 1)} style={{ marginLeft: 10 }}>
        🔴 Subscribe {subs}
      </button>

      <h2>Videos</h2>

      {videos.map((video) => (
        <button
          key={video.file}
          onClick={() => setCurrent(video)}
          style={{ display: "block", marginTop: 10 }}
        >
          ▶ {video.title}
        </button>
      ))}

      <div style={{ marginTop: 20 }}>
        <h2>Comments</h2>

        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment"
          style={{ padding: 8, width: "70%" }}
        />

        <button
          onClick={() => {
            if (!comment.trim()) return;
            setComments([...comments, comment]);
            setComment("");
          }}
          style={{ marginLeft: 10 }}
        >
          Post
        </button>

        {comments.map((c, i) => (
          <p key={i}>💬 {c}</p>
        ))}
      </div>
    </main>
  );
} 
