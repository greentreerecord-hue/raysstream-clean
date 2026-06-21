"use client";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "white", padding: "20px" }}>
      <h1 style={{ color: "red", fontSize: "40px" }}>Ray&apos;sStream</h1>
      <p>Videos • Likes • Views • Comments • Subscribe</p>

      <h2>Video 1</h2>
      <video controls playsInline style={{ width: "100%", maxWidth: "800px", background: "black" }}>
        <source src="/videos/video1.mp4" type="video/mp4" />
      </video>

      <h2>Video 2</h2>
      <video controls playsInline style={{ width: "100%", maxWidth: "800px", background: "black" }}>
        <source src="/videos/video2.mp4" type="video/mp4" />
      </video>

      <h2>Video 3</h2>
      <video controls playsInline style={{ width: "100%", maxWidth: "800px", background: "black" }}>
        <source src="/videos/video3.mp4" type="video/mp4" />
      </video>

      <div style={{ marginTop: "25px" }}>
        <button style={{ padding: "12px 18px", background: "red", color: "white", border: "none", borderRadius: "8px" }}>
          Subscribe
        </button>

        <p>Views: 1</p>
        <p>Likes: 0</p>

        <button style={{ padding: "10px 16px", background: "#222", color: "white", border: "1px solid white", borderRadius: "8px" }}>
          Like
        </button>
      </div>

      <section style={{ marginTop: "25px", maxWidth: "800px" }}>
        <h2>Comments</h2>
        <textarea
          placeholder="Write a comment..."
          style={{ width: "100%", height: "100px", padding: "10px", fontSize: "16px" }}
        />
        <br />
        <button style={{ marginTop: "10px", padding: "10px 16px" }}>
          Post Comment
        </button>
      </section>
    </main>
  );
} 
