"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [subscribers, setSubscribers] = useState(1);
  const [views, setViews] = useState(0);

  useEffect(() => {
    const savedViews = Number(
      localStorage.getItem("raysstream-views") || "0"
    );

    const newViews = savedViews + 1;

    localStorage.setItem(
      "raysstream-views",
      String(newViews)
    );

    setViews(newViews);
  }, []);

  function handleSubscribe() {
    const newCount = subscribers + 1;
    setSubscribers(newCount);
  }

  return (
    <main
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
      }}
    >
      <h1
        style={{
          color: "orange",
          fontSize: "48px",
        }}
      >
        🔥 Ray'sStream
      </h1>

      <p>Welcome to the new Ray'sStream.</p>

      <h2
        style={{
          color: "#00ffcc",
        }}
      >
        Subscribers: {subscribers}
      </h2>

      <button
        onClick={handleSubscribe}
        style={{
          background: "#ff5a4f",
          color: "white",
          border: "none",
          padding: "15px 30px",
          borderRadius: "12px",
          fontSize: "28px",
          cursor: "pointer",
          marginBottom: "30px",
        }}
      >
        Subscribe
      </button>

      <h2>It's Cool</h2>

      <p
        style={{
          color: "#00ffcc",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Views: {views}
      </p>

      <video
        controls
        width="800"
        style={{
          maxWidth: "100%",
          borderRadius: "12px",
        }}
      >
        <source
          src="/videos/itscool.mp4"
          type="video/mp4"
        />
      </video>
    </main>
  );
}
