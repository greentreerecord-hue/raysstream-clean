export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <h1>Ray'sStream</h1>

      <video
        width="800"
        controls
        autoPlay
        muted
      >
        <source src="/itscool.mp4" type="video/mp4" />
      </video>
    </main>
  );
} 
