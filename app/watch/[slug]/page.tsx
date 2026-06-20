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
  const params = useParams();
  const slug = String(params.slug);

  const video = videos.find((v) => v.slug === slug) || videos[0];

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [views, setViews] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const savedComments = localStorage.getItem(`comments-${video.title}`);
    const savedLikes = localStorage.getItem(`likes-${video.title}`);
    const savedLiked = localStorage.getItem(`liked-${video.title}`);
    const savedViews = localStorage.getItem(`views-${video.title}`);
    const savedSubscribers = localStorage.getItem("raysstream-subscribers");
    const savedSubscribed = localStorage.getItem("raysstream-subscribed");

    setComments(savedComments ? JSON.parse(savedComments) : []);
    setLikes(savedLikes ? Number(savedLikes) : 0);
    setLiked(savedLiked === "true");
    setSubscribers(savedSubscribers ? Number(savedSubscribers) : 0);
    setSubscribed(savedSubscribed === "true");

    const newViews = savedViews ? Number(savedViews) + 1 : 1;
    setViews(newViews);
    localStorage.setItem(`views-${video.title}`, String(newViews));
  }, [video.title]);

  function addComment() {
    if (!comment.trim()) return;
    const updated = [comment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments-${video.title}`, JSON.stringify(updated));
    setComment("");
  }

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
    const newCount = newSubscribed ? subscribers + 1 : Math.max(0, subscribers - 1);
    setSubscribed(newSubscribed);
    setSubscribers(newCount);
    localStorage.setItem("raysstream-subscribed", String(newSubscribed));
    localStorage.setItem("raysstream-subscribers", String(newCount));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1>{video.title}</h1>

      <p style={{ color: "#9ca3af" }}>👀 {views} views</p>

      <video
        src={video.src}
        controls
        playsInline
        preload="auto"
        style={{ width: "100%", maxWidth: "1000px", background: "black", borderRadius: 12 }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}>
        <button onClick={toggleLike}>👍 {liked ? "Liked" : "Like"} ({likes})</button>
        <button onClick={toggleSubscribe}>
          {subscribed ? "Subscribed" : "Subscribe"} ({subscribers})
        </button>
      </div>

      <section style={{ marginTop: 30, background: "#1f2937", padding: 20, borderRadius: 12 }}>
        <h2>Comments</h2>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 8 }}
        />

        <br />

        <button onClick={addComment} style={{ marginTop: 10 }}>
          Post Comment
        </button>

        {comments.map((c, i) => (
          <div key={i} style={{ marginTop: 10, background: "#111827", padding: 12 }}>
            {c}
          </div>
        ))}
      </section>

      <div style={{ marginTop: 20 }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 

