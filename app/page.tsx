const videos = [
  { title: "It&apos;s Cool", src: "/videos/itscool.mp4" },
  { title: "Video 2", src: "/videos/video2.mp4" },
  { title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function Home() {
  return (
    <main style={{ padding: 30, background: "#111", color: "white", minHeight: "100vh" }}>
      <h1>🔥 Ray&apos;sStream</h1>
      <p>3 videos playing.</p>

      {videos.map((video) => (
        <section key={video.src} style={{ marginBottom: 40 }}>
          <h2>{video.title}</h2>
          <video
            src={video.src}
            controls
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", maxWidth: 800 }}
          />
        </section>
      ))}

      <a href="/upload" style={{ color: "red", fontWeight: "bold" }}>
        Creator Upload
      </a>
    </main>
  );
} 
