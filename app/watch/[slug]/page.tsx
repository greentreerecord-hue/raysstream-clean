"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

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
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const slug = String(params.slug);
  const video = videos.find((v) => v.slug === slug);

  useEffect(() => {
    const player = videoRef.current;

    if (player) {
      player.muted = true;
      player.play().catch(() => {});
    }
  }, [slug]);

  function goToNextVideo() {
    if (!video) return;

    const currentIndex = videos.findIndex((v) => v.slug === video.slug);
    const nextIndex = currentIndex === videos.length - 1 ? 0 : currentIndex + 1;
    const nextVideo = videos[nextIndex];

    router.push(`/watch/${nextVideo.slug}`);
  }

  if (!video) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#111827",
          color: "white",
          padding: "20px",
        }}
      >
        <h1>Video Not Found</h1>

        <ul>
          {videos.map((v) => (
            <li key={v.slug}>
              <Link href={`/watch/${v.slug}`}>{v.title}</Link>
            </li>
          ))}
        </ul>

        <Link href="/">← Back Home</Link>
      </main>
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
        onEnded={goToNextVideo}
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

      <p style={{ marginTop: "12px", color: "#9ca3af" }}>
        Auto start is on. Auto rotation is on.
      </p>

      <div style={{ marginTop: "20px" }}>
        <Link href="/watch/itscool">It's Cool</Link>{" | "}
        <Link href="/watch/video2">Video 2</Link>{" | "}
        <Link href="/watch/spaceship">Spaceship</Link>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
