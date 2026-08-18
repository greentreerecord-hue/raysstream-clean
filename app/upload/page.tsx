"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const creatorEmail = localStorage.getItem("raysstreamCreatorEmail");

    if (!creatorEmail) {
      setMessage("Please log in as a creator first.");
      return;
    }

    if (!title || !video) {
      setMessage("Please add a title and choose a video.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading video...");

      const safeEmail = creatorEmail
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const blob = await upload(
        `videos/${safeEmail}/${Date.now()}-${video.name}`,
        video,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      setMessage("Saving video information...");

      const saveResponse = await fetch("/api/my-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: creatorEmail,
          url: blob.url,
          pathname: blob.pathname,
          title: title,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        setMessage(
          saveData.error ||
            "Video uploaded, but the title could not be saved."
        );
        return;
      }

      setMessage("Upload successful!");
      setTitle("");
      setVideo(null);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <h1>Upload Video</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label>Video Title</label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Choose Video</label>

            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setVideo(file);
              }}
              style={{
                display: "block",
                marginTop: "8px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              color: "#cccccc",
              wordBreak: "break-word",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
} 
