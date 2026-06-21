"use client";

import { useEffect, useState } from "react";

const videos = [
  { title: "Video 1", file: "/videos/video1.mp4" },
  { title: "Video 2", file: "/videos/video2.mp4" },
  { title: "Video 3", file: "/videos/video3.mp4" },
];

export default function Home() {
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [subs, setSubs] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    setLikes(Number(localStorage.getItem("likes") || 0));
    setViews(Number(localStorage.getItem("views") || 0) + 1);
    setSubs(Number(localStorage.getItem("subs") || 0));
    setComments(JSON.parse(localStorage.getItem("comments") || "[]"));
  }, []);

  useEffect(() => {
    localStorage.setItem("views", String(views));
  }, [views]);

  function likeVideo() {
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem("likes", String(newLikes));
  }

  function subscribe() {
    const newSubs = subs + 1;
    setSubs(newSubs);
    localStorage.setItem("subs", String(newSubs));
  }

  function addComment() {
    if (!comment.trim()) return;
    const newComments = [comment, ...comments];
    setComments(newComments);
    localStorage.setItem("comments", JSON.stringify(newComments));
    setComment("");
  }

  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "red", fontSize: 42 }}>Ray&apos;sStream</h1>
      <p>Videos • Likes • Views • Comments • Subscribers</p>

      <h2>Views: {views}</h2>
      <h2>Subscribers: {subs}</h2>

      <button onClick={subscribe} style={buttonStyle}>
        Subscribe
      </button>

      {videos.map((v) => (
        <section key={v.file} style={{ marginTop: 30 }}>
          <h2>{v.title}</h2>

          <video controls playsInline style={{ width: "100%", maxWidth: 800, background: "black" }}>
            <source src={v.file} type="video/mp4" />
            Your browser does not support video.
          </video>
        </section>
      ))}

      <section style={{ marginTop: 30 }}>
        <button onClick={likeVideo} style={buttonStyle}>
          👍 Like {likes}
        </button>
      </section>

      <section style={{ marginTop: 30, maxWidth: 800 }}>
        <h2>Comments</h2>

        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid gray",
          }}
        />

        <button onClick={addComment} style={buttonStyle}>
          Post Comment
        </button>

        {comments.map((c, i) => (
          <p key={i} style={{ background: "#222", padding: 12, borderRadius: 8 }}>
            {c}
          </p>
        ))}
      </section>
    </main>
  );
}

const buttonStyle = {
  marginTop: 12,
  padding: "12px 18px",
  background: "red",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
}; 
