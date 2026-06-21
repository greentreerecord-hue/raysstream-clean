export default function Home() {
  return (
    <main style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🔥 Ray'sStream</h1>
      <p>Welcome to Ray'sStream</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <a href="/watch/video1">▶ Watch Video 1</a>
        <a href="/watch/video2">▶ Watch Video 2</a>
        <a href="/watch/video3">▶ Watch Video 3</a>
      </div>
    </main>
  );
} 
