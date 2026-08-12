"use client";

import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !video) {
      setMessage("Please add a title and choose a video.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading video...");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("video", video);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Upload failed.");
        return;
      }

      setMessage(`Upload successful! ${data.videoUrl}`);
      setTitle("");
      setVideo(null);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          background: "#171717",
          padding: "30px",
          borderRadius: "16px",
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
          Ray&apos;sStream Creator Upload
        </h1>

        <p style={{ color: "#bbbbbb", marginBottom: "30px" }}>
          Upload a video to Ray&apos;sStream.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Video title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "24px",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#222",
              color: "white",
              fontSize: "16px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Choose video
          </label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setVideo(file);
            }}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "24px",
            }}
          />

          {video && (
            <p style={{ color: "#bbbbbb", marginBottom: "20px" }}>
              Selected: {video.name}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>

          {message && (
            <p style={{ marginTop: "20px", textAlign: "center" }}>
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
} 
