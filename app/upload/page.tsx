"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const creatorEmail = localStorage.getItem(
      "raysstreamCreatorEmail"
    );

    if (!creatorEmail) {
      setMessage("Please log in as a creator first.");
      return;
    }

    if (!title || !video || !thumbnail) {
      setMessage(
        "Please add a title, choose a video, and choose a thumbnail."
      );
      return;
    }

    try {
      setUploading(true);

      const safeEmail = creatorEmail
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const uploadTime = Date.now();

      setMessage("Uploading thumbnail...");

      const thumbnailBlob = await upload(
        `thumbnails/${safeEmail}/${uploadTime}-${thumbnail.name}`,
        thumbnail,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      setMessage("Uploading video...");

      const videoBlob = await upload(
        `videos/${safeEmail}/${uploadTime}-${video.name}`,
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
          url: videoBlob.url,
          pathname: videoBlob.pathname,
          title,
          thumbnailUrl: thumbnailBlob.url,
          thumbnailPathname: thumbnailBlob.pathname,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        setMessage(
          saveData.error ||
            "The files uploaded, but the video information could not be saved."
        );
        return;
      }

      setMessage("Video and thumbnail uploaded successfully!");
      setTitle("");
      setVideo(null);
      setThumbnail(null);
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
        <a
          href="/"
          style={{
            display: "inline-block",
            marginBottom: "24px",
            padding: "12px 20px",
            background: "#2b2b2b",
            color: "white",
            textDecoration: "none",
            border: "2px solid black",
            borderRadius: "22px",
            fontWeight: "bold",
          }}
        >
          ← Back to Homepage
        </a>

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
                boxSizing: "border-box",
                padding: "12px",
                marginTop: "8px",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Choose Thumbnail</label>

            <p
              style={{
                color: "#bbbbbb",
                margin: "6px 0 0",
              }}
            >
              Choose a JPG, PNG, or WebP image.
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setThumbnail(file);
              }}
              style={{
                display: "block",
                marginTop: "8px",
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
