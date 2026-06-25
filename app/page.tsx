"use client";

import { useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState("");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050505, #1a0000)",
        color: "white",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <a
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: 28,
            fontWeight: "bold",
          }}
        >
          🔥 Ray&apos;sStream
        </a>

        <a
          href="/"
          style={{
            background: "#ff0000",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Home
        </a>
      </header>

      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ fontSize: 36, marginBottom: 10 }}>Creator Upload</h1>

        <p style={{ color: "#ddd", fontSize: 18 }}>
          Upload your video to Ray&apos;sStream.
        </p>

        <div
          style={{
            marginTop: 28,
            padding: 28,
            border: "2px dashed rgba(255,255,255,0.35)",
            borderRadius: 16,
            textAlign: "center",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <p style={{ fontSize: 22, fontWeight: "bold" }}>
            Select a video file
          </p>

          <p style={{ color: "#bbb" }}>
            MP4 recommended
          </p>

          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            style={{ marginTop: 18 }}
          />

          {fileName && (
            <p style={{ marginTop: 18, color: "#7CFF7C" }}>
              Selected: {fileName}
            </p>
          )}
        </div>

        <button
          disabled
          style={{
            marginTop: 28,
            width: "100%",
            padding: "16px 20px",
            background: "#777",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 18,
            fontWeight: "bold",
            cursor: "not-allowed",
          }}
        >
          Upload Temporarily Paused
        </button>

        <p style={{ marginTop: 18, color: "#ccc" }}>
          Page restored. Upload code is paused so the website stays working.
        </p>
      </section>
    </main>
  );
} 
