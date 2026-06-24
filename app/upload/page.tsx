"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  async function uploadVideo() {
    if (!file) {
      setMessage("Please choose a video first.");
      return;
    }

    setMessage("Uploading...");

    const formData = new FormData();
    formData.append("video", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Upload failed.");
      return;
    }

    setVideoUrl(data.url);
    setMessage("Upload complete!");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "white", padding: 24 }}>
      <h1>Ray&apos;sStream Upload</h1>

      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button
        onClick={uploadVideo}
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

      <p>{message}</p>

      {videoUrl && (
        <>
          <p>Video link: {videoUrl}</p>
          <video src={videoUrl} controls width="100%" style={{ maxWidth: 700 }} />
        </>
      )}
    </main>
  );
} 
