"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";

export default function UploadPage() {
  const [creator, setCreator] = useState("");
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedCreator = localStorage.getItem("raysstreamCreator");

    if (!savedCreator) {
      window.location.href = "/login";
      return;
    }

    setCreator(savedCreator);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!creator) {
      setMessage("Creator account not found. Please log in again.");
      return;
    }

    if (!title || !video) {
      setMessage("Please add a title and choose a video.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading video...");

      const safeCreator = creator
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");

      const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-");

      const pathname =
        `videos/${safeCreator}/${Date.now()}-${safeTitle}-${video.name}`;

      const blob = await upload(pathname, video, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      setMessage("Upload successful!");
      setTitle("");
      setVideo(null);

      console.log("Uploaded video:", blob.url);
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

        <p style={{ color: "#bbbbbb", marginBottom: "10px" }}>
          Upload a video to Ray&apos;sStream.
        </p>

        <p style={{ color: "#bbbbbb", marginBottom: "30px" }}>
          Creator: <strong style={{ color: "white" }}>{creator}</strong>
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
              boxSizing: "border-box",
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
            <p
              style={{
                marginTop: "20px",
                textAlign: "center",
                wordBreak: "break-word",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
} 
