"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const videos = [
  {
    title: "It's Cool",
    src: "/videos/itscool.mp4",
  },
  {
    title: "Video 2",
    src: "/videos/video2.mp4",
  },
  {
    title: "Spaceship",
    src: "/videos/video3.mp4",
  },
];

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);

  const video = videos[index];

  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;

    player.muted = true;
    player.src = video.src;
    player.load();

    const timer = setTimeout(() => {
      player.play().catch(() => {});
    }, 500);

    return () => clearTimeout(timer);
  }, [index, video.src]);

  function nextVideo() {
    setIndex((old) => (old + 1) % videos.length);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1>{video.title}</h1>

      <video
        ref={videoRef}
        controls
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={nextVideo}
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: 12,
        }}
      />

      <br />

      <button
        onClick={nextVideo}
        style={{
          marginTop: 20,
          padding: "12px 20px",
          background: "#f97316",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
        }}
      >
        Next Video
      </button>

      <p>Auto start ON • Auto rotation ON</p>

      <Link href="/" style={{ color: "#93c5fd" }}>
        ← Back Home
      </Link>
    </main>
  );
} 
