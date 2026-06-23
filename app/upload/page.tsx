"use client";

import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");

  function handleUpload() {
    if (!title.trim() || !fileName) {
      alert("Add a video title and choose an MP4 file.");
      return;
    }

    alert("Upload page works. Next step will be real video storage.");
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

      <p>Upload your next Ray&apos;sStream video.</p>

      <div style={{ marginTop: "25px" }}>
        <label>Video Title</label>
        <br />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "12px",
            marginTop: "8px",
            borderRadius: "8px",
            fontSize: "16px",
          }}
        />
      </div>

      <div style={{ marginTop: "25px" }}>
        <label>Choose MP4 Video</label>
        <br />
        <input
          type="file"
          accept="video/mp4"
          onChange={(e) =>
            setFileName(e.target.files?.[0]?.name || "")
          }
          style={{ marginTop: "8px" }}
        />
      </div>

      {fileName && (
        <p style={{ marginTop: "15px" }}>
          Selected file: <strong>{fileName}</strong>
        </p>
      )}

      <button
        onClick={handleUpload}
        style={{
          marginTop: "25px",
          background: "red",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Upload Video
      </button>

      <p style={{ marginTop: "25px", color: "#aaa" }}>
        Safe version: this page does not change your working homepage.
      </p>
    </main>
  );
} 

