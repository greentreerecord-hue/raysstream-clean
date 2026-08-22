"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type CreatorVideo = {
  id: string | number;
  title: string;
  description?: string;
  url: string;
  blob_url?: string;
  thumbnailUrl?: string;
};

type Comment = {
  id: number;
  text: string;
  createdAt?: string;
};

export default function CreatorWatchPage() {
  const params = useParams();
  const router = useRouter();

  const idValue = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const id = String(idValue || "");

  const [video, setVideo] = useState<CreatorVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [liked, setLiked] = useState(false);
  const [showShareButtons, setShowShareButtons] =
    useState(false);

  const viewed = useRef(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const [videoResponse, activityResponse] =
          await Promise.all([
            fetch("/api/feed", {
              cache: "no-store",
            }),
            fetch(
              `/api/creator-interactions?videoId=${encodeURIComponent(
                id
              )}`,
              {
                cache: "no-store",
              }
            ),
          ]);

        const videoData = await videoResponse.json();

        if (!videoResponse.ok) {
          throw new Error(
            videoData.error ||
              "Could not load creator videos."
          );
        }

        const videoList: CreatorVideo[] = Array.isArray(
          videoData
        )
          ? videoData
          : videoData.videos || [];

        const selectedVideo = videoList.find(
          (item) => String(item.id) === id
        );

        if (!selectedVideo) {
          setMessage("Video not found.");
          return;
        }

        setVideo({
          ...selectedVideo,
          url:
            selectedVideo.url ||
            selectedVideo.blob_url ||
            "",
        });

        if (activityResponse.ok) {
          const activityData =
            await activityResponse.json();

          setViews(Number(activityData.views || 0));
          setLikes(Number(activityData.likes || 0));
          setShares(Number(activityData.shares || 0));

          setComments(
            Array.isArray(activityData.comments)
              ? activityData.comments
              : []
          );
        }

        setLiked(
          localStorage.getItem(
            `raysstream-liked-creator-${id}`
          ) === "yes"
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this video."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPage();
    }
  }, [id]);

  async function saveAction(
    action: "view" | "like" | "share" | "comment",
    text?: string
  ) {
    const response = await fetch(
      "/api/creator-interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: id,
          action,
          text,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to save video activity."
      );
    }

    return data;
  }

  async function addView() {
    if (!id || viewed.current) {
      return;
    }

    viewed.current = true;

    try {
      const data = await saveAction("view");
      setViews(Number(data.views || 0));
    } catch (error) {
      viewed.current = false;
      console.error("Unable to save view:", error);
    }
  }

  async function likeVideo() {
    if (liked) {
      alert("You already liked this video.");
      return;
    }

    try {
      const data = await saveAction("like");

      setLikes(Number(data.likes || 0));
      setLiked(true);

      localStorage.setItem(
        `raysstream-liked-creator-${id}`,
        "yes"
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to like this video."
      );
    }
  }

  async function recordShare() {
    try {
      const data = await saveAction("share");
      setShares(Number(data.shares || 0));
    } catch (error) {
      console.error("Unable to save share:", error);
    }
  }

  async function copyWatchLink() {
    const watchUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(watchUrl);
      alert("Ray'sStream watch link copied!");
    } catch {
      window.prompt(
        "Copy this Ray'sStream watch link:",
        watchUrl
      );
    }

    await recordShare();
  }

  async function shareToFacebook() {
    const watchUrl = encodeURIComponent(
      window.location.href
    );

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${watchUrl}`,
      "_blank",
      "noopener,noreferrer"
    );

    await recordShare();
  }

  async function shareToX() {
    const watchUrl = encodeURIComponent(
      window.location.href
    );

    const text = encodeURIComponent(
      `Watch ${
        video?.title || "this video"
      } on Ray'sStream`
    );

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${watchUrl}`,
      "_blank",
      "noopener,noreferrer"
    );

    await recordShare();
  }

  async function shareToTikTok() {
    const watchUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(watchUrl);
    } catch {
      window.prompt(
        "Copy this Ray'sStream watch link:",
        watchUrl
      );
    }

    window.open(
      "https://www.tiktok.com/",
      "_blank",
      "noopener,noreferrer"
    );

    alert("Video link copied. Paste it into TikTok.");
    await recordShare();
  }

  async function shareToInstagram() {
    const watchUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(watchUrl);
    } catch {
      window.prompt(
        "Copy this Ray'sStream watch link:",
        watchUrl
      );
    }

    window.open(
      "https://www.instagram.com/",
      "_blank",
      "noopener,noreferrer"
    );

    alert("Video link copied. Paste it into Instagram.");
    await recordShare();
  }

  async function postComment() {
    const text = commentInput.trim();

    if (!text) {
      return;
    }

    try {
      const data = await saveAction("comment", text);

      setComments((current) => [
        ...current,
        data.comment,
      ]);

      setCommentInput("");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to post comment."
      );
    }
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

        <button
          style={styles.button}
          onClick={() => router.push("/")}
        >
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
          poster={video.thumbnailUrl || undefined}
          controls
          autoPlay
          playsInline
          preload="metadata"
          onPlay={addView}
        />

        {video.description && (
          <div style={styles.description}>
            <h3 style={styles.descriptionHeading}>
              Description
            </h3>

            <p style={styles.descriptionText}>
              {video.description}
            </p>
          </div>
        )}

        <div style={styles.stats}>
          <span>👁 {views} views</span>
          <span>👍 {likes} likes</span>
          <span>💬 {comments.length} comments</span>
          <span>↗ {shares} shares</span>
        </div>

        <div style={styles.buttons}>
          <button
            style={{
              ...styles.button,
              background: liked ? "#166534" : "#22c55e",
              color: liked ? "white" : "black",
            }}
            onClick={likeVideo}
          >
            {liked ? "Liked" : "Like Video"}
          </button>

          <button
            style={styles.button}
            onClick={() =>
              setShowShareButtons((current) => !current)
            }
          >
            Share Video
          </button>

          <button
            style={styles.button}
            onClick={() => router.push("/")}
          >
            More Videos
          </button>
        </div>

        {showShareButtons && (
          <div style={styles.sharePanel}>
            <button
              style={styles.shareButton}
              onClick={shareToFacebook}
            >
              Facebook
            </button>

            <button
              style={styles.shareButton}
              onClick={shareToX}
            >
              X
            </button>

            <button
              style={styles.shareButton}
              onClick={shareToTikTok}
            >
              TikTok
            </button>

            <button
              style={styles.shareButton}
              onClick={shareToInstagram}
            >
              Instagram
            </button>

            <button
              style={styles.shareButton}
              onClick={copyWatchLink}
            >
              Copy Link
            </button>
          </div>
        )}

        <section style={styles.commentSection}>
          <h3 style={styles.commentHeading}>Comments</h3>

          <div style={styles.commentForm}>
            <input
              value={commentInput}
              onChange={(event) =>
                setCommentInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  postComment();
                }
              }}
              placeholder="Add a comment..."
              maxLength={1000}
              style={styles.input}
            />

            <button
              style={styles.button}
              onClick={postComment}
            >
              Post
            </button>
          </div>

          {comments.length === 0 && (
            <p style={styles.emptyComments}>
              Be the first to comment.
            </p>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              style={styles.comment}
            >
              <strong>Ray&apos;sStream User</strong>

              <div style={styles.commentText}>
                {comment.text}
              </div>
            </div>
          ))}
        </section>
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
    maxWidth: "800px",
    margin: "0 auto",
  },
  logo: {
    color: "#22c55e",
    fontSize: "38px",
    marginBottom: "24px",
  },
  title: {
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
  description: {
    background: "#171717",
    border: "2px solid black",
    borderRadius: "12px",
    padding: "18px",
    marginTop: "20px",
    textAlign: "left",
  },
  descriptionHeading: {
    fontSize: "22px",
    margin: "0 0 10px",
  },
  descriptionText: {
    color: "#e5e7eb",
    fontSize: "17px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: 0,
  },
  stats: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "18px",
    color: "#e5e7eb",
    fontSize: "17px",
    marginTop: "20px",
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
  sharePanel: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    background: "#171717",
    border: "2px solid black",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "16px",
  },
  shareButton: {
    background: "#262626",
    color: "white",
    border: "2px solid white",
    borderRadius: "20px",
    padding: "10px 18px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  commentSection: {
    background: "#171717",
    border: "2px solid black",
    borderRadius: "14px",
    marginTop: "34px",
    padding: "20px",
    textAlign: "left",
  },
  commentHeading: {
    fontSize: "25px",
    marginTop: 0,
  },
  commentForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  input: {
    flex: "1 1 300px",
    background: "#262626",
    color: "white",
    border: "2px solid black",
    borderRadius: "9px",
    padding: "12px",
    fontSize: "16px",
  },
  emptyComments: {
    color: "#a3a3a3",
    marginTop: "22px",
  },
  comment: {
    background: "#262626",
    border: "2px solid black",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "12px",
  },
  commentText: {
    marginTop: "5px",
    overflowWrap: "anywhere",
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
