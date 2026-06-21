"use client";

export default function Home() {
  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "red", fontSize: 40 }}>Ray&apos;sStream</h1>
      <p>YouTube-style streaming service</p>

      <section style={{ maxWidth: 800 }}>
        <h2>It&apos;s Cool</h2>

        <video
          controls
          playsInline
          preload="metadata"
          style={{ width: "100%", borderRadius: 12, background: "black" }}
        >
          <source src="/videos/itscool.mp4" type="video/mp4" />
          Your browser does not support video.
        </video>

        <button style={{ marginTop: 15, padding: 12, background: "red", color: "white", border: 0, borderRadius: 8 }}>
          Subscribe
        </button>
      </section>
    </main>
  );
} 
