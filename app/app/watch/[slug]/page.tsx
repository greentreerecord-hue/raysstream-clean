import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Ray'sStream</h1>

      <p>
        <Link href="/watch/itscool">It's Cool</Link>
      </p>

      <p>
        <Link href="/watch/video2">Video 2</Link>
      </p>

      <p>
        <Link href="/watch/video3">Spaceship</Link>
      </p>
    </main>
  );
} 
