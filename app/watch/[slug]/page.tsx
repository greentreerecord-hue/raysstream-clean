"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const videos: Record<string, { src: string }> = {
  itscool: { src: "/itscool.mp4" },
  video2: { src: "/video2.mp4" },
  video3: { src: "/video3.mp4" },
};

export default function WatchPage({
  params,
}: {
  params: { slug: string };
}) {
  const video = videos[params.slug];
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const savedLikes = localStorage.getItem(`likes-${params.slug}`);
    setLikes(savedLikes ? Number(savedLikes) : 0);
  }, [params.slug]);

  function handleLike() {
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem(`likes-${params.slug}`, String(newLikes));
  }

  if (!video) {
    return (
      <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
        <h1>Video not found</h1>
        <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
      </main>
    );
  }

  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
      <video
        src={video.src}
        controls
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: 1000, background: "black" }}
      />

      <br />
      <br />

      <button
        onClick={handleLike}
        style={{
          padding: "10px 18px",
          fontSize: 18,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        👍 Like {likes}
      </button>

      <br />
      <br />

      <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
    </main>
  );
} 
