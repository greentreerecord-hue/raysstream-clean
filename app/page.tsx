"use client";

import { useEffect, useState } from "react";

const videos = [
  { title: "It's Cool", src: "/videos/video1.mp4" },
  { title: "Video 2", src: "/videos/video2.mp4" },
  { title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(videos[0]);
  const [likes, setLikes] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState<string[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setLikes(Number(localStorage.getItem("likes") || "0"));
    setSubscribers(Number(localStorage.getItem("subscribers") || "0"));

    const savedViews = Number(localStorage.getItem("views") || "0") + 1;
    setViews(savedViews);
    localStorage.setItem("views", String(savedViews));

    setComments(JSON.parse(localStorage.getItem("comments") || "[]"));
  }, []);

  function likeVideo() {
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem("likes", String(newLikes));
  }

  function subscribe() {
    const newSubscribers = subscribers + 1;
    setSubscribers(newSubscribers);
    localStorage.setItem("subscribers", String(newSubscribers));
  }

  function shareVideo() {
    navigator.clipboard.writeText(window.location.href);
    alert("Ray'sStream link copied!");
  }

  function addComment() {
    if (!commentText.trim()) return;

    const newComments = [commentText, ...comments];
    setComments(newComments);
    localStorage.setItem("comments", JSON.stringify(newComments));
    setCommentText("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#ff0033", fontSize: "38px" }}>
        🔥 Ray&apos;sStream
      </h1>

      <h2>{currentVideo.title}</h2>

      <video
        key={currentVideo.src}
        src={currentVideo.src}
        controls
        autoPlay
        loop
        playsInline
        style={{
          width: "100%",
          maxWidth: "900px",
          borderRadius: "12px",
          background: "black",
        }}
      />

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={likeVideo}>👍 Like {likes}</button>
        <button onClick={subscribe}>🔔 Subscribe {subscribers}</button>
        <button onClick={shareVideo}>🔗 Share</button>

        <a
          href="https://buy.stripe.com/fZu6oH08q6VV3Zw5TP2Nq02"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 16px",
            background: "#22c55e",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          💳 Payment Subscription
        </a>
      </div>

      <p style={{ marginTop: "12px", fontSize: "18px" }}>
        👀 Views: {views}
      </p>

      <h2 style={{ marginTop: "30px" }}>Video Library</h2>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {videos.map((video) => (
          <button
            key={video.src}
            onClick={() => setCurrentVideo(video)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: currentVideo.src === video.src ? "#ff0033" : "#222",
              color: "white",
              border: "1px solid #444",
            }}
          >
            ▶ {video.title}
          </button>
        ))}
      </div>

      <h2 style={{ marginTop: "30px" }}>Comments</h2>

      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a comment..."
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "80px",
          borderRadius: "8px",
          padding: "10px",
        }}
      />

      <br />

      <button onClick={addComment} style={{ marginTop: "10px" }}>
        Post Comment
      </button>

      <div style={{ marginTop: "20px" }}>
        {comments.map((comment, index) => (
          <p
            key={index}
            style={{
              background: "#1a1a1a",
              padding: "10px",
              borderRadius: "8px",
              maxWidth: "700px",
            }}
          >
            {comment}
          </p>
        ))}
      </div>
    </main>
  );
} 
