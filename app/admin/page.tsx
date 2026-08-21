"use client";

import { useState } from "react";

type Video = {
  url: string;
  pathname: string;
  uploadedAt?: string;
  size?: number;
};

export default function AdminPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadVideos() {
    if (!password) {
      setMessage("Enter the administrator password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Loading videos...");

      const res = await fetch("/api/admin/videos", {
        headers: {
          "x-admin-password": password,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load videos.");
        setVideos([]);
        return;
      }

      setVideos(data.videos || []);
      setMessage("");
    } catch {
      setMessage("Could not load videos.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVideo(video: Video) {
    const confirmed = window.confirm(
      `Delete ${video.pathname}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("Deleting video...");

      const res = await fetch("/api/admin/videos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          url: video.url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Delete failed.");
        return;
      }

      setVideos((current) =>
        current.filter((item) => item.url !== video.url)
      );

      setMessage("Video deleted successfully.");
    } catch {
      setMessage("Delete failed.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          marginBottom: "8px",
        }}
      >
        Ray&apos;sStream Administrator
      </h1>

      <p
        style={{
          color: "#bbb",
          marginBottom: "18px",
        }}
      >
        Manage uploaded videos
      </p>

      <a
        href="/"
        style={{
          display: "inline-block",
          marginBottom: "25px",
          padding: "10px 18px",
          background: "#ffffff",
          color: "#000000",
          textDecoration: "none",
          border: "2px solid black",
          borderRadius: "20px",
          fontWeight: "bold",
        }}
      >
        ← Back to Home Page
      </a>

      <div
        style={{
          maxWidth: "500px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "25px",
        }}
      >
        <input
          type="password"
          placeholder="Administrator password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              loadVideos();
            }
          }}
          style={{
            flex: "1 1 260px",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #555",
            fontSize: "16px",
          }}
        />

        <button
          onClick={loadVideos}
          disabled={loading}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Loading..." : "Open Dashboard"}
        </button>
      </div>

      {message && (
        <p
          style={{
            marginBottom: "20px",
            color: "#ffd166",
          }}
        >
          {message}
        </p>
      )}

      {videos.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: "20px",
            maxWidth: "900px",
          }}
        >
          {videos.map((video) => (
            <div
              key={video.url}
              style={{
                background: "#222",
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #333",
              }}
            >
              <video
                src={video.url}
                controls
                preload="metadata"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "8px",
                  background: "black",
                }}
              />

              <h3 style={{ marginTop: "12px" }}>
                {video.pathname.replace("videos/", "")}
              </h3>

              <p
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                {video.url}
              </p>

              <button
                onClick={() => deleteVideo(video)}
                style={{
                  marginTop: "12px",
                  padding: "10px 18px",
                  background: "#d11a2a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Delete Video
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && videos.length === 0 && !message && (
        <p style={{ color: "#888" }}>
          No videos loaded.
        </p>
      )}
    </main>
  );
} 
