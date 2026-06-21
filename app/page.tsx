"use client";

import { useEffect, useState } from "react";

const videos = [
  {
    id: "video1",
    title: "Video 1",
    src: "/videos/video1.mp4",
  },
  {
    id: "video2",
    title: "Video 2",
    src: "/videos/video2.mp4",
  },
  {
    id: "video3",
    title: "Video 3",
    src: "/videos/video3.mp4",
  },
];

export default function Home() {
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [subs, setSubs] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    setLikes(Number(localStorage.getItem("rs_likes") || "0"));
    setViews(Number(localStorage.getItem("rs_views") || "0"));
    setSubs(Number(localStorage.getItem("rs_subs") || "0"));
    setComments(JSON.parse(localStorage.getItem("rs_comments") || "[]"));
  }, []);

  function addView() {
    const next = views + 1;
    setViews(next);
    localStorage.setItem("rs_views", String(next));
  }

  function addLike() {
    const next = likes + 1;
    setLikes(next);
    localStorage.setItem("rs_likes", String(next));
  }

  function subscribe() {
    const next = subs + 1;
    setSubs(next);
    localStorage.setItem("rs_subs", String(next));
  }

  function postComment() {
    if (!commentText.trim()) return;

    const next = [commentText, ...comments];
    setComments(next);
    localStorage.setItem("rs_comments", JSON.stringify(next));
    setCommentText("");
  }

  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "red", fontSize: 42 }}>Ray&apos;sStream</h1>

      <button onClick={subscribe} style={redButton}>
        Subscribe
      </button>

      <p>Subscribers: {subs}</p>
      <p>Views: {views}</p>
      <p>Likes: {likes}</p>

      <button onClick={addLike} style={darkButton}>
        👍 Like
      </button>

      {videos.map((video) => (
        <section key={video.id} style={{ marginTop: 30 }}>
          <h2>{video.title}</h2>

          <video
            controls
            playsInline
            preload="auto"
            onPlay={addView}
            style={{
              width: "100%",
              maxWidth: 850,
              background: "black",
              borderRadius: 12,
            }}
          >
            <source src={video.src} type="video/mp4" />
            Video not supported.
          </video>

          <p style={{ color: "#aaa" }}>{video.src}</p>
        </section>
      ))}

      <section style={{ marginTop: 30, maxWidth: 850 }}>
        <h2>Comments</h2>

        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          style={{
            width: "100%",
            height: 100,
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
          }}
        />

        <br />

        <button onClick={postComment} style={redButton}>
          Post Comment
        </button>

        {comments.map((comment, index) => (
          <p key={index} style={{ background: "#222", padding: 12, borderRadius: 8 }}>
            {comment}
          </p>
        ))}
      </section>
    </main>
  );
}

const redButton = {
  background: "red",
  color: "white",
  padding: "12px 18px",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
  marginRight: 10,
};

const darkButton = {
  background: "#222",
  color: "white",
  padding: "12px 18px",
  border: "1px solid white",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
}; 
