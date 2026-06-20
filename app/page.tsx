import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "#f97316",
          fontSize: "48px",
          marginBottom: "20px",
        }}
      >
        Ray'sStream
      </h1>

      <p
        style={{
          color: "#9ca3af",
          fontSize: "20px",
          marginBottom: "40px",
        }}
      >
        Videos • Likes • Views • Comments • Subscribe
      </p>

      <Link
        href="/watch"
        style={{
          display: "inline-block",
          padding: "16px 32px",
          background: "#dc2626",
          color: "white",
          textDecoration: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        Watch Videos
      </Link>

      <div
        style={{
          marginTop: "50px",
          padding: "20px",
          background: "#1f2937",
          borderRadius: "12px",
        }}
      >
        <h2>TEST CHANGE 123</h2>
        <p>If you can see this text, the homepage is deploying correctly.</p>
      </div>
    </main>
  );
} 
