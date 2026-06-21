export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Ray'sStream</h1>

      <video controls width="100%">
        <source src="/videos/video1.mp4" type="video/mp4" />
      </video>

      <br /><br />

      <video controls width="100%">
        <source src="/videos/video2.mp4" type="video/mp4" />
      </video>

      <br /><br />

      <video controls width="100%">
        <source src="/videos/video3.mp4" type="video/mp4" />
      </video>
    </main>
  );
} 
