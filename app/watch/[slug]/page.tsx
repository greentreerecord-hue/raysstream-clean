export default function WatchPage() {
  return (
    <main style={{ background: "#000", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1>Ray'sStream</h1>

      <video
        controls
        autoPlay
        loop
        playsInline
        style={{ width: "100%", maxWidth: 900, borderRadius: 12 }}
      >
        <source src="/videos/itscool.mp4" type="video/mp4" />
      </video>

      <h2>It's Cool</h2>

      <button style={{ background: "red", color: "white", padding: "12px 20px", borderRadius: 8 }}>
        Subscribe
      </button>

      <p>Views: 1</p>

      <h3>Comments</h3>
      <input placeholder="Write a comment..." style={{ padding: 10, width: "100%", maxWidth: 500 }} />
    </main>
  );
} 
