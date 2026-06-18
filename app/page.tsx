export default function Home() {
  return (
    <main
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#ff6600" }}>🔥 Ray'sStream</h1>

      <p>Welcome to the new Ray'sStream.</p>

      <a
        href="#subscribe"
        style={{
          display: "inline-block",
          background: "#ff0000",
          color: "#fff",
          padding: "12px 24px",
          fontSize: "18px",
          borderRadius: "8px",
          textDecoration: "none",
          marginBottom: "30px",
        }}
      >
        Subscribe
      </a>

      <div id="subscribe" style={{ marginTop: "20px", marginBottom: "40px" }}>
        <strong>Thanks for supporting Ray'sStream!</strong>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>It's Cool</h2>
        <video controls width="700" style={{ maxWidth: "100%" }}>
          <source src="/itscool.mp4" type="video/mp4" />
        </video>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Video 2</h2>
        <video controls width="700" style={{ maxWidth: "100%" }}>
          <source src="/video2.mp4" type="video/mp4" />
        </video>
      </div>
    </main>
  );
} 
