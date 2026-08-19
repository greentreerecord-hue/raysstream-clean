"use client";

import { useEffect, useState } from "react";

type CreatorVideo = {
  id: number;
  title: string;
  url: string;
  creator_email?: string;
  created_at?: string;
};

export default function CreatorFeed() {
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadVideos() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load creator videos.");
        }

        const videoList = Array.isArray(data) ? data : data.videos || [];

        const normalizedVideos = videoList.map(
          (video: CreatorVideo & { blob_url?: string }) => ({
            ...video,
            url: video.url || video.blob_url || "",
          })
        );

        setVideos(normalizedVideos);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load creator videos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  async function copyVideoLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      alert("Ray'sStream video link copied!");
    } catch {
      window.prompt("Copy this Ray'sStream video link:", url);
    }
  }

  async function shareVideo(video: CreatorVideo) {
    const videoUrl = video.url.startsWith("http")
      ? video.url
      : new URL(video.url, window.location.origin).href;

    const shareData = {
      title: video.title,
      text: `Watch ${video.title} on Ray'sStream`,
      url: videoUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        await copyVideoLink(videoUrl);
        return;
      }
    }

    await copyVideoLink(videoUrl);
  }

  if (loading) {
    return (
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Creator Video Feed</h2>
        <p style={messageStyle}>Loading creator videos...</p>
      </section>
    );
  }

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Creator Video Feed</h2>

        <p style={subtitleStyle}>
          New videos uploaded by Ray&apos;sStream creators
        </p>
      </div>

      {message && <p style={messageStyle}>{message}</p>}

      {!message && videos.length === 0 && (
        <p style={messageStyle}>No creator videos have been uploaded yet.</p>
      )}

      <div style={feedStyle}>
        {videos.map((video) => (
          <article key={video.id} style={cardStyle}>
            <h3 style={titleStyle}>{video.title}</h3>

            <video
              src={video.url}
              controls
              preload="metadata"
              playsInline
              style={videoStyle}
            />

            <div style={buttonRowStyle}>
              <button
                type="button"
                onClick={() => shareVideo(video)}
                style={shareButtonStyle}
              >
                Share
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const sectionStyle = {
  width: "min(1000px, 94%)",
  margin: "0 auto 50px",
  paddingTop: "35px",
};

const headerStyle = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const headingStyle = {
  color: "white",
  fontSize: "clamp(30px, 5vw, 48px)",
  margin: "0 0 12px",
};

const subtitleStyle = {
  color: "#dddddd",
  fontSize: "18px",
  margin: 0,
};

const messageStyle = {
  color: "white",
  textAlign: "center" as const,
  fontSize: "18px",
  padding: "25px",
};

const feedStyle = {
  display: "grid",
  gap: "30px",
};

const cardStyle = {
  overflow: "hidden",
  background: "#242424",
  border: "2px solid black",
  borderRadius: "20px",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
};

const titleStyle = {
  color: "white",
  fontSize: "25px",
  padding: "18px 20px",
  margin: 0,
};

const videoStyle = {
  display: "block",
  width: "100%",
  maxHeight: "600px",
  background: "black",
};

const buttonRowStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "16px",
};

const shareButtonStyle = {
  padding: "11px 22px",
  background: "#222222",
  color: "white",
  border: "2px solid black",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
}; 
