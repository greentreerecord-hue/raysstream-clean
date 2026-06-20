"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const videos = [
  { slug: "itscool", title: "It's Cool", src: "/videos/itscool.mp4" },
  { slug: "video2", title: "Video 2", src: "/videos/video2.mp4" },
  { slug: "spaceship", title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function WatchPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "itscool";

  const video = videos.find((v) => v.slug === slug) || videos[0];

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const [subscribers, setSubscribers] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    setLikes(Number(localStorage.getItem(`likes-${video.title}`) || 0));
    setLiked(localStorage.getItem(`liked-${video.title}`) === "true");

    setSubscribers(
      Number(localStorage.getItem("raysstream-subscribers") || 0)
    );

    setSubscribed(
      localStorage.getItem("raysstream-subscribed") === "true"
    );

    const savedComments = localStorage.getItem(`comments-${video.title}`);
    setComments(savedComments ? JSON.parse(savedComments) : []);
  }, [video.title]);

  function toggleLike() {
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);

    setLiked(newLiked);
    setLikes(newLikes);

    localStorage.setItem(`liked-${video.title}`, String(newLiked));
    localStorage.setItem(`likes-${video.title}`, String(newLikes));
  }

  function toggleSubscribe() {
    const newSubscribed = !subscribed;

    const newSubscribers = newSubscribed
      ? subscribers + 1
      : Math.max(0, subscribers - 1);

    setSubscribed(newSubscribed);
    setSubscribers(newSubscribers);

    localStorage.setItem(
      "raysstream-subscribed",
      String(newSubscribed)
    );

    localStorage.setItem(
      "raysstream-subscribers",
      String(newSubscribers)
    );
  }

  function addComment() {
    if (!comment.trim()) return;

    const updated = [comment, ...comments];

    setComments(updated);

    localStorage.setItem(
      `comments-${video.title}`,
      JSON.stringify(updated)
    );

    setComment("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: 20,
      }}
    >
      <h1>{video.title}</h1>

      <video
        src={video.src}
        controls
        playsInline
        preload="auto"
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: 12,
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 15,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={toggleLike}
          style={{
            padding: "12px 20px",
            background: liked ? "#ef4444" : "#374151",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          👍 {liked ? "Liked" : "Like"} ({likes})
        </button>

        <button
          onClick={toggleSubscribe}
          style={{
            padding: "12px 20px",
            background: subscribed ? "#16a34a" : "#dc2626",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          {subscribed ? "Subscribed" : "Subscribe"} ({subscribers})
        </button>
      </div>

      <section
        style={{
          marginTop: 30,
          background: "#1f2937",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h2>Comments</h2>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 12,
            borderRadius: 8,
          }}
        />

        <button
          onClick={addComment}
          style={{
            marginTop: 10,
            padding: "10px 18px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          Post Comment
        </button>

        <div style={{ marginTop: 20 }}>
          {comments.map((c, i) => (
            <div
              key={i}
              style={{
                background: "#111827",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
