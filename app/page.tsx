"use client";

import { useEffect, useRef, useState } from "react";
import CreatorFeed from "./creator-feed";

type VideoComment = {
  id: number;
  text: string;
  viewerName: string;
  viewerUsername: string | null;
  viewerProfilePictureUrl: string | null;
};

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

export default function Home() {
  const [views, setViews] = useState<number[]>([
    0, 0, 0,
  ]);

  const [likes, setLikes] = useState<number[]>([
    0, 0, 0,
  ]);

  const [likedVideoIds, setLikedVideoIds] =
    useState<Set<number>>(new Set());

  const [subscribers, setSubscribers] = useState(0);
  const [subscriberEmail, setSubscriberEmail] =
    useState("");

  const [subscriptionMessage, setSubscriptionMessage] =
    useState("");

  const [subscribing, setSubscribing] =
    useState(false);

  const viewedVideos = useRef<Set<number>>(new Set());

  const [comments, setComments] =
    useState<VideoComment[][]>([[], [], []]);

  const [commentInputs, setCommentInputs] =
    useState<string[]>(["", "", ""]);

  useEffect(() => {
    async function loadSubscriberCount() {
      try {
        const response = await fetch("/api/subscribe");
        const data = await response.json();

        if (response.ok) {
          setSubscribers(Number(data.count || 0));
        }
      } catch (error) {
        console.error(
          "Unable to load subscribers:",
          error
        );
      }
    }

    async function loadVideoViews() {
      try {
        const response = await fetch("/api/views");
        const data = await response.json();

        if (response.ok) {
          setViews(
            videos.map((video) =>
              Number(data.views?.[video.id] || 0)
            )
          );
        }
      } catch (error) {
        console.error(
          "Unable to load video views:",
          error
        );
      }
    }

    async function loadVideoLikes() {
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

        if (response.ok) {
          setLikes(
            videos.map((video) =>
              Number(data.likes?.[video.id] || 0)
            )
          );

          setLikedVideoIds(
            new Set(
              (data.likedVideoIds || []).map(
                (videoId: number | string) =>
                  Number(videoId)
              )
            )
          );
        }
      } catch (error) {
        console.error(
          "Unable to load video likes:",
          error
        );
      }
    }

    async function loadVideoComments() {
      try {
        const response = await fetch("/api/comments", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        const groupedComments: VideoComment[][] =
          videos.map(() => []);

        for (const comment of data.comments || []) {
          const videoIndex = videos.findIndex(
            (video) =>
              video.id === Number(comment.videoId)
          );

          if (videoIndex >= 0) {
            groupedComments[videoIndex].push({
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
            });
          }
        }

        setComments(groupedComments);
      } catch (error) {
        console.error(
          "Unable to load comments:",
          error
        );
      }
    }

    loadSubscriberCount();
    loadVideoViews();
    loadVideoLikes();
    loadVideoComments();
  }, []);

  function clearViewerLogin() {
    localStorage.removeItem("raysstreamViewer");
    localStorage.removeItem("raysstreamViewerId");
    localStorage.removeItem("raysstreamViewerName");

    localStorage.removeItem(
      "raysstreamViewerUsername"
    );

    localStorage.removeItem("raysstreamViewerEmail");
  }

  async function addView(
    index: number,
    videoId: number
  ) {
    if (viewedVideos.current.has(videoId)) {
      return;
    }

    viewedVideos.current.add(videoId);

    try {
      const response = await fetch("/api/views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });

      const data = await response.json();

      if (!response.ok) {
        viewedVideos.current.delete(videoId);
        return;
      }

      setViews((current) => {
        const updated = [...current];
        updated[index] = Number(data.count || 0);
        return updated;
      });
    } catch (error) {
      viewedVideos.current.delete(videoId);

      console.error(
        "Unable to save video view:",
        error
      );
    }
  }

  async function likeVideo(
    index: number,
    videoId: number
  ) {
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
      window.location.href = "/viewer/login";
      return;
    }

    if (likedVideoIds.has(videoId)) {
      alert("You already liked this video.");
      return;
    }

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          viewerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to save like.");
        return;
      }

      setLikes((current) => {
        const updated = [...current];
        updated[index] = Number(data.count || 0);
        return updated;
      });

      setLikedVideoIds((current) => {
        const updated = new Set(current);
        updated.add(videoId);
        return updated;
      });

      if (data.alreadyLiked) {
        alert("You already liked this video.");
      }
    } catch (error) {
      console.error("Unable to save like:", error);

      alert(
        "Unable to connect to the likes database."
      );
    }
  }

  function updateComment(
    index: number,
    value: string
  ) {
    setCommentInputs((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  }

  async function postComment(
    index: number,
    videoId: number
  ) {
    const commentText =
      commentInputs[index]?.trim();

    if (!commentText) {
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
          videoId,
          text: commentText,
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

      setComments((current) => {
        const updated = current.map(
          (videoComments) => [...videoComments]
        );

        updated[index].push({
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
        });

        return updated;
      });

      setCommentInputs((current) => {
        const updated = [...current];
        updated[index] = "";
        return updated;
      });
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

  async function subscribe() {
    const email = subscriberEmail.trim();

    if (!email) {
      setSubscriptionMessage(
        "Please enter your email."
      );
      return;
    }

    try {
      setSubscribing(true);

      setSubscriptionMessage(
        "Saving subscription..."
      );

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubscriptionMessage(
          data.error ||
            "Unable to complete subscription."
        );
        return;
      }

      setSubscribers(Number(data.count || 0));
      setSubscriptionMessage(data.message);
      setSubscriberEmail("");
    } catch (error) {
      console.error(
        "Subscription error:",
        error
      );

      setSubscriptionMessage(
        "Unable to connect to the database."
      );
    } finally {
      setSubscribing(false);
    }
  }

  async function shareVideo(video: {
    id: number;
    title: string;
    slug: string;
    src: string;
  }) {
    const url =
      `${window.location.origin}/watch/${video.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch ${video.title} on Ray'sStream`,
          url,
        });
      } catch {
        // The user closed the share menu.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);

        alert(
          "Ray'sStream video link copied!"
        );
      } catch {
        window.prompt(
          "Copy this video link:",
          url
        );
      }
    }
  }

  function shareFacebook(videoId: number) {
    const url = encodeURIComponent(
      `${window.location.origin}/watch/video-${videoId}`
    );

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareX(videoId: number) {
    const url = encodeURIComponent(
      `${window.location.origin}/watch/video-${videoId}`
    );

    const text = encodeURIComponent(
      "Watch this video on Ray'sStream"
    );

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copyForTikTokInstagram(
    videoId: number
  ) {
    const url =
      `${window.location.origin}/watch/video-${videoId}`;

    try {
      await navigator.clipboard.writeText(url);

      alert(
        "Ray'sStream video link copied!"
      );
    } catch {
      window.prompt(
        "Copy this video link:",
        url
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          padding: "24px",
          borderBottom: "2px solid black",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            margin: "0 0 10px",
          }}
        >
          Ray&apos;sStream
        </h1>

        <p
          style={{
            color: "#bbb",
            fontSize: "18px",
          }}
        >
          Watch • Like • Comment • Subscribe • Share
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <a
            href="/watch/video-1"
            style={{
              ...linkStyle,
              background: "#e54421",
            }}
          >
            Watch Live
          </a>

          <a href="/viewer/signup" style={linkStyle}>
            Viewer Sign Up
          </a>

          <a href="/viewer/login" style={linkStyle}>
            Viewer Login
          </a>

          <a
            href="/viewer/dashboard"
            style={linkStyle}
          >
            Viewer Dashboard
          </a>

          <a
            href="/creator/signup"
            style={linkStyle}
          >
            Creator Sign Up
          </a>

          <a
            href="/creator/login"
            style={linkStyle}
          >
            Creator Login
          </a>

          <a
            href="/creator/dashboard"
            style={linkStyle}
          >
            Creator Dashboard
          </a>

          <a href="/admin/login" style={linkStyle}>
            Admin Dashboard
          </a>

          <a
            href="https://buy.stripe.com/fZu6oH08q6VV3Zw5TP2Nq02"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#fff",
              color: "#000",
              textDecoration: "none",
              border: "2px solid black",
              borderRadius: "22px",
              padding: "12px 22px",
              fontWeight: "bold",
            }}
          >
            💳 Paid Subscription
          </a>
        </div>

        <div
          style={{
            width: "min(500px, 100%)",
            margin: "22px auto 0",
            padding: "18px",
            background: "#121212",
            border: "2px solid black",
            borderRadius: "16px",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Subscribe to Ray&apos;sStream
          </h3>

          <p style={{ color: "#bbb" }}>
            {subscribers} subscribers
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <input
              type="email"
              value={subscriberEmail}
              onChange={(event) =>
                setSubscriberEmail(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  subscribe();
                }
              }}
              placeholder="Enter your email"
              style={{
                flex: "1 1 230px",
                padding: "12px",
                borderRadius: "20px",
                border: "2px solid black",
                background: "#1b1b1b",
                color: "white",
              }}
            />

            <button
              onClick={subscribe}
              disabled={subscribing}
              style={{
                ...buttonStyle,
                opacity: subscribing ? 0.6 : 1,
              }}
            >
              {subscribing
                ? "Saving..."
                : "Subscribe"}
            </button>
          </div>

          {subscriptionMessage && (
            <p style={{ marginBottom: 0 }}>
              {subscriptionMessage}
            </p>
          )}
        </div>
      </header>

      <section
        style={{
          textAlign: "center",
          padding: "30px 20px 10px",
        }}
      >
        <h2
          style={{
            fontSize: "34px",
            marginBottom: "8px",
          }}
        >
          Welcome to Ray&apos;sStream
        </h2>

        <p style={{ color: "#bbb" }}>
          Watch • Like • Comment • Subscribe • Share
        </p>
      </section>

      <section
        style={{
          width: "min(1000px, 94%)",
          margin: "auto",
          paddingBottom: "40px",
        }}
      >
        {videos.map((video, index) => (
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
              src={video.src}
              controls
              loop
              playsInline
              preload="metadata"
              onPlay={() =>
                addView(index, video.id)
              }
              style={{
                width: "100%",
                background: "black",
                border: "2px solid black",
                borderRadius: "14px",
                maxHeight: "600px",
              }}
            />

            <p>
              👁 {views[index] || 0} views &nbsp;
              👍 {likes[index] || 0} likes &nbsp;
              💬 {comments[index]?.length || 0}{" "}
              comments
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "9px",
              }}
            >
              <a
                href={`/watch/${video.slug}`}
                style={linkStyle}
              >
                ▶ Watch Page
              </a>

              <button
                onClick={() =>
                  likeVideo(index, video.id)
                }
                disabled={likedVideoIds.has(
                  video.id
                )}
                style={{
                  ...buttonStyle,
                  opacity: likedVideoIds.has(
                    video.id
                  )
                    ? 0.7
                    : 1,
                }}
              >
                {likedVideoIds.has(video.id)
                  ? "✓ Liked"
                  : "👍 Like"}
              </button>

              <button
                onClick={() => shareVideo(video)}
                style={buttonStyle}
              >
                Share
              </button>

              <button
                onClick={() =>
                  shareFacebook(video.id)
                }
                style={buttonStyle}
              >
                Facebook
              </button>

              <button
                onClick={() => shareX(video.id)}
                style={buttonStyle}
              >
                X
              </button>

              <button
                onClick={() =>
                  copyForTikTokInstagram(
                    video.id
                  )
                }
                style={buttonStyle}
              >
                TikTok
              </button>

              <button
                onClick={() =>
                  copyForTikTokInstagram(
                    video.id
                  )
                }
                style={buttonStyle}
              >
                Instagram
              </button>
            </div>

            <div style={{ marginTop: "24px" }}>
              <h3>Comments</h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <input
                  value={
                    commentInputs[index] || ""
                  }
                  onChange={(event) =>
                    updateComment(
                      index,
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      postComment(
                        index,
                        video.id
                      );
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
                  onClick={() =>
                    postComment(index, video.id)
                  }
                  style={buttonStyle}
                >
                  Post
                </button>
              </div>

              {comments[index]?.map(
                (comment) => (
                  <div
                    key={comment.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      background: "#1b1b1b",
                      marginTop: "8px",
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
                        alt={
                          comment.viewerName
                        }
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                          border:
                            "2px solid black",
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
                          border:
                            "2px solid black",
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
                            @
                            {
                              comment.viewerUsername
                            }
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: "5px",
                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        {comment.text}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </article>
        ))}
      </section>

      <CreatorFeed />

      <section
        style={{
          width: "min(1000px, 94%)",
          margin: "40px auto 50px",
          padding: "30px",
          textAlign: "center",
          background: "#121212",
          border: "2px solid black",
          borderRadius: "18px",
          boxSizing: "border-box",
        }}
      >
        <h2>🎬 Creator Uploads</h2>

        <p style={{ color: "#bbb" }}>
          Upload your own videos and watch creator
          uploads.
        </p>

        <a
          href="/creator/signup"
          style={creatorButton}
        >
          ✨ Creator Sign Up
        </a>

        <a
          href="/creator/login"
          style={creatorButton}
        >
          🔐 Creator Login
        </a>

        <a href="/upload" style={creatorButton}>
          ↑ Upload Video
        </a>

        <a href="/uploaded" style={creatorButton}>
          ▶ View Uploaded Videos
        </a>
      </section>

      <footer
        style={{
          padding: "30px",
          textAlign: "center",
          borderTop: "2px solid black",
          color: "#777",
        }}
      >
        © 2026 Ray&apos;sStream
      </footer>
    </main>
  );
}

const buttonStyle = {
  background: "#2b2b2b",
  color: "white",
  border: "2px solid black",
  padding: "10px 16px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
};

const linkStyle = {
  display: "inline-block",
  background: "#222",
  color: "white",
  textDecoration: "none",
  border: "2px solid black",
  borderRadius: "20px",
  padding: "10px 16px",
  fontWeight: "bold",
};

const creatorButton = {
  display: "inline-block",
  margin: "8px",
  padding: "12px 22px",
  background: "#2b2b2b",
  color: "white",
  textDecoration: "none",
  border: "2px solid black",
  borderRadius: "22px",
  fontWeight: "bold",
}; 
