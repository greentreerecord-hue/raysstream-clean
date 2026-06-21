export default function Home() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "red", fontSize: 42 }}>Ray'sStream</h1>

      <h2>Video 1</h2>
      <video controls width="100%" style={{ maxWidth: 900, background: "black" }}>
        <source src="/videos/video1.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>

      <h2>Video 2</h2>
      <video controls width="100%" style={{ maxWidth: 900, background: "black" }}>
        <source src="/videos/video2.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>

      <h2>Video 3</h2>
      <video controls width="100%" style={{ maxWidth: 900, background: "black" }}>
        <source src="/videos/video3.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>
    </main>
  );
} 

