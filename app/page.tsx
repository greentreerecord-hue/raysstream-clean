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
    } catch {
      setStatus("Upload failed. API did not respond.");
    }
  }

  return (
    <main style={{ padding: 30, background: "#111", color: "white", minHeight: "100vh" }}>
      <h1>Ray&apos;sStream Upload</h1>

      <input
        type="file"
        accept="video/mp4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={handleUpload}>Upload Video</button>

      <h2>{status}</h2>

      {videoUrl && (
        <video src={videoUrl} controls style={{ width: "100%", maxWidth: 700 }} />
      )}
    </main>
  );
} 

