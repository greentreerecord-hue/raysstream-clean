"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [creator, setCreator] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedCreator = localStorage.getItem("raysstreamCreator");
    const savedEmail = localStorage.getItem("raysstreamCreatorEmail");

    if (!savedCreator || !savedEmail) {
      window.location.href = "/login";
      return;
    }

    setCreator(savedCreator);
    setEmail(savedEmail);
  }, []);

  function logout() {
    localStorage.removeItem("raysstreamCreator");
    localStorage.removeItem("raysstreamCreatorEmail");
    window.location.href = "/login";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "34px" }}>
              Ray&apos;sStream Creator Dashboard
            </h1>

            <p style={{ marginTop: "8px", color: "#bbb" }}>
              Welcome, {creator || "Creator"}
            </p>
          </div>

          <button
            onClick={logout}
            style={{
              padding: "12px 20px",
              borderRadius: "25px",
              border: "1px solid #555",
              background: "#222",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </header>

        <section
          style={{
            background: "#111",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Creator Account</h2>

          <p>
            <strong>Username:</strong> {creator}
          </p>

          <p>
            <strong>Email:</strong> {email}
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <a
            href="/upload"
            style={{
              background: "#111",
              color: "white",
              padding: "25px",
              borderRadius: "16px",
              textDecoration: "none",
              border: "1px solid #333",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Upload Video</h2>
            <p style={{ color: "#bbb" }}>
              Upload new content to Ray&apos;sStream.
            </p>
          </a>

          <a
            href="/uploads"
            style={{
              background: "#111",
              color: "white",
              padding: "25px",
              borderRadius: "16px",
              textDecoration: "none",
              border: "1px solid #333",
            }}
          >
            <h2 style={{ marginTop: 0 }}>My Uploads</h2>
            <p style={{ color: "#bbb" }}>
              View and manage your uploaded videos.
            </p>
          </a>

          <a
            href="/"
            style={{
              background: "#111",
              color: "white",
              padding: "25px",
              borderRadius: "16px",
              textDecoration: "none",
              border: "1px solid #333",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Ray&apos;sStream Home</h2>
            <p style={{ color: "#bbb" }}>
              Return to the main streaming page.
            </p>
          </a>
        </section>

        <section
          style={{
            background: "#111",
            padding: "24px",
            borderRadius: "16px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Creator Studio</h2>

          <p style={{ color: "#bbb" }}>
            Your creator tools will appear here as we add video management,
            views, subscribers, comments, and earnings.
          </p>
        </section>
      </div>
    </main>
  );
} 
