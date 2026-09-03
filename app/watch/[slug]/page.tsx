"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const videos = [
  {
    id: 1,
    slug: "video-1",
    title: "Ray'sStream Video 1",
    src: "/videos/video1.mp4",
  },
  {
    id: 2,
    slug: "video-2",
    title: "Ray'sStream Video 2",
    src: "/videos/video2.mp4",
  },
  {
    id: 3,
    slug: "video-3",
    title: "Ray'sStream Video 3",
    src: "/videos/video3.mp4",
  },
];

type CreatorVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  creatorName: string;
};

type VideoComment = {
  id: number;
  text: string;
  viewerName: string;
  viewerUsername: string | null;
  viewerProfilePictureUrl: string | null;
};

export default function WatchPage() {
  const params = useParams();

  const slugValue = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const video = videos.find(
    (item) => item.slug === slugValue
  );

  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const [comments, setComments] = useState<
    VideoComment[]
  >([]);

  const [commentInput, setCommentInput] =
    useState("");

  const [creatorVideos, setCreatorVideos] =
    useState<CreatorVideo[]>([]);

  const viewed = useRef(false);

  useEffect(() => {
    if (!video) {
      return;
    }

    viewed.current = false;

    async function loadViews() {
      try {
        const response = await fetch("/api/views");
        const data = await response.json();

        if (response.ok && video) {
          setViews(
            Number(data.views?.[video.id] || 0)
          );
        }
      } catch (error) {
        console.error(
          "Unable to load views:",
          error
        );
      }
    }

    async function loadLikes() {
      try {
        const viewerId = localStorage.getItem(
          "raysstreamViewerId"
        );

        const likesUrl = viewerId
          ? `/api/likes?viewerId=${encodeURIComponent(
              viewerId
            )}`
          : "/api/likes";

        const response = await fetch(likesUrl);
        const data = await response.json();

        if (response.ok && video) {
          setLikes(
            Number(data.likes?.[video.id] || 0)
          );

          const likedVideoIds = (
            data.likedVideoIds || []
          ).map((videoId: number | string) =>
            Number(videoId)
          );

          setLiked(
            likedVideoIds.includes(video.id)
          );
        }
      } catch (error) {
        console.error(
          "Unable to load likes:",
          error
        );
      }
    }

    async function loadComments() {
      try {
        const response = await fetch(
          "/api/comments",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok && video) {
          const videoComments: VideoComment[] = (
            data.comments || []
          )
            .filter(
              (comment: { videoId: number }) =>
                Number(comment.videoId) === video.id
            )
            .map(
              (comment: {
                id: number;
                text: string;
                viewerName?: string;
                viewerUsername?: string | null;
                viewerProfilePictureUrl?:
                  | string
                  | null;
              }) => ({
                id: Number(comment.id),
                text: String(comment.text),

                viewerName:
                  comment.viewerName ||
                  "Ray'sStream User",

                viewerUsername:
                  comment.viewerUsername || null,

                viewerProfilePictureUrl:
                  comment.viewerProfilePictureUrl ||
                  null,
              })
            );

          setComments(videoComments);
        }
      } catch (error) {
        console.error(
          "Unable to load comments:",
          error
        );
      }
    }

    async function loadCreatorVideos() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        const normalizedVideos: CreatorVideo[] = (
          data.videos || []
        ).map(
          (item: {
            id?: string;
            title?: string;
            thumbnailUrl?: string;
            thumbnail_url?: string;
            creatorName?: string;
            creator_name?: string;
          }) => ({
            id: String(item.id || ""),

            title: String(
              item.title || "Creator Video"
            ),

            thumbnailUrl: String(
              item.thumbnailUrl ||
                item.thumbnail_url ||
                ""
            ),

            creatorName: String(
              item.creatorName ||
                item.creator_name ||
                "Ray'sStream Creator"
            ),
          })
        );

        setCreatorVideos(
          normalizedVideos.slice(0, 6)
        );
      } catch (error) {
        console.error(
          "Unable to load creator recommendations:",
          error
        );
      }
    }

    loadViews();
    loadLikes();
    loadComments();
    loadCreatorVideos();
  }, [video]);

  function clearViewerLogin() {
    localStorage.removeItem("raysstreamViewer");
    localStorage.removeItem("raysstreamViewerId");
    localStorage.removeItem("raysstreamViewerName");

    localStorage.removeItem(
      "raysstreamViewerUsername"
    );

    localStorage.removeItem(
      "raysstreamViewerEmail"
    );
  }

  async function addView() {
    if (!video || viewed.current) {
      return;
    }

    viewed.current = true;

    try {
      const response = await fetch("/api/views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: video.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        viewed.current = false;
        return;
      }

      setViews(Number(data.count || 0));
    } catch (error) {
      viewed.current = false;

      console.error(
        "Unable to save view:",
        error
      );
    }
  }

  async function likeVideo() {
    if (!video || liked || liking) {
      return;
    }

    const viewerIdValue = localStorage.getItem(
      "raysstreamViewerId"
    );

    if (!viewerIdValue) {
      const shouldLogin = window.confirm(
        "Please sign in to your viewer account to like videos. Go to Viewer Login now?"
      );

      if (shouldLogin) {
        window.location.href = "/viewer/login";
      }

      return;
    }

    const viewerId = Number(viewerIdValue);

    if (
      !Number.isInteger(viewerId) ||
      viewerId < 1
    ) {
      clearViewerLogin();

      alert(
        "Your viewer login has expired. Please log in again."
      );

      window.location.href = "/viewer/login";
      return;
    }

    try {
      setLiking(true);

      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: video.id,
          viewerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error || "Unable to save like."
        );
        return;
      }

      setLikes(Number(data.count || 0));
      setLiked(true);

      if (data.alreadyLiked) {
        alert("You already liked this video.");
      }
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
    if (!video) {
      return;
    }

    const text = commentInput.trim();

    if (!text) {
      return;
    }

    const viewerIdValue = localStorage.getItem(
      "raysstreamViewerId"
    );

    if (!viewerIdValue) {
      const shouldLogin = window.confirm(
        "Please sign in to your viewer account to comment. Go to Viewer Login now?"
      );

      if (shouldLogin) {
        window.location.href = "/viewer/login";
      }

      return;
    }

    const viewerId = Number(viewerIdValue);

    if (
      !Number.isInteger(viewerId) ||
      viewerId < 1
    ) {
      clearViewerLogin();

      alert(
        "Your viewer login has expired. Please log in again."
      );

      window.location.href = "/viewer/login";
      return;
    }

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: video.id,
          text,
          viewerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error || "Unable to save comment."
        );
        return;
      }

      setComments((current) => [
        ...current,
        {
          id: Number(data.comment.id),
          text: String(data.comment.text),

          viewerName:
            data.comment.viewerName ||
            "Ray'sStream User",

          viewerUsername:
            data.comment.viewerUsername || null,

          viewerProfilePictureUrl:
            data.comment.viewerProfilePictureUrl ||
            null,
        },
      ]);

      setCommentInput("");
    } catch (error) {
      console.error(
        "Unable to save comment:",
        error
      );

      alert(
        "Unable to connect to the comments database."
      );
    }
  }

  async function copyVideoLink() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert("Video link copied!");
    } catch {
      window.prompt(
        "Copy this video link:",
        url
      );
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

  if (!video) {
    return (
      <main style={messagePageStyle}>
        <h1>Video not found</h1>

        <p style={{ color: "#bbb" }}>
          This Ray&apos;sStream video does not exist.
        </p>

        <a href="/" style={linkStyle}>
          Return Home
        </a>
      </main>
    );
  }

  const currentIndex = videos.findIndex(
    (item) => item.id === video.id
  );

  const upNext =
    videos[(currentIndex + 1) % videos.length];

  const otherStaticVideos = videos.filter(
    (item) => item.id !== video.id
  );

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
          Individual Video Page
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
          src={video.src}
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
              style={buttonStyle}
            >
              Post
            </button>
          </div>

          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "#1b1b1b",
                marginTop: "10px",
                padding: "12px",
                border: "2px solid black",
                borderRadius: "10px",
              }}
            >
              {comment.viewerProfilePictureUrl ? (
                <img
                  src={
                    comment.viewerProfilePictureUrl
                  }
                  alt={comment.viewerName}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "2px solid black",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, #ff5577, #ff7a00)",
                    border: "2px solid black",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {comment.viewerName
                    .charAt(0)
                    .toUpperCase() || "V"}
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div>
                  <strong>
                    {comment.viewerName}
                  </strong>

                  {comment.viewerUsername && (
                    <span
                      style={{
                        marginLeft: "8px",
                        color: "#aaa",
                      }}
                    >
                      @{comment.viewerUsername}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {comment.text}
                </div>
              </div>
            </div>
          ))}
        </section>
      </article>

      <section
        style={{
          width: "min(1000px, 94%)",
          margin: "0 auto 30px",
          padding: "20px",
          boxSizing: "border-box",
          background: "#121212",
          border: "2px solid black",
          borderRadius: "18px",
        }}
      >
        <h2>Up Next</h2>

        <a
          href={`/watch/${upNext.slug}`}
          style={{
            display: "block",
            color: "white",
            textDecoration: "none",
            background: "#1b1b1b",
            border: "2px solid black",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <video
            src={`${upNext.src}#t=1`}
            muted
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              aspectRatio: "16 / 7",
              objectFit: "cover",
              background: "black",
              borderRadius: "12px",
              marginBottom: "14px",
              pointerEvents: "none",
            }}
          />

          <strong style={{ fontSize: "20px" }}>
            {upNext.title}
          </strong>

          <p
            style={{
              color: "#bbb",
              marginBottom: 0,
            }}
          >
            Watch the next Ray&apos;sStream video
          </p>
        </a>
      </section>

      <section
        style={{
          width: "min(1000px, 94%)",
          margin: "0 auto",
        }}
      >
        <h2>More Videos</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {otherStaticVideos.map((item) => (
            <a
              key={item.id}
              href={`/watch/${item.slug}`}
              style={recommendationCardStyle}
            >
              <video
                src={`${item.src}#t=1`}
                muted
                playsInline
                preload="metadata"
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                  background: "black",
                  pointerEvents: "none",
                }}
              />

              <div style={{ padding: "14px" }}>
                <strong>{item.title}</strong>

                <p
                  style={{
                    color: "#bbb",
                    margin: "6px 0 0",
                  }}
                >
                  Ray&apos;sStream
                </p>
              </div>
            </a>
          ))}

          {creatorVideos.map((item) => (
            <a
              key={item.id}
              href={`/watch/creator/${item.id}`}
              style={recommendationCardStyle}
            >
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                    background: "black",
                  }}
                />
              ) : (
                <div style={staticThumbnailStyle}>
                  ▶
                </div>
              )}

              <div style={{ padding: "14px" }}>
                <strong>{item.title}</strong>

                <p
                  style={{
                    color: "#bbb",
                    margin: "6px 0 0",
                  }}
                >
                  {item.creatorName}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
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

const recommendationCardStyle: CSSProperties = {
  color: "white",
  textDecoration: "none",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "14px",
  overflow: "hidden",
};

const staticThumbnailStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  display: "grid",
  placeItems: "center",
  background:
    "linear-gradient(135deg, #111, #333)",
  fontSize: "40px",
}; 
