import Link from "next/link";

const videos: Record<string, { title: string; file: string }> = {
  "its-cool": {
    title: "It's Cool",
    file: "/videos/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    file: "/videos/video2.mp4",
  },
  video3: {
    title: "Spaceship",
    file: "/videos/video3.mp4",
  },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug];

  if (!video) {
    return (
      <main style={{ background: "#050505", minHeight: "100vh", color: "white", padding: "24px" }}>
        <h1>Video not found</h1>
        <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
      </main>
    );
  }

  return (
    <main style={{ background: "#050505", minHeight: "100vh", color: "white", padding: "24px" }}>
      <h1 style={{ color: "#ff6a00", fontSize: "36px" }}>🔥 Ray'sStream</h1>

      <video
        key={video.file}
        controls
        autoPlay
        playsInline
        preload="auto"
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: "12px",
        }}
      >
        <source src={video.file} type="video/mp4" />
        Your browser does not support this video.
      </video>

      <h2 style={{ marginTop: "18px" }}>{video.title}</h2>

      <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
    </main>
  );
} 
