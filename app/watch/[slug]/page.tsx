import Link from "next/link";

export default function HomePage() {
  const videos = [
    {
      title: "It's Cool",
      slug: "itscool",
    },
    {
      title: "Video 2",
      slug: "video2",
    },
    {
      title: "Spaceship",
      slug: "video3",
    },
  ];

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>🔥 Ray'sStream</h1>

      <h2>Video Library</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {videos.map((video) => (
          <Link
            key={video.slug}
            href={`/watch/${video.slug}`}
            style={{
              textDecoration: "none",
              color: "white",
            }}
          >
            <div
              style={{
                background: "#222",
                padding: "20px",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              <h3>{video.title}</h3>
              <p>▶ Watch Video</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
} 

