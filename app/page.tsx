"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const videos = [
  { slug: "itscool", title: "It's Cool", src: "/videos/itscool.mp4" },
  { slug: "video2", title: "Video 2", src: "/videos/video2.mp4" },
  { slug: "spaceship", title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function WatchPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "itscool";
  const video = videos.find((v) => v.slug === slug);

  if (!video) {
    return (
      <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
        <h1>Video Not Found</h1>
        <Link href="/">← Back Home</Link>
      </main>
    );
  }

  const [views, setViews] = useState(0);

  useEffect(() => {
    const savedViews = localStorage.getItem(`views-${video.slug}`);
    const newViews = savedViews ? Number(savedViews) + 1 : 1;
    setViews(newViews);
    localStorage.setItem(`views-${video.slug}`, String(newViews));
  }, [video.slug]);

  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1>{video.title}</h1>

      <p style={{ color: "#9ca3af" }}>👀 {views} views</p>

      <video
        key={video.src}
        src={video.src}
        controls
        playsInline
        preload="auto"
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: 12,
        }}
      />

      <div style={{ marginTop: 20 }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
