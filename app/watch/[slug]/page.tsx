"use client";

import { useParams } from "next/navigation";

const videos: Record<string, { title: string; file: string }> = {
  itscool: { title: "It's Cool", file: "/videos/itscool.mp4" },
  video2: { title: "Video 2", file: "/videos/video2.mp4" },
  video3: { title: "Spaceship Video", file: "/videos/video3.mp4" },
};

export default function WatchPage() {
  const params = useParams();
  const slug = String(params.slug || "itscool");
  const video = videos[slug] || videos.itscool;

  return (
    <main style={{ padding: 20, background: "#111", color: "white", minHeight: "100vh" }}>
      <a href="/" style={{ color: "red" }}>← Home</a>

      <h1>{video.title}</h1>

      <video
        key={video.file}
        controls
        playsInline
        preload="auto"
        style={{ width: "100%", maxWidth: 900, background: "black" }}
      >
        <source src={video.file} type="video/mp4" />
        Video not supported.
      </video>

      <p>Video file path: {video.file}</p>
    </main>
  );
} 

