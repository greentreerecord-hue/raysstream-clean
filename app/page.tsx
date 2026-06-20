"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const videos = [
  {
    title: "It's Cool",
    slug: "its-cool",
    src: "/videos/itscool.mp4",
  },
  {
    title: "Video 2",
    slug: "video2",
    src: "/videos/video2.mp4",
  },
  {
    title: "Spaceship",
    slug: "video3",
    src: "/videos/video3.mp4",
  },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [views, setViews] = useState<Record<string, number>>({});
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadedViews: Record<string, number> = {};
    const loadedLikes: Record<string, number> = {};
    const loadedComments: Record<string, string[]> = {};

    videos.forEach((video) => {
      loadedViews[video.slug] = Number(localStorage.getItem(`views-${video.slug}`) || "0");
      loadedLikes[video.slug] = Number(localStorage.getItem(`likes-${video.slug}`) || "0");
      loadedComments[video.slug] = JSON.parse(localStorage.getItem(`comments-${video.slug}`) || "[]");
    });

    setViews(loadedViews);
    setLikes(loadedLikes);
    setComments(loadedComments);
  }, []);

  function addView(slug: string) {
    const newViews = (views[slug] || 0) + 1;
    setViews({ ...views, [slug]: newViews });
    localStorage.setItem(`views-${slug}`, String(newViews));
  }

  function addLike(slug: string) {
    const newLikes = (likes[slug] || 0) + 1;
    setLikes({ ...likes, [slug]: newLikes });
    localStorage.setItem(`likes-${slug}`, String(newLikes));
  }

  function addComment(slug: string) {
    const text = commentText[slug];
    if (!text || !text.trim()) return;

    const newComments = [text, ...(comments[slug] || [])];

    setComments({ ...comments, [slug]: newComments });
    setCommentText({ ...commentText, [slug]: "" });

    localStorage.setItem(`comments-${slug}`, JSON.stringify(newComments));
  }

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
      <h1 style={{ color: "#ff6a00", fontSize: 44 }}>🔥 Ray'sStream</h1>
      <p style={{ color: "#aaa" }}>Home Video Library</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search videos..."
        style={{
          width: "100%",
          maxWidth: 500,
          padding: 12,
          fontSize: 16,
          marginBottom: 24,
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {filteredVideos.map((video) => (
          <div key={video.slug} style={{ background: "#151515", padding: 16, borderRadius: 14 }}>
            <Link href={`/watch/${video.slug}`} onClick={() => addView(video.slug)}>
              <video
                src={video.src}
                muted
                playsInline
                preload="metadata"
                style={{ width: "100%", height: 180, objectFit: "cover", background: "black", borderRadius: 10 }}
              />
            </Link>

            <h2>{video.title}</h2>

            <p style={{ color: "#aaa" }}>{views[video.slug] || 0} views</p>

            <button onClick={() => addLike(video.slug)} style={{ padding: "8px 14px", marginRight: 8 }}>
              👍 Like {likes[video.slug] || 0}
            </button>

            <Link href={`/watch/${video.slug}`} style={{ color: "#00ffff" }} onClick={() => addView(video.slug)}>
              Watch Video
            </Link>

            <div style={{ marginTop: 16 }}>
              <textarea
                value={commentText[video.slug] || ""}
                onChange={(e) =>
                  setCommentText({ ...commentText, [video.slug]: e.target.value })
                }
                placeholder="Add a comment..."
                style={{ width: "100%", height: 70, padding: 8 }}
              />

              <button onClick={() => addComment(video.slug)} style={{ marginTop: 8, padding: "8px 14px" }}>
                Post Comment
              </button>

              {(comments[video.slug] || []).map((comment, index) => (
                <p key={index} style={{ background: "#222", padding: 10, borderRadius: 8 }}>
                  {comment}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 
