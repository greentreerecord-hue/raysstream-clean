import Link from "next/link";

const videos = {
  "its-cool": {
    title: "It's Cool",
    src: "/videos/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    src: "/videos/video2.mp4",
  },
  video3: {
    title: "Spaceship",
    src: "/videos/video3.mp4",
  },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug as keyof typeof videos];

  if (!video) {
    return (
      <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
        <h1>Video not found</h1>
        <p>Slug: {params.slug}</p>
        <Link href="/" style={{ color: "#00ffff" }}>Back Home</Link>
      </main>
    );
  }

  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
      <h1 style={{ color: "#ff6a00" }}>🔥 Ray'sStream</h1>
      <h2>{video.title}</h2>

      <video
        src={video.src}
        controls
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          maxWidth: 1000,
          background: "black",
          borderRadius: 12,
        }}
      />

      <p style={{ color: "#aaa" }}>Testing file: {video.src}</p>

      <p>
        <a href={video.src} target="_blank" style={{ color: "#00ffff" }}>
          Open raw video file
        </a>
      </p>

      <Link href="/" style={{ color: "#00ffff" }}>Back Home</Link>
    </main>
  );
} 
