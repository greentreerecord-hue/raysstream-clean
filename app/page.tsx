"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [subs, setSubs] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    setViews(Number(localStorage.getItem("views") || 0));
    setLikes(Number(localStorage.getItem("likes") || 0));
    setSubs(Number(localStorage.getItem("subs") || 0));
    setComments(JSON.parse(localStorage.getItem("comments") || "[]"));
  }, []);

  function addView() {
    const next = views + 1;
    setViews(next);
    localStorage.setItem("views", String(next));
  }

  function addLike() {
    const next = likes + 1;
    setLikes(next);
    localStorage.setItem("likes", String(next));
  }

  function subscribe() {
    const next = subs + 1;
    setSubs(next);
    localStorage.setItem("subs", String(next));
  }

  function postComment() {
    if (!comment.trim()) return;
    const next = [comment, ...comments];
    setComments(next);
    localStorage.setItem("comments", JSON.stringify(next));
    setComment("");
  }

  return (
    <main style={{ background: "#0b0b0b", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "red" }}>Ray'sStream</h1>

      <button onClick={subscribe}>Subscribe</button>
      <p>Subscribers: {subs}</p>

      <button onClick={addLike}>👍 Like</button>
      <p>Likes: {likes}</p>

      <p>Views: {views}</p>

      <h2>Video 1</h2>
      <video controls playsInline preload="metadata" width="100%" onPlay={addView}>
        <source src="/videos/video1.mp4" type="video/mp4" />
        Your browser cannot play this video.
      </video>

      <h2>Video 2</h2>
      <video controls playsInline preload="metadata" width="100%" onPlay={addView}>
        <source src="/videos/video2.mp4" type="video/mp4" />
        Your browser cannot play this video.
      </video>

      <h2>Video 3</h2>
      <video controls playsInline preload="metadata" width="100%" onPlay={addView}>
        <source src="/videos/video3.mp4" type="video/mp4" />
        Your browser cannot play this video.
      </video>

      <h2>Comments</h2>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment"
        style={{ padding: 10, width: "70%" }}
      />
      <button onClick={postComment}>Post</button>

      {comments.map((c, i) => (
        <p key={i}>{c}</p>
      ))}
    </main>
  );
} 
