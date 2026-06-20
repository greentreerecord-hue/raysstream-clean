import Link from "next/link";

const videos = [
  {
    title: "It's Cool",
    description: "Ray'sStream music video",
    href: "/watch?video=0",
  },
  {
    title: "Video 2",
    description: "Second Ray'sStream video",
    href: "/watch?video=1",
  },
  {
    title: "Spaceship",
    description: "Spaceship video",
    href: "/watch?video=2",
  },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1 style={{ color: "#f97316" }}>Ray&apos;sStream</h1>
      <p style={{ color: "#9ca3af" }}>Watch videos, like, comment, and subscribe.</p>

      <h2 style={{ marginTop: 30 }}>Video Library</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 20 }}>
        {videos.map((video) => (
          <Link
            key={video.title}
            href={video.href}
            style={{ background: "#1f2937", padding: 20, borderRadius: 12, color: "white", textDecoration: "none" }}
          >
            <div style={{ height: 140, background: "black", borderRadius: 10, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
              ▶ Play
            </div>
            <h3>{video.title}</h3>
            <p style={{ color: "#9ca3af" }}>{video.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 
