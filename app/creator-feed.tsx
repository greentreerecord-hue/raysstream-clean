"use client";

import { useEffect, useState } from "react";

type CreatorVideo = {
  id: string;
  url: string;
  pathname: string;
  title: string;
  createdAt: string;
};

export default function CreatorFeed() {
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCreatorVideos() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.error || "Could not load creator videos."
          );
          return;
        }

        setVideos(data.videos || []);
      } catch (error) {
        console.error("Unable to load creator feed:", error);
        setMessage("Could not load creator videos.");
      } finally {
        setLoading(false);
      }
    }

    loadCreatorVideos();
  }, []);

  async function shareVideo(video: CreatorVideo) {
    const shareData = {
      title: video.title,
      text: `Watch ${video.title} on Ray'sStream`,
      url: video.url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled sharing.
      }
    } else {
      await navigator.clipboard.writeText(video.url);
      alert("Ray'sStream video link copied!");
    }
  }

  return (
    <section
      style={{
        width: "min(1000px, 94%)",
        margin: "0 auto 50px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            fontSize: "34px",
            marginBottom: "8px",
          }}
        >
          Creator Video Feed
        </h2>

        <p style={{ color: "#bbb" }}>
          New videos uploaded by Ray&apos;sStream creators
        </p>
      </div>

      {loading && (
        <p style={{ textAlign: "center" }}>
          Loading creator videos...
        </p>
      )}

      {message && (
        <p style={{ textAlign: "center" }}>{message}</p>
      )}

      {!loading && !message && videos.length === 0 && (
        <div
          style={{
            padding: "25px",
            textAlign: "center",
            background: "#121212",
            border: "2px solid black",
            borderRadius: "18px",
          }}
        >
          <p>No creator videos have been uploaded yet.</p>
        </div>
      )}

      {videos.map((video) => (
        <article
          key={video.id}
          style={{
            background: "#121212",
            marginTop: "28px",
            borderRadius: "18px",
            border: "2px solid black",
            padding: "18px",
          }}
        >
          <h2>{video.title}</h2>

          <video
            src={video.url}
            controls
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              background: "black",
              border: "2px solid black",
              borderRadius: "14px",
              maxHeight: "600px",
            }}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "9px",
              marginTop: "16px",
            }}
          >
            <button
              onClick={() => shareVideo(video)}
              style={{
                background: "#2b2b2b",
                color: "white",
                border: "2px solid black",
                padding: "10px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Share
            </button>
          </div>
        </article>
      ))}
    </section>
  );
} 
