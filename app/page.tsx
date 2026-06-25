"use client";

import { useEffect, useState } from "react";

const videos = [
  { id: "video1", title: "It's Cool", src: "/videos/video1.mp4" },
  { id: "video2", title: "Video 2", src: "/videos/video2.mp4" },
  { id: "video3", title: "Spaceship", src: "/videos/video3.mp4" },
];

export default function Home() {
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [views, setViews] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [subscribers, setSubscribers] = useState(0);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  useEffect(() => {
    setLikes(JSON.parse(localStorage.getItem("likes") || "{}"));
    setViews(JSON.parse(localStorage.getItem("views") || "{}"));
    setComments(JSON.parse(localStorage.getItem("comments") || "{}"));
    setSubscribers(Number(localStorage.getItem("subscribers") || "0"));
  }, []);

  function save(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function addView(id: string) {
    setViews((old) => {
      const next = { ...old, [id]: (old[id] || 0) + 1 };
      save("views", next);
      return next;
    });
  }

  function addLike(id: string) {
    setLikes((old) => {
      const next = { ...old, [id]: (old[id] || 0) + 1 };
      save("likes", next);
      return next;
    });
  }

  function addComment(id: string) {
    const text = commentText[id]?.trim();
    if (!text) return;

    setComments((old) => {
      const next = { ...old, [id]: [...(old[id] || []), text] };
      save("comments", next);
      return next;
    });

    setCommentText((old) => ({ ...old, [id]: "" }));
  }

  function subscribe() {
    const next = subscribers + 1;
    setSubscribers(next);
    localStorage.setItem("subscribers", String(next));
  }

  function share(platform: string, title: string) {
    const url = window.location.href;
    const text = `Watch ${title} on Ray'sStream`;

    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    }

    if (platform === "tiktok") {
      window.open("https://www.tiktok.com/upload");
    }

    if (platform === "instagram") {
      alert("Instagram does not allow direct web sharing. Copy the link and post it to Instagram.");
      navigator.clipboard.writeText(url);
    }

    if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    }
  }

  return (
    <main style={{ padding: 30, background: "#111", color: "white", minHeight: "100vh" }}>
      <h1>🔥 Ray&apos;sStream</h1>

      <button onClick={subscribe} style={buttonStyle}>
        Subscribe
      </button>

      <h2>Subscribers: {subscribers}</h2>

      {videos.map((video) => (
        <section key={video.id} style={{ marginBottom: 50 }}>
          <h2>{video.title}</h2>

          <video
            src={video.src}
            controls
            loop
            playsInline
            onPlay={() => addView(video.id)}
            style={{ width: "100%", maxWidth: 800, background: "black" }}
          />

          <p>Views: {views[video.id] || 0}</p>
          <p>Likes: {likes[video.id] || 0}</p>

          <button onClick={() => addLike(video.id)} style={buttonStyle}>
            Like
          </button>

          <button onClick={() => share("facebook", video.title)} style={buttonStyle}>
            Facebook
          </button>

          <button onClick={() => share("instagram", video.title)} style={buttonStyle}>
            Instagram
          </button>

          <button onClick={() => share("tiktok", video.title)} style={buttonStyle}>
            TikTok
          </button>

          <button onClick={() => share("x", video.title)} style={buttonStyle}>
            X
          </button>

          <div style={{ marginTop: 20 }}>
            <input
              value={commentText[video.id] || ""}
              onChange={(e) =>
                setCommentText((old) => ({ ...old, [video.id]: e.target.value }))
              }
              placeholder="Write a comment"
              style={{ padding: 10, width: "70%" }}
            />

            <button onClick={() => addComment(video.id)} style={buttonStyle}>
              Comment
            </button>

            {(comments[video.id] || []).map((comment, index) => (
              <p key={index} style={{ background: "#222", padding: 10 }}>
                {comment}
              </p>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

const buttonStyle = {
  margin: 6,
  padding: "10px 14px",
  background: "red",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer",
} as const; 

} 
