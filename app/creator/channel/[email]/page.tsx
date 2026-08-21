"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CreatorVideo = {
  id: string | number;
  title: string;
  url: string;
  blob_url?: string;
  creator_email?: string;
  created_at?: string;
};

export default function CreatorChannelPage() {
  const params = useParams();

  const emailValue = Array.isArray(params.email)
    ? params.email[0]
    : params.email;

  const creatorEmail = decodeURIComponent(
    String(emailValue || "")
  );

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
          throw new Error(
            data.error || "Unable to load creator videos."
          );
        }

        const videoList: CreatorVideo[] = Array.isArray(data)
          ? data
          : data.videos || [];

        const creatorVideos = videoList
          .map((video) => ({
            ...video,
            url: video.url || video.blob_url || "",
          }))
          .filter(
            (video) =>
              String(video.creator_email || "").toLowerCase() ===
              creatorEmail.toLowerCase()
          );

        setVideos(creatorVideos);

        if (creatorVideos.length === 0) {
          setMessage(
            "This creator has not uploaded any videos yet."
          );
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this creator channel."
        );
      } finally {
        setLoading(false);
      }
    }

    if (creatorEmail) {
      loadCreatorVideos();
    } else {
      setMessage("Creator channel not found.");
      setLoading(false);
    }
  }, [creatorEmail]);

  async function shareVideo(video: CreatorVideo) {
    const watchUrl =
      `${window.location.origin}/watch/creator/${video.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch ${video.title} on Ray'sStream`,
          url: watchUrl,
        });

        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(watchUrl);
      alert("Ray'sStream watch link copied!");
    } catch {
      window.prompt(
        "Copy this Ray'sStream watch link:",
        watchUrl
      );
    }
  }

  const creatorInitial =
    creatorEmail.trim().charAt(0).toUpperCase() || "C";

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.homeButton}>
          ← Back to Home Page
        </a>

        <div style={styles.avatar}>
          {creatorInitial}
        </div>

        <h1 style={styles.channelTitle}>
          Creator Channel
        </h1>

        <p style={styles.creatorEmail}>
          {creatorEmail}
        </p>

        <p style={styles.videoCount}>
          {videos.length}{" "}
          {videos.length === 1 ? "video" : "videos"}
        </p>
      </header>

      <section style={styles.content}>
        {loading && (
          <p style={styles.message}>
            Loading creator channel...
          </p>
        )}

        {!loading && message && (
          <p style={styles.message}>{message}</p>
        )}

        <div style={styles.videoGrid}>
          {videos.map((video) => (
            <article key={video.id} style={styles.card}>
              <h2 style={styles.videoTitle}>
                {video.title}
              </h2>

              <video
                src={video.url}
                controls
                playsInline
                preload="metadata"
                style={styles.video}
              />

              <div style={styles.buttons}>
                <a
                  href={`/watch/creator/${video.id}`}
                  style={styles.watchButton}
                >
                  ▶ Watch Page
                </a>

                <button
                  type="button"
                  onClick={() => shareVideo(video)}
                  style={styles.shareButton}
                >
                  Share Video
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        © 2026 Ray&apos;sStream
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    padding: "35px 20px",
    textAlign: "center",
    borderBottom: "2px solid black",
    background:
      "linear-gradient(180deg, #17351f 0%, #0b0b0b 100%)",
  },

  homeButton: {
    display: "inline-block",
    marginBottom: "25px",
    padding: "10px 18px",
    background: "white",
    color: "black",
    border: "2px solid black",
    borderRadius: "20px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  avatar: {
    width: "90px",
    height: "90px",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#22c55e",
    color: "black",
    border: "4px solid white",
    borderRadius: "50%",
    fontSize: "42px",
    fontWeight: "bold",
  },

  channelTitle: {
    margin: "0 0 10px",
    fontSize: "clamp(34px, 6vw, 52px)",
  },

  creatorEmail: {
    color: "#d1d5db",
    fontSize: "18px",
    overflowWrap: "anywhere",
  },

  videoCount: {
    color: "#86efac",
    fontWeight: "bold",
  },

  content: {
    width: "min(1000px, 94%)",
    margin: "0 auto",
    padding: "35px 0 60px",
  },

  message: {
    textAlign: "center",
    color: "#d1d5db",
    fontSize: "20px",
    padding: "30px",
  },

  videoGrid: {
    display: "grid",
    gap: "30px",
  },

  card: {
    overflow: "hidden",
    background: "#202020",
    border: "2px solid black",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
  },

  videoTitle: {
    margin: 0,
    padding: "18px 20px",
    fontSize: "25px",
  },

  video: {
    display: "block",
    width: "100%",
    maxHeight: "650px",
    background: "black",
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "12px",
    padding: "18px",
  },

  watchButton: {
    display: "inline-block",
    padding: "11px 22px",
    background: "#22c55e",
    color: "black",
    border: "2px solid white",
    borderRadius: "20px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  shareButton: {
    padding: "11px 22px",
    background: "#292929",
    color: "white",
    border: "2px solid white",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  footer: {
    padding: "30px",
    textAlign: "center",
    borderTop: "2px solid black",
    color: "#777",
  },
}; 
