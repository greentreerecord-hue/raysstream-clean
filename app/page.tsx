import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <h1
        style={{
          color: "#ff6a00",
          fontSize: "48px",
        }}
      >
        🔥 Ray'sStream
      </h1>

      <p>Home Video Library</p>

      <div style={{ marginTop: "30px" }}>
        <Link
          href="/watch/its-cool"
          style={{
            display: "block",
            marginBottom: "20px",
            color: "white",
            textDecoration: "none",
          }}
        >
          <h2>It's Cool</h2>
        </Link>

        <Link
          href="/watch/video2"
          style={{
            display: "block",
            marginBottom: "20px",
            color: "white",
            textDecoration: "none",
          }}
        >
          <h2>Video 2</h2>
        </Link>

        <Link
          href="/watch/video3"
          style={{
            display: "block",
            marginBottom: "20px",
            color: "white",
            textDecoration: "none",
          }}
        >
          <h2>Spaceship</h2>
        </Link>
      </div>
    </main>
  );
} 
