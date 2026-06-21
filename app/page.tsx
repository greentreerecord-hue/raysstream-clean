"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [subs, setSubs] = useState(0);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    setSubs(Number(localStorage.getItem("subs") || 0));
    setLikes(Number(localStorage.getItem("likes") || 0));
    setViews(Number(localStorage.getItem("views") || 0));
    setComments(JSON.parse(localStorage.getItem("comments") || "[]"));
  }, []);

  function save(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function subscribe() {
    const next = subs + 1;
    setSubs(next);
    localStorage.setItem("subs", String(next));
  }

  function like() {
    const next = likes + 1;
    setLikes(next);
    localStorage.setItem("likes", String(next));
  }

  function addView() {
    const next = views + 1;
    setViews(next);
    localStorage.setItem("views", String(next));
  }

  function postComment() {
    if (!comment.trim()) return;
    const next = [comment, ...comments];
    setComments(next);
    save("comments", next);
    setComment("");
  }

  return (
    <main style={{ background: "#080808", color: "white", minHeight: "100vh", padding: 24 }}>
      <h1 style={{ color: "red", fontSize: 44 }}>Ray'sStream</h1>

      <button onClick={subscribe} style={{ padding: 14, background: "red", color: "white" }}>
        Subscribe
      </button>

      <h3>Subscribers: {subs}</h3>
      <h3>Views: {views}</h3>
      <h3>Likes: {likes}</h3>

      <button onClick={like} style={{ padding: 12 }}>
        👍 Like
      </button>

      <h2>Video 1</h2>
      <video controls playsInline width="100%" onPlay={addView} style={{ background: "black" }}>
        <source src="/videos/video1.mp4" type="video/mp4" />
      </video>

      <h2>Video 2</h2>
      <video controls playsInline width="100%" onPlay={addView} style={{ background: "black" }}>
        <source src="/videos/video2.mp4" type="video/mp4" />
      </video>

      <h2>Video 3</h2>
      <video controls playsInline width="100%" onPlay={addView} style={{ background: "black" }}>
        <source src="/videos/video3.mp4" type="video/mp4" />
      </video>

      <h2>Comments</h2>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment"
        style={{ padding: 12, width: "70%" }}
      />
      <button onClick={postComment} style={{ padding: 12, marginLeft: 8 }}>
        Post
      </button>

      {comments.map((c, i) => (
        <p key={i} style={{ background: "#222", padding: 12 }}>
          {c}
        </p>
      ))}
    </main>
  );
} 
