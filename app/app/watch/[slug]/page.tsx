"use client";

import Link from "next/link";

const videos: Record<string, { title: string; file: string }> = {
  itscool: { title: "It's Cool", file: "/itscool.mp4" },
  video2: { title: "Video 2", file: "/video2.mp4" },
  video3: { title: "Spaceship", file: "/video3.mp4" },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug];

  if (!video) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Video not found</h1>
        <Link href="/">Back home</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 20 }}>
      <Link href="/">← Back home</Link>
      <h1>{video.title}</h1>

      <video
        controls
        autoPlay
        muted
        loop
        playsInline
        style={{ width: "100%", maxWidth: 900, background: "black" }}
      >
        <source src={video.file} type="video/mp4" />
      </video>

      <p>Views: 1</p>

      <button>👍 Like</button>
      <button style={{ marginLeft: 10 }}>🔴 Subscribe</button>

      <div style={{ marginTop: 20 }}>
        <h2>Comments</h2>
        <input placeholder="Write a comment" />
        <button style={{ marginLeft: 10 }}>Post</button>
      </div>
    </main>
  );
} 

