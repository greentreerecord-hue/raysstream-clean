"use client";

import { useEffect, useState } from "react";

const videos = [
  { title: "It's Cool", slug: "itscool" },
  { title: "Video 2", slug: "video2" },
  { title: "Spaceship", slug: "video3" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [subscribers, setSubscribers] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("raysstream_subscribers");
    if (saved) setSubscribers(Number(saved));
  }, []);

  function subscribe() {
    const next = subscribers + 1;
    setSubscribers(next);
    localStorage.setItem("raysstream_subscribers", String(next));
  }

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "44px" }}>
        🔥 Ray&apos;sStream
      </h1>

      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <button
          onClick={subscribe}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "15px 35px",
            borderRadius: "10px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          Subscribe
        </button>

        <p style={{ fontSize: "20px" }}>Subscribers: {subscribers}</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "90%",
            maxWidth: "500px",
            padding: "15px",
            fontSize: "18px",
            borderRadius: "10px",
            border: "none",
          }}
        />
      </div>

      <h2 style={{ textAlign: "center" }}>Video Library</h2>

      <div
        style={{
          display: "grid",
          gap: "20px",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {filteredVideos.map((video) => (
          <a
            key={video.slug}
            href={`/watch/${video.slug}`}
            style={{
              background: "#222",
              color: "white",
              padding: "25px",
              borderRadius: "14px",
              textDecoration: "none",
              fontSize: "24px",
              fontWeight: "bold",
              display: "block",
            }}
          >
            ▶ {video.title}
            <p style={{ fontSize: "16px", fontWeight: "normal" }}>
              Click to watch video
            </p>
          </a>
        ))}
      </div>
    </main>
  );
} 
