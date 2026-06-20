import Link from "next/link";

const videos: Record<string, { title: string; src: string }> = {
  itscool: {
    title: "It's Cool",
    src: "/itscool.mp4",
  },
  "its-cool": {
    title: "It's Cool",
    src: "/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    src: "/video2.mp4",
  },
  video3: {
    title: "Spaceship",
    src: "/video3.mp4",
  },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug];

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

      <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
    </main>
  );
} 
