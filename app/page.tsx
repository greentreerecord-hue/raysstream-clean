import Link from "next/link";

const videos = [
  {
    title: "It's Cool",
    description: "Ray'sStream music video",
    src: "/videos/itscool.mp4",
    href: "/watch/itscool",
  },
  {
    title: "Video 2",
    description: "Second Ray'sStream video",
    src: "/videos/video2.mp4",
    href: "/watch/video2",
  },
  {
    title: "Spaceship",
    description: "Spaceship video",
    src: "/videos/video3.mp4",
    href: "/watch/spaceship",
  },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1 style={{ color: "#f97316" }}>Ray&apos;sStream</h1>

      <p style={{ color: "#9ca3af" }}>
        Videos • Likes • Views • Comments • Subscribe
      </p>

      <h2 style={{ marginTop: 30 }}>Video Library</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 20 }}>
        {videos.map((video) => (
          <div
            key={video.title}
            style={{
              background: "#1f2937",
              padding: 20,
              borderRadius: 12,
              color: "white",
            }}
          >
            <video
              src={video.src}
              controls
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                background: "black",
                borderRadius: 10,
              }}
            />

            <h3>{video.title}</h3>

            <p style={{ color: "#9ca3af" }}>{video.description}</p>

            <Link
              href={video.href}
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "10px 16px",
                background: "#dc2626",
                color: "white",
                textDecoration: "none",
                borderRadius: 8,
                fontWeight: "bold",
              }}
            >
              Open Watch Page
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
} 
