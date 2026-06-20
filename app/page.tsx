export default function Home() {
  return (
    <main style={{ padding: 20, background: "#111", color: "white", minHeight: "100vh" }}>
      <h1>🔥 Ray'sStream</h1>
      <p>Likes, comments, views, and subscribe are on each watch page.</p>

      <h2>Videos</h2>

      <a href="/watch/itscool" style={linkStyle}>It's Cool</a>
      <a href="/watch/video2" style={linkStyle}>Video 2</a>
      <a href="/watch/video3" style={linkStyle}>Spaceship Video</a>
    </main>
  );
}

const linkStyle = {
  display: "block",
  background: "#222",
  color: "white",
  padding: 16,
  marginTop: 12,
  borderRadius: 10,
  textDecoration: "none",
}; 

