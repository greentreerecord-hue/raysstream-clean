import Link from "next/link";

const videos = [
  {
    title: "It's Cool",
    description: "Ray'sStream music video",
    href: "/watch",
  },
  {
    title: "Video 2",
    description: "Second Ray'sStream video",
    href: "/watch",
  },
  {
    title: "Spaceship",
    description: "Spaceship video",
    href: "/watch",
  },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1 style={{ color: "#f97316" }}>Ray&apos;sStream</h1>

      <p style={{ color: "#9ca3af" }}>
        Video library
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {videos.map((video) => (
          <Link
            key={video.title}
            href={video.href}
            style={{
              background: "#1f2937",
              padding: 20,
              borderRadius: 12,
              color: "white",
              textDecoration: "none",
            }}
          >
            <div style={{ background: "black", height: 140, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ▶ Play
            </div>

            <h2>{video.title}</h2>
            <p style={{ color: "#9ca3af" }}>{video.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 

