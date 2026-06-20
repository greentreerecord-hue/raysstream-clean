"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

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
  const params = useParams();
  const slug = String(params?.slug || "itscool");

  const video =
    videos.find((v) => v.slug === slug) || videos[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>{video.title}</h1>

      <video
        src={video.src}
        controls
        style={{
          width: "100%",
          maxWidth: "1000px",
          borderRadius: "12px",
          background: "black",
        }}
      />

      <div style={{ marginTop: "20px" }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
