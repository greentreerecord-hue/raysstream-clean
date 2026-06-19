"use client";

import { useState } from "react";

const videos = [
  { title: "It's Cool", slug: "itscool", file: "/videos/itscool.mp4" },
  { title: "Video 2", slug: "video2", file: "/videos/video2.mp4" },
  { title: "Spaceship", slug: "video3", file: "/videos/video3.mp4" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ minHeight: "100vh", background: "#111", color: "white", padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "42px", textAlign: "center" }}>🔥 Ray&apos;sStream</h1>

      <p style={{ textAlign: "center", fontSize: "20px" }}>
        Watch videos, subscribe, comment, and grow Ray&apos;sStream.
      </p>

      <div style={{ textAlign: "center", margin: "20px" }}>
        <button style={{ padding: "14px 28px", fontSize: "18px", borderRadius: "10px", background: "red", color: "white", border: "none" }}>
          Subscribe
        </button>

        <p style={{ fontSize: "18px" }}>Subscribers: 0</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "90%", maxWidth: "500px", padding: "15px", fontSize: "18px", borderRadius: "10px", border: "none" }}
        />
      </div>

      <h2 style={{ textAlign: "center" }}>Video Library</h2>

      <div style={{ display: "grid", gap: "25px", maxWidth: "800px", margin: "0 auto" }}>
        {filteredVideos.map((video) => (
          <a
            key={video.slug}
            href={`/watch/${video.slug}`}
            style={{ textDecoration: "none", color: "white", background: "#222", padding: "15px", borderRadius: "12px" }}
          >
            <video
              src={video.file}
              muted
              playsInline
              preload="metadata"
              style={{ width: "100%", borderRadius: "10px", backgroundColor: "black" }}
            />
            <h2>{video.title}</h2>
          </a>
        ))}
      </div>
    </main>
  );
}
