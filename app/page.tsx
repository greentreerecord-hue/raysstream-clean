"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [subs, setSubs] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("raysstream_subscribers");
    if (saved) setSubs(Number(saved));
  }, []);

  const subscribe = () => {
    const next = subs + 1;
    setSubs(next);
    localStorage.setItem("raysstream_subscribers", String(next));
  };

  const videos = [
    { title: "It's Cool", link: "/watch/itscool" },
    { title: "Video 2", link: "/watch/video2" },
    { title: "Spaceship", link: "/watch/video3" },
  ];

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
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
      <h1 style={{ textAlign: "center" }}>🔥 Ray'sStream</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={subscribe}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "8px",
            fontSize: "18px",
          }}
        >
          Subscribe
        </button>

        <p>Subscribers: {subs}</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "90%",
            maxWidth: "500px",
            padding: "12px",
            borderRadius: "8px",
          }}
        />
      </div>

      {filtered.map((video) => (
        <a
          key={video.link}
          href={video.link}
          style={{
            display: "block",
            background: "#222",
            color: "white",
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "10px",
            textDecoration: "none",
          }}
        >
          ▶ {video.title}
        </a>
      ))}
    </main>
  );
} 
