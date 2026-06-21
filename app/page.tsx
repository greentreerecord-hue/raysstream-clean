export default function Home() {
  return (
    <main style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Ray'sStream</h1>

      <h2>Video 1</h2>
      <video controls preload="auto" width="100%" style={{ background: "black" }}>
        <source src="/videos/video1.mp4" type="video/mp4" />
        Video 1 not found.
      </video>

      <h2>Video 2</h2>
      <video controls preload="auto" width="100%" style={{ background: "black" }}>
        <source src="/videos/video2.mp4" type="video/mp4" />
        Video 2 not found.
      </video>

      <h2>Video 3</h2>
      <video controls preload="auto" width="100%" style={{ background: "black" }}>
        <source src="/videos/video3.mp4" type="video/mp4" />
        Video 3 not found.
      </video>
    </main>
  );
} 
