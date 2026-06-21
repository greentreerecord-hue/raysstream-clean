"use client";

export default function Home() {
  return (
    <main
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "red" }}>Ray'sStream</h1>

      <h2>Video 1</h2>
      <video controls width="100%">
        <source src="/videos/video1.mp4" type="video/mp4" />
      </video>

      <br />
      <br />

      <h2>Video 2</h2>
      <video controls width="100%">
        <source src="/videos/video2.mp4" type="video/mp4" />
      </video>

      <br />
      <br />

      <h2>Video 3</h2>
      <video controls width="100%">
        <source src="/videos/video3.mp4" type="video/mp4" />
      </video>

      <br />
      <br />

      <button
        style={{
          background: "red",
          color: "white",
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Subscribe
      </button>

      <p>Views: 1</p>
      <p>Likes: 0</p>

      <h3>Comments</h3>
      <textarea
        placeholder="Write a comment..."
        style={{
          width: "100%",
          height: "100px",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <button
        style={{
          background: "#333",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Post Comment
      </button>
    </main>
  );
} 

