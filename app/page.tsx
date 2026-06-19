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
    setSubscribers(subscribers + 1);
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

      <h2>Subscribers: {subscribers}</h2>

      <button
        onClick={handleSubscribe}
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
        autoPlay
        muted
        loop
        playsInline
        width={800}
        style={{
          maxWidth: "100%",
          borderRadius: "12px",
        }}
      >
        <source
          src="/videos/itscool.mp4"
          type="video/mp4"
        />
        Your browser does not support video playback.
      </video>
    </main>
  );
}
