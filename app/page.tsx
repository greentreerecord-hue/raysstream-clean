export default function Home() {
  const videos = [
    { title: "It's Cool", file: "/itscool.mp4" },
    { title: "Video 2", file: "/video2.mp4" },
    { title: "Video 3", file: "/video3.mp4" },
  ];

  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#ff6600" }}>Ray'sStream</h1>
      <p>Watch videos on Ray'sStream.</p>

      {videos.map((video) => (
        <section key={video.file} style={{ marginBottom: "40px" }}>
          <h2>{video.title}</h2>

          <video
            controls
            width="600"
            style={{ maxWidth: "100%", borderRadius: "12px" }}
          >
            <source src={video.file} type="video/mp4" />
          </video>

          <br />
          <br />

          <a
            href={video.file}
            target="_blank"
            style={{
              color: "#00bfff",
              fontSize: "18px",
              textDecoration: "none",
            }}
          >
            Watch Video
          </a>
        </section>
      ))}
    </main>
  );
}
