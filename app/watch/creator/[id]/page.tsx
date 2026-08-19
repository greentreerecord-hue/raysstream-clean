"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CreatorVideo = {
  id: string | number;
  title: string;
  url: string;
  creator_email?: string;
  created_at?: string;
};

export default function CreatorWatchPage() {
  const params = useParams();
  const id = String(params.id);

  const [video, setVideo] = useState<CreatorVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadVideo() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load video.");
        }

        const videoList = Array.isArray(data) ? data : data.videos || [];

        const selectedVideo = videoList.find(
          (
            item: CreatorVideo & {
              blob_url?: string;
            }
          ) => String(item.id) === id
        );

        if (!selectedVideo) {
          setMessage("Creator video not found.");
          return;
        }

        setVideo({
          ...selectedVideo,
          url: selectedVideo.url || selectedVideo.blob_url || "",
        });
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load video."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadVideo();
    } else {
      setMessage("Invalid creator video.");
      setLoading(false);
    }
  }, [id]);

  async function copyLink() {
    const watchUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(watchUrl);
      alert("Ray'sStream watch link copied!");
    } catch {
      window.prompt("Copy this Ray'sStream watch link:", watchUrl);
    }
  }

  async function shareVideo() {
    if (!video) return;

    const watchUrl = window.location.href;

    const shareData = {
      title: video.title,
      text: `Watch ${video.title} on Ray'sStream`,
      url: watchUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        await copyLink();
        return;
      }
    }

    await copyLink();
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={messageStyle}>Loading creator video...</p>
      </main>
    );
  }

  if (!video) {
    return (
      <main style={pageStyle}>
        <h1 style={headingStyle}>Ray&apos;sStream</h1>

        <p style={messageStyle}>{message}</p>

        <a href="/" style={linkStyle}>
          Back to Homepage
        </a>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <a href="/" style={backLinkStyle}>
        ← Back to Ray&apos;sStream
      </a>

      <section style={cardStyle}>
        <h1 style={titleStyle}>{video.title}</h1>

        <video
          src={video.url}
          controls
          autoPlay
          playsInline
          style={videoStyle}
        />

        <div style={buttonRowStyle}>
          <button type="button" onClick={shareVideo} style={buttonStyle}>
            Share Video
          </button>

          <a href="/" style={linkStyle}>
            More Videos
          </a>
        </div>
      </section>

      <footer style={footerStyle}>© 2026 Ray&apos;sStream</footer>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "30px 16px",
  background:
    "linear-gradient(180deg, #061a35 0%, #052b58 50%, #031426 100%)",
  color: "white",
};

const headingStyle = {
  textAlign: "center" as const,
  fontSize: "42px",
};

const cardStyle = {
  width: "min(1000px, 96%)",
  margin: "30px auto",
  overflow: "hidden",
  background: "#202020",
  border: "2px solid black",
  borderRadius: "22px",
  boxShadow: "0 14px 35px rgba(0, 0, 0, 0.45)",
};

const titleStyle = {
  padding: "20px",
  margin: 0,
  fontSize: "clamp(26px, 5vw, 42px)",
  textAlign: "center" as const,
};

const videoStyle = {
  display: "block",
  width: "100%",
  maxHeight: "700px",
  background: "black",
};

const buttonRowStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "center",
  gap: "14px",
  padding: "22px",
};

const buttonStyle = {
  padding: "12px 24px",
  background: "#222",
  color: "white",
  border: "2px solid black",
  borderRadius: "22px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};

const linkStyle = {
  display: "inline-block",
  padding: "12px 24px",
  background: "#222",
  color: "white",
  border: "2px solid black",
  borderRadius: "22px",
  textDecoration: "none",
  fontWeight: "bold",
};

const backLinkStyle = {
  display: "inline-block",
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
  marginLeft: "3%",
};

const messageStyle = {
  color: "white",
  textAlign: "center" as const,
  fontSize: "20px",
  padding: "40px",
};

const footerStyle = {
  textAlign: "center" as const,
  padding: "30px",
  color: "#dddddd",
}; 
