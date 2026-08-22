"use client";

import { useEffect, useMemo, useState } from "react";

type CreatorVideo = {
  id: string | number;
  title: string;
  description?: string;
  url: string;
  blob_url?: string;
  pathname?: string;
  thumbnailUrl?: string;
  channelId?: string;
  createdAt?: string;
};

const raysStreamVideos = [
  {
    id: 1,
    slug: "video-1",
    title: "Ray'sStream Video 1",
  },
  {
    id: 2,
    slug: "video-2",
    title: "Ray'sStream Video 2",
  },
  {
    id: 3,
    slug: "video-3",
    title: "Ray'sStream Video 3",
  },
];

export default function CreatorFeed() {
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadVideos() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load creator videos."
          );
        }

        const videoList = Array.isArray(data)
          ? data
          : data.videos || [];

        const normalizedVideos = videoList.map(
          (video: CreatorVideo) => ({
            ...video,
            url: video.url || video.blob_url || "",
          })
        );

        setVideos(normalizedVideos);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load creator videos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  const searchText = search.trim().toLowerCase();

  const matchingRayVideos = useMemo(() => {
    if (!searchText) {
      return raysStreamVideos;
    }

    return raysStreamVideos.filter((video) =>
      video.title.toLowerCase().includes(searchText)
    );
  }, [searchText]);

  const matchingCreatorVideos = useMemo(() => {
    if (!searchText) {
      return videos;
    }

    return videos.filter((video) => {
      const title = String(video.title || "").toLowerCase();
      const description = String(
        video.description || ""
      ).toLowerCase();

      return (
        title.includes(searchText) ||
        description.includes(searchText)
      );
    });
  }, [searchText, videos]);

  function getWatchUrl(video: CreatorVideo) {
    return (
      `${window.location.origin}/watch/creator/${video.id}`
    );
  }

  async function copyVideoLink(video: CreatorVideo) {
    const watchUrl = getWatchUrl(video);

    try {
      await navigator.clipboard.writeText(watchUrl);
      alert("Ray'sStream watch link copied!");
    } catch {
      window.prompt(
        "Copy this Ray'sStream watch link:",
        watchUrl
      );
    }
  }

  async function shareVideo(video: CreatorVideo) {
    const watchUrl = getWatchUrl(video);

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch ${video.title} on Ray'sStream`,
          url: watchUrl,
        });

        return;
      } catch {
        // Sharing may have been cancelled.
      }
    }

    await copyVideoLink(video);
  }

  return (
    <section style={sectionStyle}>
      <div style={searchHeaderStyle}>
        <h2 style={searchHeadingStyle}>
          Search Ray&apos;sStream
        </h2>

        <p style={subtitleStyle}>
          Find Ray&apos;sStream videos and creator uploads
        </p>

        <div style={searchBoxStyle}>
          <span style={searchIconStyle}>🔎</span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search videos..."
            style={searchInputStyle}
          />
        </div>
      </div>

      <div style={rayResultsStyle}>
        <h3 style={resultsHeadingStyle}>
          Ray&apos;sStream Videos
        </h3>

        {matchingRayVideos.length === 0 && (
          <p style={emptyStyle}>
            No Ray&apos;sStream videos matched this search.
          </p>
        )}

        {matchingRayVideos.map((video) => (
          <a
            key={video.id}
            href={`/watch/${video.slug}`}
            style={resultLinkStyle}
          >
            ▶ {video.title}
          </a>
        ))}
      </div>

      <div style={headerStyle}>
        <h2 style={headingStyle}>Creator Video Feed</h2>

        <p style={subtitleStyle}>
          New videos uploaded by Ray&apos;sStream creators
        </p>
      </div>

      {loading && (
        <p style={messageStyle}>
          Loading creator videos...
        </p>
      )}

      {message && (
        <p style={messageStyle}>{message}</p>
      )}

      {!loading &&
        !message &&
        matchingCreatorVideos.length === 0 && (
          <p style={messageStyle}>
            {searchText
              ? "No creator uploads matched this search."
              : "No creator videos have been uploaded yet."}
          </p>
        )}

      <div style={feedStyle}>
        {matchingCreatorVideos.map((video) => (
          <article key={video.id} style={cardStyle}>
            <h3 style={titleStyle}>{video.title}</h3>

            <video
              src={video.url}
              poster={video.thumbnailUrl || undefined}
              controls
              preload="metadata"
              playsInline
              style={videoStyle}
            />

            {video.description && (
              <p style={descriptionStyle}>
                {video.description}
              </p>
            )}

            <div style={buttonRowStyle}>
              <a
                href={`/watch/creator/${video.id}`}
                style={watchButtonStyle}
              >
                Watch Page
              </a>

              {video.channelId && (
                <a
                  href={`/creator/channel/${video.channelId}`}
                  style={channelButtonStyle}
                >
                  Creator Channel
                </a>
              )}

              <button
                type="button"
                onClick={() => shareVideo(video)}
                style={shareButtonStyle}
              >
                Share
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  width: "min(1000px, 94%)",
  margin: "0 auto 50px",
  paddingTop: "35px",
};

const searchHeaderStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "25px",
};

const searchHeadingStyle: React.CSSProperties = {
  color: "white",
  fontSize: "clamp(38px, 7vw, 62px)",
  margin: "0 0 12px",
};

const searchBoxStyle: React.CSSProperties = {
  width: "min(700px, 100%)",
  margin: "25px auto",
  display: "flex",
  alignItems: "center",
  background: "white",
  border: "3px solid black",
  borderRadius: "35px",
  padding: "5px 18px",
  boxSizing: "border-box",
};

const searchIconStyle: React.CSSProperties = {
  fontSize: "27px",
  marginRight: "10px",
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "15px 5px",
  background: "transparent",
  color: "black",
  border: "none",
  outline: "none",
  fontSize: "21px",
};

const rayResultsStyle: React.CSSProperties = {
  marginBottom: "55px",
  padding: "20px",
  background: "#242424",
  border: "2px solid black",
  borderRadius: "18px",
};

const resultsHeadingStyle: React.CSSProperties = {
  color: "white",
  fontSize: "25px",
  margin: "0 0 16px",
};

const resultLinkStyle: React.CSSProperties = {
  display: "block",
  marginTop: "9px",
  padding: "14px",
  background: "#303030",
  color: "white",
  border: "2px solid black",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: "bold",
};

const emptyStyle: React.CSSProperties = {
  color: "#d1d5db",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "30px",
};

const headingStyle: React.CSSProperties = {
  color: "white",
  fontSize: "clamp(30px, 5vw, 48px)",
  margin: "0 0 12px",
};

const subtitleStyle: React.CSSProperties = {
  color: "#dddddd",
  fontSize: "18px",
  margin: 0,
};

const messageStyle: React.CSSProperties = {
  color: "white",
  textAlign: "center",
  fontSize: "18px",
  padding: "25px",
};

const feedStyle: React.CSSProperties = {
  display: "grid",
  gap: "30px",
};

const cardStyle: React.CSSProperties = {
  overflow: "hidden",
  background: "#242424",
  border: "2px solid black",
  borderRadius: "20px",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
};

const titleStyle: React.CSSProperties = {
  color: "white",
  fontSize: "25px",
  padding: "18px 20px",
  margin: 0,
};

const videoStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxHeight: "600px",
  background: "black",
};

const descriptionStyle: React.CSSProperties = {
  color: "#e5e5e5",
  fontSize: "17px",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  margin: 0,
  padding: "18px 20px 4px",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "12px",
  padding: "16px",
};

const watchButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "11px 22px",
  background: "#222",
  color: "white",
  border: "2px solid black",
  borderRadius: "20px",
  fontWeight: "bold",
  textDecoration: "none",
};

const channelButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "11px 22px",
  background: "#22c55e",
  color: "black",
  border: "2px solid black",
  borderRadius: "20px",
  fontWeight: "bold",
  textDecoration: "none",
};

const shareButtonStyle: React.CSSProperties = {
  padding: "11px 22px",
  background: "#222",
  color: "white",
  border: "2px solid black",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
}; 
