"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type CreatorVideo = {
  id: string | number;
  title: string;
  url: string;
  creator_email?: string;
  created_at?: string;
};

export default function CreatorWatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [video, setVideo] = useState<CreatorVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadVideo() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load videos.");
        }

        const data = await response.json();

        const videos: CreatorVideo[] = Array.isArray(data)
          ? data
          : data.videos || [];

        const selectedVideo = videos.find(
          (item) => String(item.id) === id
        );

        if (!selectedVideo) {
          setMessage("Video not found.");
          return;
        }

        setVideo(selectedVideo);
      } catch {
        setMessage("Unable to load this video.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadVideo();
    }
  }, [id]);

  function openWatchLink() {
    const watchLink = window.location.href;

    window.open(
      watchLink,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openMoreVideos() {
    router.push("/");
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <p style={styles.message}>Loading video...</p>
      </main>
    );
  }

  if (!video) {
    return (
      <main style={styles.page}>
        <p style={styles.message}>
          {message || "Video not found."}
        </p>

        <button style={styles.button} onClick={openMoreVideos}>
          More Videos
        </button>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.logo}>Ray&apos;sStream</h1>

        <h2 style={styles.title}>{video.title}</h2>

        <video
          style={styles.video}
          src={video.url}
          controls
          autoPlay
          playsInline
        />

        {video.creator_email && (
          <p style={styles.creator}>
            Creator: {video.creator_email}
          </p>
        )}

        <div style={styles.buttons}>
          <button style={styles.button} onClick={openWatchLink}>
            Open Watch Link
          </button>

          <button style={styles.button} onClick={openMoreVideos}>
            More Videos
          </button>
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
    padding: "30px 16px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
  },

  logo: {
    color: "#22c55e",
    fontSize: "38px",
    marginBottom: "24px",
  },

  title: {
    color: "white",
    fontSize: "28px",
    marginBottom: "18px",
  },

  video: {
    display: "block",
    width: "100%",
    maxHeight: "650px",
    margin: "0 auto",
    background: "black",
    border: "3px solid white",
    borderRadius: "12px",
  },

  creator: {
    color: "#d1d5db",
    marginTop: "14px",
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "24px",
  },

  button: {
    background: "#22c55e",
    color: "black",
    border: "2px solid white",
    borderRadius: "9px",
    padding: "12px 22px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    fontSize: "22px",
    marginBottom: "24px",
  },

  footer: {
    color: "#9ca3af",
    marginTop: "70px",
  },
}; 
