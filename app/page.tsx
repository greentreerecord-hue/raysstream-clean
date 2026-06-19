"use client";

import { useState } from "react";

const videos = [
  {
    title: "It's Cool",
    slug: "itscool",
    file: "/videos/itscool.mp4",
  },
  {
    title: "Video 2",
    slug: "video2",
    file: "/videos/video2.mp4",
  },
  {
    title: "Spaceship",
    slug: "video3",
    file: "/videos/video3.mp4",
  },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "48px",
          marginBottom: "20px",
        }}
      >
        🔥 Ray'sStream
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "15px",
            fontSize: "18px",
            borderRadius: "10px",
            border: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: "25px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {filteredVideos.map((video) => (
          <a
            key={video.slug}
            href={`/watch/${video.slug}`}
            style={{
              textDecoration: "none",
              color: "white",
              background: "#222",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <video
              src={video.file}
              muted
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                borderRadius: "10px",
                backgroundColor: "black",
              }}
            />

            <h2 style={{ marginTop: "10px" }}>{video.title}</h2>
          </a>
        ))}
      </div>
    </main>
  );
} 
