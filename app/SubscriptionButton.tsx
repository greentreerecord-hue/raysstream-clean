"use client";

import { useState } from "react";

export default function Home() {
  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState(1);

  function handleSubscribe() {
    if (!subscribed) {
      setSubscribed(true);
      setCount(count + 1);
    }
  }

  return (
    <main
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#ff6600" }}>🔥 Ray'sStream</h1>

      <p>Welcome to the new Ray'sStream.</p>

      <button
        onClick={handleSubscribe}
        style={{
          background: subscribed ? "#444" : "#ff0000",
          color: "#fff",
          border: "none",
          padding: "14px 28px",
          fontSize: "20px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </button>

      <div
        style={{
          marginTop: "12px",
          marginBottom: "30px",
          fontSize: "24px",
          fontWeight: "bold",
          color: "#ffffff",
        }}
      >
        {count} subscribers
      </div>

      <h2>It's Cool</h2>
      <video controls width="700" style={{ maxWidth: "100%" }}>
        <source src="/itscool.mp4" type="video/mp4" />
      </video>

      <h2 style={{ marginTop: "30px" }}>Video 2</h2>
      <video controls width="700" style={{ maxWidth: "100%" }}>
        <source src="/video2.mp4" type="video/mp4" />
      </video>
    </main>
  );
}
