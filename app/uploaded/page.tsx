"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Video = {
  url: string;
  pathname: string;
};

export default function UploadedVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadVideos() {
      const creatorEmail = localStorage.getItem("raysstreamCreatorEmail");

      if (!creatorEmail) {
        setMessage("Please log in as a creator first.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/my-videos?email=${encodeURIComponent(creatorEmail)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Could not load videos.");
          setLoading(false);
          return;
        }

        setVideos(data.videos || []);
      } catch (error) {
        console.error(error);
        setMessage("Could not load your videos.");
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1>My Videos</h1>

        <p style={{ color: "#bbbbbb" }}>
          Your Ray&apos;sStream uploads
        </p>

        <div style={{ margin: "25px 0" }}>
          <Link
            href="/creator/dashboard"
            style={{
              color: "white",
              textDecoration: "none",
              border: "1px solid white",
              padding: "10px 16px",
              borderRadius: "8px",
            }}
          >
            Back to Creator Dashboard
          </Link>
        </div>

        {loading && <p>Loading your videos...</p>}

        {message && <p>{message}</p>}

        {!loading && !message && videos.length === 0 && (
          <p>You have not uploaded any videos yet.</p>
        )}

        {videos.map((video) => (
          <div
            key={video.url}
            style={{
              background: "#151515",
              padding: "20px",
              marginBottom: "25px",
              borderRadius: "12px",
            }}
          >
            <h2>
              {video.pathname
                .split("/")
                .pop()
                ?.replaceAll("-", " ")}
            </h2>

            <video
              src={video.url}
              controls
              style={{
                width: "100%",
                maxWidth: "700px",
                borderRadius: "10px",
              }}
            />

            <p
              style={{
                color: "#aaaaaa",
                wordBreak: "break-all",
              }}
            >
              {video.pathname}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
} 
