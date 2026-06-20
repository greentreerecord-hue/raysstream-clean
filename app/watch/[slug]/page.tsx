import Link from "next/link";

const videos: Record<string, { src: string }> = {
  itscool: { src: "/itscool.mp4" },
  video2: { src: "/video2.mp4" },
  video3: { src: "/video3.mp4" },
};

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = videos[slug];

  if (!video) {
    return (
      <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
        <h1>Video not found</h1>
        <p>Slug: {slug}</p>
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

      <button style={{ padding: "10px 18px", fontSize: 18, borderRadius: 8 }}>
        👍 Like
      </button>

      <br />
      <br />

      <Link href="/" style={{ color: "#00ffff" }}>← Back Home</Link>
    </main>
  );
} 
