"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [likes, setLikes] = useState(0);
  const [subs, setSubs] = useState(0);
  const [views, setViews] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    setLikes(Number(localStorage.getItem("likes") || 0));
    setSubs(Number(localStorage.getItem("subs") || 0));
    setViews(Number(localStorage.getItem("views") || 0));
    setComments(JSON.parse(localStorage.getItem("comments") || "[]"));
  }, []);

  const addLike = () => {
    const total = likes + 1;
    setLikes(total);
    localStorage.setItem("likes", String(total));
  };

  const addSub = () => {
    const total = subs + 1;
    setSubs(total);
    localStorage.setItem("subs", String(total));
  };

  const addView = () => {
    const total = views + 1;
    setViews(total);
    localStorage.setItem("views", String(total));
  };

  const postComment = () => {
    if (!comment.trim()) return;

    const updated = [comment, ...comments];
    setComments(updated);
    localStorage.setItem("comments", JSON.stringify(updated));
    setComment("");
  };

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "red" }}>Ray'sStream</h1>

      <button onClick={addSub}>Subscribe</button>
      <p>Subscribers: {subs}</p>

      <button onClick={addLike}>👍 Like</button>
      <p>Likes: {likes}</p>

      <p>Views: {views}</p>

      <h2>Video 1</h2>
      <video controls width="100%" onPlay={addView}>
        <source src="/videos/video1.mp4" type="video/mp4" />
      </video>

      <h2>Video 2</h2>
      <video controls width="100%" onPlay={addView}>
        <source src="/videos/video2.mp4" type="video/mp4" />
      </video>

      <h2>Video 3</h2>
      <video controls width="100%" onPlay={addView}>
        <source src="/videos/video3.mp4" type="video/mp4" />
      </video>

      <h2>Comments</h2>

      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        style={{ padding: "10px", width: "70%" }}
      />

      <button onClick={postComment}>Post</button>

      {comments.map((c, i) => (
        <p key={i}>{c}</p>
      ))}
    </main>
  );
} 
