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
      <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px" }}>
        <h1>Video not found</h1>
        <p>Slug: {params.slug}</p>
        <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
      </main>
    );
  }

  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: "24px" }}>
      <h1 style={{ color: "#ff6a00", fontSize: "36px" }}>🔥 Ray'sStream</h1>

      <h2>{video.title}</h2>

      <video
        src={video.src}
        controls
        playsInline
        preload="auto"
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: "12px",
        }}
      />

      <p style={{ color: "#aaa" }}>Video file: {video.src}</p>

      <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
    </main>
  );
} 
