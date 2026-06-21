mport Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Ray'sStream</h1>

      <ul>
        <li><Link href="/watch/itscool">It's Cool</Link></li>
        <li><Link href="/watch/video2">Video 2</Link></li>
        <li><Link href="/watch/video3">Video 3</Link></li>
      </ul>
    </main>
  );
} 

