export default function Home() {
  return (
    <main style={{ padding: 20, background: "#111", color: "white", minHeight: "100vh" }}>
      <h1>🔥 Ray'sStream</h1>
      <p>Streaming service built for videos.</p>

      <h2>Videos</h2>

      <a href="/watch/itscool" style={card}>▶ It's Cool</a>
      <a href="/watch/video2" style={card}>▶ Video 2</a>
      <a href="/watch/video3" style={card}>▶ Spaceship Video</a>
    </main>
  );
}

const card = {
  display: "block",
  background: "#222",
  color: "white",
  padding: 18,
  marginTop: 14,
  borderRadius: 12,
  textDecoration: "none",
  fontSize: 20,
}; 
