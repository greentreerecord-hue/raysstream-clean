"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState(1);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("raysstream-subscribed");
    const savedComments = localStorage.getItem("raysstream-comments");

    if (saved === "yes") {
      setSubscribed(true);
      setCount(2);
    }

    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  function handleSubscribe() {
    if (!subscribed) {
      localStorage.setItem("raysstream-subscribed", "yes");
      setSubscribed(true);
      setCount(2);
    }
  }

  function addComment() {
    if (comment.trim() === "") return;

    const newComments = [comment, ...comments];
    setComments(newComments);
    localStorage.setItem("raysstream-comments", JSON.stringify(newComments));
    setComment("");
  }

  return (
    <main style={{ background: "#111", color: "#fff", minHeight: "100vh", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#ff6600" }}>🔥 Ray'sStream</h1>
      <p>Welcome to the new Ray'sStream.</p>

      <h2 style={{ color: "#00ff99" }}>Subscribers: {count}</h2>

      <button onClick={handleSubscribe} style={{ background: subscribed ? "#444" : "#ff0000", color: "#fff", border: "none", padding: "14px 28px", fontSize: "20px", borderRadius: "10px", cursor: "pointer", marginBottom: "30px" }}>
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </button>

      <h2>It's Cool</h2>
      <video controls width="700" style={{ maxWidth: "100%" }}>
        <source src="/itscool.mp4" type="video/mp4" />
      </video>

      <h2 style={{ marginTop: "30px" }}>Video 2</h2>
      <video controls width="700" style={{ maxWidth: "100%" }}>
        <source src="/video2.mp4" type="video/mp4" />
      </video>

      <section style={{ marginTop: "40px" }}>
        <h2>Comments</h2>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          style={{ width: "100%", maxWidth: "700px", height: "90px", padding: "12px", fontSize: "16px", borderRadius: "8px" }}
        />

        <br />

        <button onClick={addComment} style={{ marginTop: "10px", background: "#ff6600", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>
          Post Comment
        </button>

        {comments.map((c, index) => (
          <div key={index} style={{ background: "#222", padding: "12px", borderRadius: "8px", marginTop: "12px", maxWidth: "700px" }}>
            {c}
          </div>
        ))}
      </section>
    </main>
  );
} 
