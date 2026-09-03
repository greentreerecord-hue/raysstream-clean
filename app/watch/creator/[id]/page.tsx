"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type CreatorVideo = {
  id: string;
  url: string;
  title: string;
  description: string;
  creatorName: string;
  creatorProfilePictureUrl: string;
  thumbnailUrl: string;
  channelId: string;
};

type Comment = {
  id: number;
  text: string;
  viewerName: string;
  viewerUsername: string | null;
  createdAt: string;
};

export default function CreatorWatchPage() {
  const params = useParams();

  const idValue = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const videoId = String(idValue || "");

  const [video, setVideo] =
    useState<CreatorVideo | null>(null);

  const [moreVideos, setMoreVideos] = useState<
    CreatorVideo[]
  >([]);

  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const [comments, setComments] = useState<
    Comment[]
  >([]);

  const [commentInput, setCommentInput] =
    useState("");

  const [postingComment, setPostingComment] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const viewed = useRef(false);

  useEffect(() => {
    if (!videoId) {
      return;
    }

    viewed.current = false;

    async function loadVideo() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(
            data.error || "Unable to load video."
          );
          return;
        }

        const normalizedVideos: CreatorVideo[] = (
          data.videos || []
        ).map(
          (item: {
            id?: string;
            url?: string;
            blob_url?: string;
            title?: string;
            description?: string;
            creatorName?: string;
            creator_name?: string;
            creatorProfilePictureUrl?: string;
            creator_profile_picture_url?: string;
            thumbnailUrl?: string;
            thumbnail_url?: string;
            channelId?: string;
            channel_id?: string;
          }) => ({
            id: String(item.id || ""),
            url: String(
              item.url || item.blob_url || ""
            ),
            title: String(
              item.title || "Creator Video"
            ),
            description: String(
              item.description || ""
            ),
            creatorName: String(
              item.creatorName ||
                item.creator_name ||
                "Ray'sStream Creator"
            ),
            creatorProfilePictureUrl: String(
              item.creatorProfilePictureUrl ||
                item.creator_profile_picture_url ||
                ""
            ),
            thumbnailUrl: String(
              item.thumbnailUrl ||
                item.thumbnail_url ||
                ""
            ),
            channelId: String(
              item.channelId ||
                item.channel_id ||
                ""
            ),
          })
        );

        const selectedVideo =
          normalizedVideos.find(
            (item) => item.id === videoId
          );

        if (!selectedVideo) {
          setErrorMessage(
            "Creator video not found."
          );
          return;
        }

        setVideo(selectedVideo);

        setMoreVideos(
          normalizedVideos
            .filter(
              (item) =>
                item.id !== selectedVideo.id &&
                item.channelId ===
                  selectedVideo.channelId
            )
            .slice(0, 6)
        );
      } catch (error) {
        console.error(
          "Unable to load creator video:",
          error
        );

        setErrorMessage(
          "Unable to connect to the creator feed."
        );
      } finally {
        setLoading(false);
      }
    }

    async function loadEngagement() {
      try {
        const viewerId =
          localStorage.getItem(
            "raysstreamViewerId"
          ) || "";

        const response = await fetch(
          `/api/creator-engagement?videoId=${encodeURIComponent(
            videoId
          )}&viewerId=${encodeURIComponent(
            viewerId
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setViews(Number(data.views || 0));
          setLikes(Number(data.likes || 0));
          setLiked(Boolean(data.liked));
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error(
          "Unable to load creator engagement:",
          error
        );
      }
    }

    loadVideo();
    loadEngagement();
  }, [videoId]);

  function getViewerId() {
    return localStorage.getItem(
      "raysstreamViewerId"
    );
  }

  function requireViewerLogin() {
    alert(
      "Please log in to your viewer account first."
    );

    window.location.href = "/viewer/login";
  }

  async function addView() {
    if (!video || viewed.current) {
      return;
    }

    viewed.current = true;

    try {
      const response = await fetch(
        "/api/creator-engagement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: video.id,
            action: "view",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        viewed.current = false;
        return;
      }

      setViews(Number(data.count || 0));
    } catch (error) {
      viewed.current = false;

      console.error(
        "Unable to save creator video view:",
        error
      );
    }
  }

  async function likeVideo() {
    if (!video || liked || liking) {
      return;
    }

    const viewerId = getViewerId();

    if (!viewerId) {
      requireViewerLogin();
      return;
    }

    try {
      setLiking(true);

      const response = await fetch(
        "/api/creator-engagement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: video.id,
            action: "like",
            viewerId: Number(viewerId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          requireViewerLogin();
          return;
        }

        alert(data.error || "Unable to save like.");
        return;
      }

      setLikes(Number(data.count || 0));
      setLiked(true);
    } catch (error) {
      console.error(
        "Unable to save like:",
        error
      );

      alert(
        "Unable to connect to the likes database."
      );
    } finally {
      setLiking(false);
    }
  }

  async function postComment() {
    if (!video || postingComment) {
      return;
    }

    const viewerId = getViewerId();

    if (!viewerId) {
      requireViewerLogin();
      return;
    }

    const text = commentInput.trim();

    if (!text) {
      return;
    }

    try {
      setPostingComment(true);

      const response = await fetch(
        "/api/creator-engagement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: video.id,
            action: "comment",
            viewerId: Number(viewerId),
            text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          requireViewerLogin();
          return;
        }

        alert(
          data.error || "Unable to save comment."
        );
        return;
      }

      setComments((current) => [
        ...current,
        data.comment,
      ]);

      setCommentInput("");
    } catch (error) {
      console.error(
        "Unable to save creator comment:",
        error
      );

      alert(
        "Unable to connect to the comments database."
      );
    } finally {
      setPostingComment(false);
    }
  }

  async function copyVideoLink() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert("Video link copied!");
    } catch {
      window.prompt("Copy this video link:", url);
    }
  }

  async function shareToApps() {
    if (!video) {
      return;
    }

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text:
            `Watch ${video.title} on Ray'sStream`,
          url,
        });
      } catch {
        // The user closed the share menu.
      }
    } else {
      await copyVideoLink();
    }
  }

  function shareFacebook() {
    const url = encodeURIComponent(
      window.location.href
    );

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareX() {
    if (!video) {
      return;
    }

    const url = encodeURIComponent(
      window.location.href
    );

    const text = encodeURIComponent(
      `Watch ${video.title} on Ray'sStream`
    );

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareWhatsApp() {
    if (!video) {
      return;
    }

    const message = encodeURIComponent(
      `Watch ${video.title} on Ray'sStream: ${window.location.href}`
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareReddit() {
    if (!video) {
      return;
    }

    const url = encodeURIComponent(
      window.location.href
    );

    const title = encodeURIComponent(
      `Watch ${video.title} on Ray'sStream`
    );

    window.open(
      `https://www.reddit.com/submit?url=${url}&title=${title}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareLinkedIn() {
    const url = encodeURIComponent(
      window.location.href
    );

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareEmail() {
    if (!video) {
      return;
    }

    const subject = encodeURIComponent(
      `Watch ${video.title} on Ray'sStream`
    );

    const body = encodeURIComponent(
      `Watch this video on Ray'sStream:\n\n${window.location.href}`
    );

    window.location.href =
      `mailto:?subject=${subject}&body=${body}`;
  } 
if (loading) {
    return (
      <main style={messagePageStyle}>
        <h1>Ray&apos;sStream</h1>
        <p>Loading creator video...</p>
      </main>
    );
  }

  if (!video || errorMessage) {
    return (
      <main style={messagePageStyle}>
        <h1>Creator video not found</h1>

        <p style={{ color: "#bbb" }}>
          {errorMessage ||
            "This creator video does not exist."}
        </p>

        <a href="/" style={linkStyle}>
          Return Home
        </a>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "60px",
      }}
    >
      <header
        style={{
          padding: "24px",
          textAlign: "center",
          borderBottom: "2px solid black",
        }}
      >
        <a
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              margin: "0 0 10px",
            }}
          >
            Ray&apos;sStream
          </h1>
        </a>

        <p style={{ color: "#bbb" }}>
          Creator Video
        </p>
      </header>

      <article
        style={{
          width: "min(1000px, 94%)",
          margin: "30px auto",
          padding: "20px",
          boxSizing: "border-box",
          background: "#121212",
          border: "2px solid black",
          borderRadius: "18px",
        }}
      >
        <h2>{video.title}</h2>

        <video
          src={video.url}
          poster={
            video.thumbnailUrl || undefined
          }
          controls
          playsInline
          preload="metadata"
          onPlay={addView}
          style={{
            width: "100%",
            maxHeight: "650px",
            background: "black",
            border: "2px solid black",
            borderRadius: "14px",
          }}
        />

        <section
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "18px",
          }}
        >
          {video.creatorProfilePictureUrl ? (
            <img
              src={
                video.creatorProfilePictureUrl
              }
              alt={video.creatorName}
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid black",
              }}
            />
          ) : (
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "#333",
                border: "2px solid black",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {video.creatorName
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div>
            <strong
              style={{
                display: "block",
                fontSize: "18px",
              }}
            >
              {video.creatorName}
            </strong>

            {video.channelId && (
              <a
                href={`/creator/channel/${encodeURIComponent(
                  video.channelId
                )}`}
                style={{
                  color: "#bbb",
                }}
              >
                View Creator Channel
              </a>
            )}
          </div>
        </section>

        {video.description && (
          <p
            style={{
              color: "#ccc",
              lineHeight: 1.6,
            }}
          >
            {video.description}
          </p>
        )}

        <p
          style={{
            color: "#ccc",
            fontSize: "18px",
          }}
        >
          👁 {views} views &nbsp;
          👍 {likes} likes &nbsp;
          💬 {comments.length} comments
        </p>

        <button
          onClick={likeVideo}
          disabled={liked || liking}
          style={{
            ...buttonStyle,
            marginBottom: "24px",
            opacity:
              liked || liking ? 0.65 : 1,
          }}
        >
          {liking
            ? "Saving Like..."
            : liked
              ? "✓ Liked"
              : "👍 Like Video"}
        </button>

        <section style={{ marginBottom: "28px" }}>
          <h3>Share This Video</h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <button
              onClick={shareToApps}
              style={buttonStyle}
            >
              📱 Share to Apps
            </button>

            <button
              onClick={shareFacebook}
              style={buttonStyle}
            >
              Facebook
            </button>

            <button
              onClick={shareX}
              style={buttonStyle}
            >
              X
            </button>

            <button
              onClick={shareWhatsApp}
              style={buttonStyle}
            >
              WhatsApp
            </button>

            <button
              onClick={shareReddit}
              style={buttonStyle}
            >
              Reddit
            </button>

            <button
              onClick={shareLinkedIn}
              style={buttonStyle}
            >
              LinkedIn
            </button>

            <button
              onClick={shareEmail}
              style={buttonStyle}
            >
              Email
            </button>

            <button
              onClick={copyVideoLink}
              style={buttonStyle}
            >
              Copy Link
            </button>

            <a href="/" style={linkStyle}>
              Back to Home
            </a>
          </div>

          <p
            style={{
              color: "#aaa",
              fontSize: "14px",
              marginTop: "12px",
            }}
          >
            For Instagram, TikTok, Messenger, and
            other apps, use Share to Apps or Copy
            Link.
          </p>
        </section>

        <section>
          <h3>Comments</h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <input
              value={commentInput}
              onChange={(event) =>
                setCommentInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  postComment();
                }
              }}
              placeholder="Add a comment..."
              maxLength={1000}
              style={{
                flex: "1 1 300px",
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid black",
                background: "#1b1b1b",
                color: "white",
              }}
            />

            <button
              onClick={postComment}
              disabled={postingComment}
              style={{
                ...buttonStyle,
                opacity: postingComment
                  ? 0.65
                  : 1,
              }}
            >
              {postingComment
                ? "Posting..."
                : "Post"}
            </button>
          </div>

          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "#1b1b1b",
                marginTop: "10px",
                padding: "12px",
                border: "2px solid black",
                borderRadius: "10px",
              }}
            >
              <strong>
                {comment.viewerName ||
                  "Ray'sStream User"}

                {comment.viewerUsername && (
                  <span
                    style={{
                      color: "#9dc5ff",
                      marginLeft: "8px",
                    }}
                  >
                    @{comment.viewerUsername}
                  </span>
                )}
              </strong>

              <div>{comment.text}</div>
            </div>
          ))}
        </section>
      </article>

      {moreVideos.length > 0 && (
        <section
          style={{
            width: "min(1000px, 94%)",
            margin: "0 auto",
          }}
        >
          <h2>
            More From {video.creatorName}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {moreVideos.map((item) => (
              <a
                key={item.id}
                href={`/watch/creator/${item.id}`}
                style={videoCardStyle}
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    style={thumbnailStyle}
                  />
                ) : (
                  <div style={emptyThumbnailStyle}>
                    ▶
                  </div>
                )}

                <div style={{ padding: "14px" }}>
                  <strong>{item.title}</strong>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const messagePageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  fontFamily: "Arial, sans-serif",
  textAlign: "center",
  padding: "60px 20px",
};

const buttonStyle: CSSProperties = {
  background: "#2b2b2b",
  color: "white",
  border: "2px solid black",
  padding: "10px 16px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
};

const linkStyle: CSSProperties = {
  display: "inline-block",
  background: "#222",
  color: "white",
  textDecoration: "none",
  border: "2px solid black",
  borderRadius: "20px",
  padding: "10px 16px",
  fontWeight: "bold",
};

const videoCardStyle: CSSProperties = {
  color: "white",
  textDecoration: "none",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "14px",
  overflow: "hidden",
};

const thumbnailStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  objectFit: "cover",
  background: "black",
};

const emptyThumbnailStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  display: "grid",
  placeItems: "center",
  background: "black",
}; 
