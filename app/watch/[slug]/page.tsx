"use client";

import Link from "next/link";
import { useState } from "react";

const videos = [
  { title: "It's Cool", slug: "its-cool" },
  { title: "Video 2", slug: "video2" },
  { title: "Spaceship", slug: "video3" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>🔥 Ray'sStream</h1>

      <input
        type="text"
        placeholder="Search videos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 500,
          padding: 12,
          marginBottom: 20,
          fontSize: 16,
        }}
      />

      {filteredVideos.map((video) => (
        <div key={video.slug} style={{ marginBottom: 16 }}>
          <Link href={`/watch/${video.slug}`}>
            {video.title}
          </Link>
        </div>
      ))}
    </main>
  );
} 
