"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  async function handleUpload() {
    if (!file) {
      setStatus("Choose a video first.");
      return;
    }

    setStatus("Uploading...");
    setVideoUrl("");

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Upload failed.");
        return;
      }

      setStatus("Upload success!");
      setVideoUrl(data.url);
    } catch (error) {
      setStatus("Upload failed. API did not respond.");
    }
  }

  return (
    <main style={{ padding: 30, color: "white", background: "#111", minHeight: "100vh" }}>
      <h1>Ray&apos;sStream Upload Test</h1>

      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        style={{
          padding: "12px 20px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
        }}
      >
        Upload Video
      </button>

      <p>{status}</p>

      {videoUrl && (
        <>
          <p>Video URL: {videoUrl}</p>
          <video
            src={videoUrl}
            controls
            style={{ width: "100%", maxWidth: 700, marginTop: 20 }}
          />
        </>
      )}
    </main>
  );
} 

