"use client";

import { useEffect, useState } from "react";

const videos = [
  {
    title: "It's Cool",
    src: "/itscool.mp4",
  },
  {
    title: "Video 2",
    src: "/video2.mp4",
  },
  {
    title: "Spaceship",
    src: "/video3.mp4",
  },
];

export default function Home() {
  const [subscribers, setSubscribers] = useState(1);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(videos[0]);

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
    <main
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
      }}
    >
      <h1 style={{ color: "orange", fontSize: "48px" }}>
        🔥 Ray'sStream
      </h1>

      <p>Welcome to the new Ray'sStream.</p>

      <h2 style={{ color: "#00ffcc" }}>
        Subscribers: {subscribers}
      </h2>

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

      <h2 style={{ marginTop: "30px" }}>
        {currentVideo.title}
      </h2>

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
        key={currentVideo.src}
        src={currentVideo.src}
        controls
        width={800}
        style={{
          maxWidth: "100%",
          borderRadius: "12px",
          background: "#000",
        }}
      >
        Your browser does not support video playback.
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

      <h2 style={{ marginTop: "50px", color: "orange" }}>
        Video Library
      </h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {videos.map((video) => (
          <button
            key={video.src}
            onClick={() => setCurrentVideo(video)}
            style={{
              background: "#222",
              color: "white",
              border: "2px solid #00ffcc",
              borderRadius: "12px",
              padding: "20px",
              fontSize: "22px",
              cursor: "pointer",
              width: "220px",
              textAlign: "left",
            }}
          >
            🎬 {video.title}
            <br />
            <span
              style={{
                color: "#00ffcc",
                fontSize: "16px",
              }}
            >
              Click to play
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
