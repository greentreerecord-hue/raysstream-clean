import Link from "next/link";

const videos = [
  {
    title: "It's Cool",
    description: "Working video page",
    href: "/watch/itscool",
  },
  {
    title: "Video 2",
    description: "Second video page",
    href: "/watch/video2",
  },
  {
    title: "Spaceship",
    description: "Spaceship video page",
    href: "/watch/spaceship",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: 20,
      }}
    >
      <h1 style={{ color: "#f97316" }}>Ray&apos;sStream</h1>

      <p style={{ color: "#9ca3af" }}>
        Videos • Likes • Views • Comments • Subscribe
      </p>

      <h2 style={{ marginTop: 30 }}>Video Library</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
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
              display: "block",
            }}
          >
            <div
              style={{
                height: 140,
                background: "black",
                borderRadius: 10,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 22,
              }}
            >
              ▶ Open
            </div>

            <h3>{video.title}</h3>
            <p style={{ color: "#9ca3af" }}>{video.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 
