const videos = [
  { slug: "itscool", title: "It's Cool", file: "/videos/itscool.mp4" },
  { slug: "video2", title: "Video 2", file: "/videos/video2.mp4" },
  { slug: "video3", title: "Spaceship Video", file: "/videos/video3.mp4" },
];

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "Arial", background: "#111", color: "white", minHeight: "100vh" }}>
      <h1>🔥 Ray'sStream</h1>
      <p>Video library</p>

      {videos.map((video) => (
        <a
          key={video.slug}
          href={`/watch/${video.slug}`}
          style={{
            display: "block",
            color: "white",
            textDecoration: "none",
            background: "#222",
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            maxWidth: 600,
          }}
        >
          <video
            src={video.file}
            muted
            playsInline
            style={{ width: "100%", borderRadius: 10, background: "black" }}
          />
          <h2>{video.title}</h2>
          <p>Click to watch</p>
        </a>
      ))}
    </main>
  );
} 
