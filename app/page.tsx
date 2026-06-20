iimport Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
      <h1 style={{ color: "#ff6a00", fontSize: 48 }}>🔥 Ray'sStream</h1>
      <p>Home Video Library</p>

      <Link href="/watch/itscool" style={{ display: "block", color: "white", fontSize: 32, marginTop: 30 }}>
        It's Cool
      </Link>

      <Link href="/watch/video2" style={{ display: "block", color: "white", fontSize: 32, marginTop: 20 }}>
        Video 2
      </Link>

      <Link href="/watch/video3" style={{ display: "block", color: "white", fontSize: 32, marginTop: 20 }}>
        Spaceship
      </Link>
    </main>
  );
} 
