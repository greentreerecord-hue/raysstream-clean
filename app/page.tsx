import Link from "next/link";

const videos = [
  {
    title: "It's Cool",
    slug: "its-cool",
    file: "/videos/itscool.mp4",
  },
  {
    title: "Video 2",
    slug: "video2",
    file: "/videos/video2.mp4",
  },
  {
    title: "Spaceship",
    slug: "video3",
    file: "/videos/video3.mp4",
  },
];

export default function HomePage() {
  return (
    <main style={{ background: "#050505", minHeight: "100vh", color: "white", padding: "24px" }}>
      <h1 style={{ fontSize: "42px", color: "#ff6a00" }}>🔥 Ray'sStream</h1>
      <p style={{ color: "#aaa", marginBottom: "30px" }}>Home Video Library</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
        {videos.map((video) => (
          <div
            key={video.slug}
            style={{
              background: "#151515",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid #333",
            }}
          >
            <Link href={`/watch/${video.slug}`} style={{ textDecoration: "none", color: "white" }}>
              <video
                src={video.file}
                muted
                playsInline
                preload="metadata"
                style={{ width: "100%", height: "170px", objectFit: "cover", background: "black" }}
              />

              <div style={{ padding: "14px" }}>
                <h2 style={{ fontSize: "20px", margin: "0 0 8px" }}>{video.title}</h2>
                <p style={{ color: "#aaa", margin: 0 }}>Click to watch</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
} 
