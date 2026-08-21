"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CreatorVideo = {
  id: string | number;
  title: string;
  url: string;
  blob_url?: string;
  creator_email?: string;
};

export default function CreatorChannelPage() {
  const params = useParams();

  const emailValue = Array.isArray(params.email)
    ? params.email[0]
    : params.email;

  const creatorEmail = decodeURIComponent(
    String(emailValue || "")
  ).toLowerCase();

  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] =
    useState("");

  useEffect(() => {
    async function loadChannel() {
      try {
        setLoading(true);

        const feedResponse = await fetch("/api/feed", {
          cache: "no-store",
        });

        const feedData = await feedResponse.json();

        if (!feedResponse.ok) {
          throw new Error(
            feedData.error || "Unable to load creator videos."
          );
        }

        const videoList = Array.isArray(feedData)
          ? feedData
          : feedData.videos || [];

        const creatorVideos = videoList
          .map((video: CreatorVideo) => ({
            ...video,
            url: video.url || video.blob_url || "",
          }))
          .filter(
            (video: CreatorVideo) =>
              String(video.creator_email || "").toLowerCase() ===
              creatorEmail
          );

        setVideos(creatorVideos);

        const countResponse = await fetch(
          `/api/creator-subscribe?creatorEmail=${encodeURIComponent(
            creatorEmail
          )}`,
          {
            cache: "no-store",
          }
        );

        const countData = await countResponse.json();

        if (countResponse.ok) {
          setSubscriberCount(Number(countData.count || 0));
        }

        const subscriptionKey =
          `raysstream-creator-subscribed-${creatorEmail}`;

        setSubscribed(
          localStorage.getItem(subscriptionKey) === "true"
        );
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
      loadChannel();
    }
  }, [creatorEmail]);

  function getSubscriberId() {
    const storageKey = "raysstreamSubscriberId";
    let subscriberId = localStorage.getItem(storageKey);

    if (!subscriberId) {
      subscriberId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `subscriber-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      localStorage.setItem(storageKey, subscriberId);
    }

    return subscriberId;
  }

  async function subscribeToCreator() {
    if (subscribed || subscribing) {
      return;
    }

    try {
      setSubscribing(true);
      setSubscriptionMessage("Saving subscription...");

      const response = await fetch(
        "/api/creator-subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creatorEmail,
            subscriberId: getSubscriberId(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSubscriptionMessage(
          data.error ||
            "Unable to subscribe to this creator."
        );
        return;
      }

      localStorage.setItem(
        `raysstream-creator-subscribed-${creatorEmail}`,
        "true"
      );

      setSubscribed(true);
      setSubscriberCount(Number(data.count || 0));
      setSubscriptionMessage(data.message || "Subscribed!");
    } catch (error) {
      console.error("Creator subscription error:", error);

      setSubscriptionMessage(
        "Unable to connect to the subscription database."
      );
    } finally {
      setSubscribing(false);
    }
  }

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
        // Sharing was cancelled.
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

  if (loading) {
    return (
      <main style={styles.page}>
        <p style={styles.message}>
          Loading creator channel...
        </p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.channel}>
        <a href="/" style={styles.homeButton}>
          ← Back to Home Page
        </a>

        <div style={styles.avatar}>C</div>

        <h1 style={styles.heading}>Creator Channel</h1>

        <p style={styles.privateText}>
          Ray&apos;sStream Creator
        </p>

        <p style={styles.statistics}>
          {subscriberCount}{" "}
          {subscriberCount === 1
            ? "subscriber"
            : "subscribers"}
          {" • "}
          {videos.length}{" "}
          {videos.length === 1 ? "video" : "videos"}
        </p>

        <button
          type="button"
          onClick={subscribeToCreator}
          disabled={subscribed || subscribing}
          style={{
            ...styles.subscribeButton,
            opacity: subscribed || subscribing ? 0.7 : 1,
          }}
        >
          {subscribing
            ? "Subscribing..."
            : subscribed
              ? "✓ Subscribed"
              : "Subscribe to Creator"}
        </button>

        {subscriptionMessage && (
          <p style={styles.subscriptionMessage}>
            {subscriptionMessage}
          </p>
        )}

        {message && (
          <p style={styles.error}>{message}</p>
        )}

        {!message && videos.length === 0 && (
          <p style={styles.message}>
            This creator has not uploaded any videos yet.
          </p>
        )}

        <div style={styles.videoGrid}>
          {videos.map((video) => (
            <article
              key={video.id}
              style={styles.videoCard}
            >
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

              <div style={styles.buttonRow}>
                <a
                  href={`/watch/creator/${video.id}`}
                  style={styles.watchButton}
                >
                  Watch Page
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
    padding: "30px 16px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  channel: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center",
  },

  homeButton: {
    display: "inline-block",
    marginBottom: "28px",
    padding: "12px 22px",
    background: "white",
    color: "#222",
    border: "2px solid black",
    borderRadius: "24px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  avatar: {
    width: "120px",
    height: "120px",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#22c55e",
    color: "black",
    border: "4px solid white",
    borderRadius: "50%",
    fontSize: "55px",
    fontWeight: "bold",
  },

  heading: {
    margin: "0 0 14px",
    fontSize: "clamp(38px, 7vw, 66px)",
  },

  privateText: {
    margin: "0 0 12px",
    color: "#e5e7eb",
    fontSize: "20px",
    fontWeight: "bold",
  },

  statistics: {
    margin: "0 0 20px",
    color: "#d1d5db",
    fontSize: "18px",
    fontWeight: "bold",
  },

  subscribeButton: {
    padding: "13px 25px",
    background: "#22c55e",
    color: "black",
    border: "3px solid white",
    borderRadius: "24px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  subscriptionMessage: {
    margin: "12px 0 0",
    color: "#86efac",
    fontWeight: "bold",
  },

  error: {
    marginTop: "30px",
    padding: "18px",
    color: "#fca5a5",
    background: "#281313",
    border: "2px solid #7f1d1d",
    borderRadius: "12px",
  },

  message: {
    marginTop: "35px",
    color: "#d1d5db",
    fontSize: "20px",
    textAlign: "center",
  },

  videoGrid: {
    display: "grid",
    gap: "30px",
    marginTop: "55px",
    textAlign: "left",
  },

  videoCard: {
    overflow: "hidden",
    background: "#242424",
    border: "2px solid black",
    borderRadius: "18px",
  },

  videoTitle: {
    margin: 0,
    padding: "18px 20px",
    color: "white",
    fontSize: "26px",
  },

  video: {
    display: "block",
    width: "100%",
    maxHeight: "650px",
    background: "black",
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
    padding: "18px",
  },

  watchButton: {
    display: "inline-block",
    padding: "11px 22px",
    background: "#22c55e",
    color: "black",
    border: "2px solid black",
    borderRadius: "22px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  shareButton: {
    padding: "11px 22px",
    background: "#2b2b2b",
    color: "white",
    border: "2px solid black",
    borderRadius: "22px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  footer: {
    marginTop: "70px",
    padding: "25px",
    color: "#9ca3af",
    textAlign: "center",
  },
}; 
