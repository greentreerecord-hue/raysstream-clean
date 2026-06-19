"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [subscribers, setSubscribers] = useState(1);
  const [views, setViews] = useState(0);

  useEffect(() => {
    const savedViews = Number(localStorage.getItem("raysstream-views") || "0");
    const newViews = savedViews + 1;
    localStorage.setItem("raysstream-views", String(newViews));
    setViews(newViews);
  }, []);

  return (
    <main style={{ background: "#111", minHeight: "100vh", color: "white", padding: "40px" }}>
      <h1 style={{ color: "orange", fontSize: "48px" }}>🔥 Ray'sStream</h1>

      <p>Welcome to the new Ray'sStream.</p>

      <h2>Subscribers: {subscribers}</h2>

      <button
        onClick={() => setSubscribers(subscribers + 1)}
        style={{
          background: "red",
          color: "white",
          border: "none",
          padding: "15px 30px",
          fontSize: "24px",
          borderRadius: "10px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Subscribe
      </button>

      <h2>It's Cool</h2>

      <p style={{ color: "#00ffcc", fontSize: "24px", fontWeight: "bold" }}>
        Views: {views}
      </p>

      <video
        src="/videos/itscool.mp4"
        controls
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        width={800}
        style={{
          maxWidth: "100%",
          borderRadius: "12px",
          background: "black",
          marginTop: "15px",
        }}
      />

      <p style={{ marginTop: "20px" }}>
        If video does not play, open this test:
        <br />
        <a href="/videos/itscool.mp4" style={{ color: "#00ffcc" }}>
          /videos/itscool.mp4
        </a>
      </p>
    </main>
  );
} 
