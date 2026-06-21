"use client";

import { useEffect, useState } from "react";

const videos = [
  { title: "Video 1", src: "/videos/video1.mp4" },
  { title: "Video 2", src: "/videos/video2.mp4" },
  { title: "Video 3", src: "/videos/video3.mp4" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [shares, setShares] = useState(0);
  const [subs, setSubs] = useState(0);
  const [comments, setComments] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const video = videos[current];

  useEffect(() => {
    const saved = localStorage.getItem("raysstream-data");
    if (saved) {
      const data = JSON.parse(saved);
      setLikes(data.likes || 0);
      setViews(data.views || 0);
      setShares(data.shares || 0);
      setSubs(data.subs || 0);
      setComments(data.comments || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "raysstream-data",
      JSON.stringify({ likes, views, shares, subs, comments })
    );
  }, [likes, views, shares, subs, comments]);

  function addView() {
    setViews((v) => v + 1);
  }

  function addComment() {
    if (!comment.trim()) return;
    setComments([comment, ...comments]);
    setComment("");
  }

  function shareVideo() {
    setShares((s) => s + 1);
    navigator.clipboard.writeText(window.location.href);
    alert("Video link copied!");
  }

  return (
    <main style={{ background: "#111", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1>🔥 Ray&apos;sStream</h1>

      <h2>{video.title}</h2>

      <video
        key={video.src}
        width="100%"
        controls
        loop
        playsInline
        onPlay={addView}
        style={{ maxWidth: 900, background: "black" }}
      >
        <source src={video.src} type="video/mp4" />
        Your browser does not support video.
      </video>

      <p>👁 Views: {views}</p>

      <button onClick={() => setLikes(likes + 1)}>👍 Like {likes}</button>

      <button onClick={() => setSubs(subs + 1)} style={{ marginLeft: 10 }}>
        🔔 Subscribe {subs}
      </button>

      <button onClick={shareVideo} style={{ marginLeft: 10 }}>
        🔗 Share {shares}
      </button>

      <h3>Video Library</h3>
      {videos.map((v, index) => (
        <button
          key={v.src}
          onClick={() => setCurrent(index)}
          style={{ display: "block", marginTop: 10 }}
        >
          ▶ {v.title}
        </button>
      ))}

      <h3>Comments</h3>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment..."
        style={{ width: "100%", maxWidth: 600, height: 80 }}
      />

      <br />

      <button onClick={addComment}>Post Comment</button>

      {comments.map((c, i) => (
        <p key={i} style={{ background: "#222", padding: 10 }}>
          {c}
        </p>
      ))}
    </main>
  );
} 
