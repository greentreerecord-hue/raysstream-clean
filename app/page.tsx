"use client";

import { useEffect, useState } from "react";

type Counts = Record<string, number>;
type Comments = Record<string, string[]>;

const videos = [
  { id: "video1", title: "It's Cool", src: "/videos/video1.mp4" },
  { id: "video2", title: "Video 2", src: "/videos/video2.mp4" },
  { id: "video3", title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function Home() {
  const [likes, setLikes] = useState<Counts>({});
  const [views, setViews] = useState<Counts>({});
  const [comments, setComments] = useState<Comments>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [subscribers, setSubscribers] = useState(0);

  useEffect(() => {
    setLikes(JSON.parse(localStorage.getItem("rs_likes") || "{}"));
    setViews(JSON.parse(localStorage.getItem("rs_views") || "{}"));
    setComments(JSON.parse(localStorage.getItem("rs_comments") || "{}"));
    setSubscribers(Number(localStorage.getItem("rs_subscribers") || "0"));
  }, []);

  function likeVideo(id: string) {
    const next = { ...likes, [id]: (likes[id] || 0) + 1 };
    setLikes(next);
    localStorage.setItem("rs_likes", JSON.stringify(next));
  }

  function countView(id: string) {
    const next = { ...views, [id]: (views[id] || 0) + 1 };
    setViews(next);
    localStorage.setItem("rs_views", JSON.stringify(next));
  }

  function addComment(id: string) {
    const text = (commentText[id] || "").trim();
    if (!text) return;

    const next = {
      ...comments,
      [id]: [...(comments[id] || []), text],
    };

    setComments(next);
    localStorage.setItem("rs_comments", JSON.stringify(next));
    setCommentText({ ...commentText, [id]: "" });
  }

  function subscribe() {
    const next = subscribers + 1;
    setSubscribers(next);
    localStorage.setItem("rs_subscribers", String(next));
  }

  function share(platform: string, title: string) {
    const url = window.location.href;
    const text = `Watch ${title} on Ray'sStream`;

    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    }

    if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    }

    if (platform === "tiktok") {
      window.open("https://www.tiktok.com/upload", "_blank");
    }

    if (platform === "instagram") {
      navigator.clipboard.writeText(url);
      alert("Link copied. Paste it into Instagram.");
    }
  }

  return (
    <main style={{ background: "#111", color: "white", minHeight: "100vh", padding: 24 }}>
      <h1>🔥 Ray&apos;sStream</h1>

      <button onClick={subscribe} style={button}>
        Subscribe
      </button>

      <h2>Subscribers: {subscribers}</h2>

      {videos.map((video) => (
        <section key={video.id} style={{ marginTop: 35, marginBottom: 55 }}>
          <h2>{video.title}</h2>

          <video
            src={video.src}
            controls
            loop
            playsInline
            onPlay={() => countView(video.id)}
            style={{ width: "100%", maxWidth: 850, background: "black" }}
          />

          <p>Views: {views[video.id] || 0}</p>
          <p>Likes: {likes[video.id] || 0}</p>

          <button onClick={() => likeVideo(video.id)} style={button}>Like</button>
          <button onClick={() => share("facebook", video.title)} style={button}>Facebook</button>
          <button onClick={() => share("instagram", video.title)} style={button}>Instagram</button>
          <button onClick={() => share("tiktok", video.title)} style={button}>TikTok</button>
          <button onClick={() => share("x", video.title)} style={button}>X</button>

          <div style={{ marginTop: 18 }}>
            <input
              value={commentText[video.id] || ""}
              onChange={(e) =>
                setCommentText({ ...commentText, [video.id]: e.target.value })
              }
              placeholder="Write a comment"
              style={{ padding: 12, width: "70%", maxWidth: 500 }}
            />

            <button onClick={() => addComment(video.id)} style={button}>
              Comment
            </button>

            {(comments[video.id] || []).map((comment, index) => (
              <p key={index} style={{ background: "#222", padding: 12, borderRadius: 8 }}>
                {comment}
              </p>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

const button = {
  margin: 6,
  padding: "10px 14px",
  background: "red",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer",
} as const; 
