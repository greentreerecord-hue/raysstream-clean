import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 40, textAlign: "center" }}>
      <h1 style={{ color: "#f97316", fontSize: 48 }}>Ray&apos;sStream</h1>

      <p style={{ color: "#9ca3af", fontSize: 20 }}>
        Videos • Likes • Views • Comments • Subscribe
      </p>

      <Link
        href="/watch/itscool"
        style={{
          display: "inline-block",
          marginTop: 30,
          padding: "16px 32px",
          background: "#dc2626",
          color: "white",
          textDecoration: "none",
          borderRadius: 10,
          fontWeight: "bold",
          fontSize: 20,
        }}
      >
        Watch Videos
      </Link>
    </main>
  );
} 

