"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [subscribers, setSubscribers] = useState(1);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const savedViews = Number(localStorage.getItem("raysstream-views") || "0");
    const newViews = savedViews + 1;
    localStorage.setItem("raysstream-views", String(newViews));
    setViews(newViews);

    const savedLikes = Number(localStorage.getItem("raysstream-likes") || "0");
    setLikes(savedLikes);
  }, []);

  function handleSubscribe() {
    setSubscribers(subscribers + 1);
  }

  function handleLike() {
    const newLikes = likes + 1;
    localStorage.setItem("raysstream-likes", String(newLikes));
    setLikes(newLikes);
  }

  return (
    <main style={{ background: "#111", minHeight: "100vh", color: "white", padding: "40px" }}>
      <h1 style={{ color: "orange", fontSize: "48px" }}>🔥 Ray'sStream</h1>

      <p>Welcome to the new Ray'sStream.</p>

      <h2 style={{ color: "#00ffcc" }}>Subscribers: {subscribers}</h2>

      <button
        onClick={handleSubscribe}
        style={{
          background: "#ff4d4d",
          color: "white",
          border: "none",
          padding: "15px 30px",
          borderRadius: "12px",
          fontSize: "24px",
          cursor: "pointer",
        }}
      >
        Subscribe
      </button>

      <h2 style={{ marginTop: "30px" }}>It's Cool</h2>

      <p style={{ color: "#00ffcc", fontSize: "24px", fontWeight: "bold" }}>
        Views: {views}
      </p>

      <video
        src="/itscool.mp4"
        controls
        width={800}
        style={{
          maxWidth: "100%",
          borderRadius: "12px",
          background: "#000",
        }}
      >
        Your browser does not support video.
      </video>

      <br />

      <button
        onClick={handleLike}
        style={{
          background: "#00ffcc",
          color: "#111",
          border: "none",
          padding: "12px 24px",
          borderRadius: "10px",
          fontSize: "22px",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        👍 Like {likes}
      </button>
    </main>
  );
}
