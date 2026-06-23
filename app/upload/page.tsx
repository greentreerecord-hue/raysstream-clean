"use client";

import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "video/mp4") {
      alert("Please choose an MP4 video.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFileName(file.name);
    setVideoUrl(previewUrl);
  }

  function handleUpload() {
    if (!title.trim() || !videoUrl) {
      alert("Add a title and choose an MP4 video.");
      return;
    }

    alert("Video preview works. Real storage comes next.");
  }

  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "red", fontSize: "42px" }}>
        Ray&apos;sStream Creator Upload
      </h1>

      <a href="/" style={{ color: "white" }}>
        Back to Ray&apos;sStream
      </a>

      <p>Upload and preview your Ray&apos;sStream video.</p>

      <h3>Video Title</h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter video title"
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "18px",
        }}
      />

      <h3 style={{ marginTop: "25px" }}>Choose MP4 Video</h3>

      <input type="file" accept="video/mp4" onChange={handleFile} />

      {fileName && (
        <p>
          Selected file: <strong>{fileName}</strong>
        </p>
      )}

      <button
        onClick={handleUpload}
        style={{
          marginTop: "20px",
          background: "red",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Upload Video
      </button>

      {videoUrl && (
        <section style={{ marginTop: "30px" }}>
          <h2>{title || "Video Preview"}</h2>

          <p style={{ color: "#22c55e", fontWeight: "bold" }}>
            Preview ready — press play
          </p>

          <video
            key={videoUrl}
            controls
            muted
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              maxWidth: "800px",
              minHeight: "300px",
              backgroundColor: "#000",
              border: "3px solid red",
              borderRadius: "12px",
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </section>
      )}
    </main>
  );
} 

