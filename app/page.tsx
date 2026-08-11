"use client";

import { useEffect, useState } from "react";

type Video = {
  id: number;
  title: string;
  src: string;
};

const videos: Video[] = [
  {
    id: 1,
    title: "Ray'sStream Video 1",
    src: "/videos/video1.mp4",
  },
  {
    id: 2,
    title: "Ray'sStream Video 2",
    src: "/videos/video2.mp4",
  },
  {
    id: 3,
    title: "Ray'sStream Video 3",
    src: "/videos/video3.mp4",
  },
];

export default function Home() {
  const [likes, setLikes] = useState<number[]>([0, 0, 0]);
  const [views, setViews] = useState<number[]>([0, 0, 0]);
  const [subscribers, setSubscribers] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  const [comments, setComments] = useState<string[][]>([
    [],
    [],
    [],
  ]);

  const [commentInputs, setCommentInputs] = useState<string[]>([
    "",
    "",
    "",
  ]);

  useEffect(() => {
    const savedLikes = localStorage.getItem("raysstream-likes");
    const savedViews = localStorage.getItem("raysstream-views");
    const savedSubscribers = localStorage.getItem(
      "raysstream-subscribers"
    );
    const savedSubscribed = localStorage.getItem(
      "raysstream-subscribed"
    );
    const savedComments = localStorage.getItem(
      "raysstream-comments"
    );

    if (savedLikes) {
      setLikes(JSON.parse(savedLikes));
    }

    if (savedViews) {
      setViews(JSON.parse(savedViews));
    }

    if (savedSubscribers) {
      setSubscribers(Number(savedSubscribers));
    }

    if (savedSubscribed === "true") {
      setSubscribed(true);
    }

    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  function addView(index: number) {
    setViews((oldViews) => {
      const next = [...oldViews];
      next[index] = (next[index] || 0) + 1;

      localStorage.setItem(
        "raysstream-views",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function likeVideo(index: number) {
    setLikes((oldLikes) => {
      const next = [...oldLikes];
      next[index] = (next[index] || 0) + 1;

      localStorage.setItem(
        "raysstream-likes",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function subscribe() {
    if (subscribed) {
      setSubscribed(false);

      const newCount = Math.max(0, subscribers - 1);

      setSubscribers(newCount);

      localStorage.setItem(
        "raysstream-subscribers",
        String(newCount)
      );

      localStorage.setItem(
        "raysstream-subscribed",
        "false"
      );
    } else {
      setSubscribed(true);

      const newCount = subscribers + 1;

      setSubscribers(newCount);

      localStorage.setItem(
        "raysstream-subscribers",
        String(newCount)
      );

      localStorage.setItem(
        "raysstream-subscribed",
        "true"
      );
    }
  }

  function updateComment(index: number, value: string) {
    setCommentInputs((oldInputs) => {
      const next = [...oldInputs];
      next[index] = value;
      return next;
    });
  }

  function postComment(index: number) {
    const text = commentInputs[index]?.trim();

    if (!text) return;

    setComments((oldComments) => {
      const next = oldComments.map((videoComments) => [
        ...videoComments,
      ]);

      next[index].push(text);

      localStorage.setItem(
        "raysstream-comments",
        JSON.stringify(next)
      );

      return next;
    });

    setCommentInputs((oldInputs) => {
      const next = [...oldInputs];
      next[index] = "";
      return next;
    });
  }

  async function shareVideo(video: Video) {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch ${video.title} on Ray'sStream`,
          url,
        });

        return;
      } catch {}
    }

    await navigator.clipboard.writeText(url);

    alert("Ray'sStream link copied!");
  }

  function shareFacebook() {
    const url = encodeURIComponent(window.location.href);

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  }

  function shareX(video: Video) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Watch ${video.title} on Ray'sStream`
    );

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  }

  async function copyForTikTokInstagram() {
    await navigator.clipboard.writeText(
      window.location.href
    );

    alert(
      "Ray'sStream link copied. Paste it into TikTok or Instagram."
    );
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
      {/* HEADER */}

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#0d0d0d",
          borderBottom: "1px solid #333",
          padding: "16px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "30px",
          }}
        >
          🔥 Ray&apos;sStream
        </h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <strong>
            {subscribers.toLocaleString()} subscribers
          </strong>

          <button
            onClick={subscribe}
            style={{
              border: "none",
              borderRadius: "25px",
              padding: "12px 22px",
              fontWeight: "bold",
              cursor: "pointer",
              background: subscribed ? "#444" : "#ff0000",
              color: "white",
            }}
          >
            {subscribed ? "Subscribed ✓" : "Subscribe"}
          </button>

          <a
            href="https://buy.stripe.com/fZu6oH08q6VV3Zw5TP2Nq02"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#635bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "25px",
              padding: "12px 22px",
              fontWeight: "bold",
            }}
          >
            💳 Paid Subscription
          </a>
        </div>
      </header>

      {/* TITLE */}

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

      {/* VIDEOS */}

      <section
        style={{
          width: "min(1000px, 94%)",
          margin: "auto",
          paddingBottom: "60px",
        }}
      >
        {videos.map((video, index) => (
          <article
            key={video.id}
            style={{
              background: "#121212",
              marginTop: "28px",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "0 4px 20px rgba(0,0,0,.4)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{video.title}</h2>

            <video
              src={video.src}
              controls
              loop
              playsInline
              preload="metadata"
              onPlay={() => addView(index)}
              style={{
                width: "100%",
                background: "black",
                borderRadius: "14px",
                maxHeight: "600px",
              }}
            />

            {/* STATS */}

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                marginTop: "14px",
                color: "#ccc",
              }}
            >
              <span>
                👁 {views[index]?.toLocaleString() || 0} views
              </span>

              <span>
                👍 {likes[index]?.toLocaleString() || 0} likes
              </span>

              <span>
                💬 {comments[index]?.length || 0} comments
              </span>
            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "9px",
                marginTop: "16px",
              }}
            >
              <button
                onClick={() => likeVideo(index)}
                style={buttonStyle}
              >
                👍 Like
              </button>

              <button
                onClick={() => shareVideo(video)}
                style={buttonStyle}
              >
                📤 Share
              </button>

              <button
                onClick={shareFacebook}
                style={buttonStyle}
              >
                Facebook
              </button>

              <button
                onClick={() => shareX(video)}
                style={buttonStyle}
              >
                X
              </button>

              <button
                onClick={copyForTikTokInstagram}
                style={buttonStyle}
              >
                TikTok
              </button>

              <button
                onClick={copyForTikTokInstagram}
                style={buttonStyle}
              >
                Instagram
              </button>
            </div>

            {/* COMMENTS */}

            <div style={{ marginTop: "24px" }}>
              <h3>Comments</h3>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <input
                  value={commentInputs[index] || ""}
                  onChange={(event) =>
                    updateComment(
                      index,
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      postComment(index);
                    }
                  }}
                  placeholder="Add a comment..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #444",
                    background: "#1c1c1c",
                    color: "white",
                  }}
                />

                <button
                  onClick={() => postComment(index)}
                  style={buttonStyle}
                >
                  Post
                </button>
              </div>

              <div style={{ marginTop: "15px" }}>
                {comments[index]?.length === 0 ? (
                  <p style={{ color: "#777" }}>
                    No comments yet.
                  </p>
                ) : (
                  comments[index]?.map(
                    (comment, commentIndex) => (
                      <div
                        key={commentIndex}
                        style={{
                          background: "#1b1b1b",
                          marginBottom: "8px",
                          padding: "12px",
                          borderRadius: "10px",
                        }}
                      >
                        <strong>Ray&apos;sStream User</strong>

                        <div
                          style={{
                            marginTop: "5px",
                            color: "#ddd",
                          }}
                        >
                          {comment}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer
        style={{
          padding: "30px",
          textAlign: "center",
          borderTop: "1px solid #222",
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
  border: "none",
  padding: "10px 16px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
}; 
