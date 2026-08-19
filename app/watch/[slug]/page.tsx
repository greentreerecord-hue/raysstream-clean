"use client";

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

export default function WatchPage() {
  const params = useParams();

  const slugValue = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const video = videos.find((item) => item.slug === slugValue);

  const [views, setViews] = useState(0);
  const [comments, setComments] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const viewed = useRef(false);

  useEffect(() => {
    if (!video) {
      return;
    }

    async function loadViews() {
      try {
        const response = await fetch("/api/views");
        const data = await response.json();

        if (response.ok && video) {
          setViews(Number(data.views?.[video.id] || 0));
        }
      } catch (error) {
        console.error("Unable to load views:", error);
      }
    }

    async function loadComments() {
      try {
        const response = await fetch("/api/comments");
        const data = await response.json();

        if (response.ok && video) {
          const videoComments = (data.comments || [])
            .filter(
              (comment: { videoId: number }) =>
                Number(comment.videoId) === video.id
            )
            .map(
              (comment: { text: string }) =>
                String(comment.text)
            );

          setComments(videoComments);
        }
      } catch (error) {
        console.error("Unable to load comments:", error);
      }
    }

    loadViews();
    loadComments();
  }, [video]);

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
      console.error("Unable to save view:", error);
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

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: video.id,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to save comment.");
        return;
      }

      setComments((current) => [
        ...current,
        data.comment.text,
      ]);

      setCommentInput("");
    } catch (error) {
      console.error("Unable to save comment:", error);
      alert("Unable to connect to the comments database.");
    }
  }

  async function shareVideo() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert("Video link copied!");
    } catch {
      window.prompt("Copy this video link:", url);
    }
  }

  if (!video) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "white",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          padding: "60px 20px",
        }}
      >
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
          👁 {views} views &nbsp; 💬 {comments.length} comments
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <button onClick={shareVideo} style={buttonStyle}>
            Copy Video Link
          </button>

          <a href="/" style={linkStyle}>
            Back to Home
          </a>
        </div>

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
                setCommentInput(event.target.value)
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

            <button onClick={postComment} style={buttonStyle}>
              Post
            </button>
          </div>

          {comments.map((comment, index) => (
            <div
              key={index}
              style={{
                background: "#1b1b1b",
                marginTop: "10px",
                padding: "12px",
                border: "2px solid black",
                borderRadius: "10px",
              }}
            >
              <strong>Ray&apos;sStream User</strong>
              <div>{comment}</div>
            </div>
          ))}
        </section>
      </article>
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
