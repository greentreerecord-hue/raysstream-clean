"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const videos = [
  {
    slug: "itscool",
    title: "It's Cool",
    src: "/videos/itscool.mp4",
  },
  {
    slug: "video2",
    title: "Video 2",
    src: "/videos/video2.mp4",
  },
  {
    slug: "spaceship",
    title: "Spaceship",
    src: "/videos/video3.mp4",
  },
];

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const video = videos[currentIndex];

  function playVideo() {
    const player = videoRef.current;
    if (!player) return;

    player.muted = true;
    player.load();

    setTimeout(() => {
      player.play().catch(() => {
        console.log("Autoplay blocked by browser");
      });
    }, 300);
  }

  useEffect(() => {
    playVideo();
  }, [currentIndex]);

  function nextVideo() {
    setCurrentIndex((oldIndex) =>
      oldIndex === videos.length - 1 ? 0 : oldIndex + 1
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>{video.title}</h1>

      <video
        ref={videoRef}
        key={video.src}
        controls
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={playVideo}
        onEnded={nextVideo}
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: "12px",
        }}
      >
        <source src={video.src} type="video/mp4" />
        Your browser does not support video.
      </video>

      <p style={{ color: "#9ca3af" }}>
        Auto start ON • Auto rotation ON
      </p>

      <button
        onClick={nextVideo}
        style={{
          marginTop: "15px",
          padding: "12px 20px",
          background: "#f97316",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        Next Video
      </button>

      <div style={{ marginTop: "20px" }}>
        <Link href="/" style={{ color: "#93c5fd" }}>
          ← Back Home
        </Link>
      </div>
    </main>
  );
} 
