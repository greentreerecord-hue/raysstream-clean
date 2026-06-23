"use client";

import { useEffect, useState } from "react";

const STRIPE_LINK = "https://buy.stripe.com/fZu6oH08q6VV3Zw5TP2Nq02";

const videos = [
  { title: "It's Cool", file: "/videos/video1.mp4" },
  { title: "Video 2", file: "/videos/video2.mp4" },
  { title: "Video 3", file: "/videos/video3.mp4" },
];

export default function Home() {
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    const savedLikes = localStorage.getItem("raysstream_likes");
    const savedViews = localStorage.getItem("raysstream_views");
    const savedSubs = localStorage.getItem("raysstream_subscribers");
    const savedSubscribed = localStorage.getItem("raysstream_subscribed");
    const savedComments = localStorage.getItem("raysstream_comments");

    if (savedLikes) setLikes(Number(savedLikes));
    if (savedViews) setViews(Number(savedViews));
    if (savedSubs) setSubscribers(Number(savedSubs));
    if (savedSubscribed === "true") setSubscribed(true);

    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch {
        setComments([]);
      }
    }

    const newViews = savedViews ? Number(savedViews) + 1 : 1;
    setViews(newViews);
    localStorage.setItem("raysstream_views", String(newViews));
  }, []);

  function handleLike() {
    const newLikes = likes + 1;
    setLikes(newLikes);
    localStorage.setItem("raysstream_likes", String(newLikes));
  }

  function handleSubscribe() {
    if (subscribed) return;

    const newSubs = subscribers + 1;
    setSubscribers(newSubs);
    setSubscribed(true);

    localStorage.setItem("raysstream_subscribers", String(newSubs));
    localStorage.setItem("raysstream_subscribed", "true");
  }

  function handleComment() {
    if (!comment.trim()) return;

    const newComments = [comment.trim(), ...comments];

    setComments(newComments);
    setComment("");

    localStorage.setItem(
      "raysstream_comments",
      JSON.stringify(newComments)
    );
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    alert("Ray'sStream link copied");
  }

  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "red", fontSize: "42px" }}>
        Ray&apos;sStream
      </h1>

      <p>Watch videos, like, comment, subscribe, and support Ray&apos;sStream.</p>

      <a
        href={STRIPE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          background: "#16a34a",
          color: "white",
          padding: "14px 24px",
          borderRadius: "10px",
          fontWeight: "bold",
          textDecoration: "none",
          marginTop: "15px",
          marginBottom: "20px",
        }}
      >
        Pay Subscription
      </a>

      <div>
        <button
          onClick={handleSubscribe}
          style={{
            background: subscribed ? "#444" : "red",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>

        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
          Subscribers: {subscribers}
        </p>
      </div>

      <p style={{ fontSize: "18px" }}>Views: {views}</p>

      <button onClick={handleLike}>Like: {likes}</button>{" "}
      <button onClick={handleShare}>Share</button>

      <h2 style={{ marginTop: "30px" }}>Video Library</h2>

      {videos.map((video) => (
        <section key={video.file} style={{ marginTop: "25px" }}>
          <h3>{video.title}</h3>

          <video
            src={video.file}
            controls
            loop
            playsInline
            style={{
              width: "100%",
              maxWidth: "800px",
              borderRadius: "12px",
              background: "black",
            }}
          />
        </section>
      ))}

      <section style={{ marginTop: "35px" }}>
        <h2>Comments</h2>

        <p style={{ color: "#aaa" }}>
          Comments save on this device.
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          style={{
            width: "100%",
            maxWidth: "800px",
            height: "90px",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "16px",
          }}
        />

        <br />

        <button
          onClick={handleComment}
          style={{
            marginTop: "10px",
            background: "red",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Post Comment
        </button>

        {comments.map((item, index) => (
          <p
            key={index}
            style={{
              background: "#222",
              padding: "12px",
              borderRadius: "8px",
              maxWidth: "800px",
            }}
          >
            {item}
          </p>
        ))}
      </section>
    </main>
  );
} 
