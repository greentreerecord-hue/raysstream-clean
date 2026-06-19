"use client";

import Link from "next/link";

const videos: Record<string, { title: string; file: string }> = {
  itscool: {
    title: "It's Cool",
    file: "/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    file: "/video2.mp4",
  },
  video3: {
    title: "Spaceship",
    file: "/video3.mp4",
  },
};

export default function WatchPage({
  params,
}: {
  params: { slug: string };
}) {
  const video = videos[params.slug];

  if (!video) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#111",
          color: "white",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>Video Not Found</h1>
        <p>Available videos:</p>

        <ul>
          <li>
            <Link href="/watch/itscool">It's Cool</Link>
          </li>
          <li>
            <Link href="/watch/video2">Video 2</Link>
          </li>
          <li>
            <Link href="/watch/video3">Spaceship</Link>
          </li>
        </ul>

        <Link href="/">← Back Home</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Link href="/">← Back Home</Link>

      <h1 style={{ marginTop: "20px" }}>{video.title}</h1>

      <video
        controls
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: "900px",
          borderRadius: "12px",
          backgroundColor: "black",
        }}
      >
        <source src={video.file} type="video/mp4" />
        Your browser does not support video playback.
      </video>
    </main>
  );
} 
