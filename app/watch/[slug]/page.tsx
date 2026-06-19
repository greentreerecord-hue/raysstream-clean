"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const videos: Record<string, { title: string; file: string }> = {
  itscool: {
    title: "It's Cool",
    file: "/videos/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    file: "/videos/video2.mp4",
  },
  video3: {
    title: "Spaceship",
    file: "/videos/video3.mp4",
  },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug];
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!video) return;

    const key = `raysstream_views_${params.slug}`;
    const oldViews = Number(localStorage.getItem(key) || "0");
    const newViews = oldViews + 1;

    localStorage.setItem(key, String(newViews));
    setViews(newViews);
  }, [params.slug, video]);

  if (!video) {
    return (
      <main style={{ minHeight: "100vh", background: "#111", color: "white", padding: "30px", fontFamily: "Arial" }}>
        <h1>Video not found</h1>
        <Link href="/" style={{ color: "red" }}>Go back home</Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#111", color: "white", padding: "20px", fontFamily: "Arial" }}>
      <Link href="/" style={{ color: "red", fontSize: "18px" }}>
        ← Back to Ray&apos;sStream
      </Link>

      <h1 style={{ fontSize: "36px", marginTop: "20px" }}>{video.title}</h1>

      <video
        src={video.file}
        controls
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "black",
          borderRadius: "12px",
          display: "block",
        }}
      />

      <p style={{ fontSize: "22px", marginTop: "15px" }}>Views: {views}</p>
    </main>
  );
} 
