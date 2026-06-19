"use client";

import { useEffect, useState } from "react";

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
  const [subscribers, setSubscribers] = useState(0);

  useEffect(() => {
    const savedSubs = localStorage.getItem("raysstream_subscribers");
    if (savedSubs) setSubscribers(Number(savedSubs));
  }, []);

  function subscribe() {
    const newCount = subscribers + 1;
    setSubscribers(newCount);
    localStorage.setItem("raysstream_subscribers", String(newCount));
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
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "42px" }}>
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
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Subscribe
        </button>

        <p style={{ fontSize: "20px", marginTop: "10px" }}>
          Subscribers: {subscribers}
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input
          type="text"
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
              display: "block",
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
                background: "black",
              }}
            />

            <h2>{video.title}</h2>
            <p>Views: open video to count view</p>
          </a>
        ))}
      </div>
    </main>
  );
}
