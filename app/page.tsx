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
          href="/watch/itscool"
          style={{
            display: "block",
            color: "white",
            marginBottom: "20px",
            textDecoration: "none",
            fontSize: "32px",
          }}
        >
          It's Cool
        </Link>

        <Link
          href="/watch/video2"
          style={{
            display: "block",
            color: "white",
            marginBottom: "20px",
            textDecoration: "none",
            fontSize: "32px",
          }}
        >
          Video 2
        </Link>

        <Link
          href="/watch/video3"
          style={{
            display: "block",
            color: "white",
            marginBottom: "20px",
            textDecoration: "none",
            fontSize: "32px",
          }}
        >
          Spaceship
        </Link>
      </div>
    </main>
  );
} 
