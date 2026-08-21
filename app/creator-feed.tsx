"use client";

import { useEffect, useMemo, useState } from "react";

type CreatorVideo = {
  id: string | number;
  title: string;
  url: string;
  creator_email?: string;
  created_at?: string;
};

const regularVideos = [
  {
    id: 1,
    title: "Ray'sStream Video 1",
    watchUrl: "/watch/video-1",
  },
  {
    id: 2,
    title: "Ray'sStream Video 2",
    watchUrl: "/watch/video-2",
  },
  {
    id: 3,
    title: "Ray'sStream Video 3",
    watchUrl: "/watch/video-3",
  },
];

export default function CreatorFeed() {
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
          (
            video: CreatorVideo & {
              blob_url?: string;
            }
          ) => ({
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

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const matchingRegularVideos = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return regularVideos.filter((video) =>
      video.title.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  const matchingCreatorVideos = useMemo(() => {
    if (!normalizedSearch) {
      return videos;
    }

    return videos.filter((video) => {
      const title = String(video.title || "").toLowerCase();
      const creator = String(
        video.creator_email || ""
      ).toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        creator.includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, videos]);

  const hasSearchResults =
    matchingRegularVideos.length > 0 ||
    matchingCreatorVideos.length > 0;

  function getWatchUrl(video: CreatorVideo) {
    return `${window.location.origin}/watch/creator/${video.id}`;
  }

  function getChannelUrl(video: CreatorVideo) {
    return `/creator/channel/${encodeURIComponent(
      video.creator_email || ""
    )}`;
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

    const shareData = {
      title: video.title,
      text: `Watch ${video.title} on Ray'sStream`,
      url: watchUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        return;
      }
    }

    await copyVideoLink(video);
  }

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Search Ray&apos;sStream</h2>

        <p style={subtitleStyle}>
          Find Ray&apos;sStream videos and creator uploads
        </p>

        <div style={searchBoxStyle}>
          <span style={searchIconStyle}>🔎</span>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search videos or creators..."
            aria-label="Search videos"
            style={searchInputStyle}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={clearButtonStyle}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {normalizedSearch &&
        matchingRegularVideos.length > 0 && (
          <div style={searchResultsStyle}>
            <h3 style={resultHeadingStyle}>
              Ray&apos;sStream Videos
            </h3>

            {matchingRegularVideos.map((video) => (
              <a
                key={video.id}
                href={video.watchUrl}
                style={resultLinkStyle}
              >
                ▶ {video.title}
              </a>
            ))}
          </div>
        )}

      {normalizedSearch &&
        !hasSearchResults &&
        !loading && (
          <p style={messageStyle}>
            No videos matched “{searchQuery}”.
          </p>
        )}

      <div style={creatorHeaderStyle}>
        <h2 style={creatorHeadingStyle}>
          Creator Video Feed
        </h2>

        <p style={subtitleStyle}>
          New videos uploaded by Ray&apos;sStream creators
        </p>
      </div>

      {loading && (
        <p style={messageStyle}>
          Loading creator videos...
        </p>
      )}

      {message && <p style={messageStyle}>{message}</p>}

      {!loading &&
        !message &&
        videos.length === 0 && (
          <p style={messageStyle}>
            No creator videos have been uploaded yet.
          </p>
        )}

      {!loading &&
        normalizedSearch &&
        matchingCreatorVideos.length === 0 &&
        matchingRegularVideos.length > 0 && (
          <p style={messageStyle}>
            No creator uploads matched this search.
          </p>
        )}

      <div style={feedStyle}>
        {matchingCreatorVideos.map((video) => (
          <article key={video.id} style={cardStyle}>
            <h3 style={titleStyle}>{video.title}</h3>

            {video.creator_email && (
              <a
                href={getChannelUrl(video)}
                style={creatorLinkStyle}
              >
                Creator: {video.creator_email}
              </a>
            )}

            <video
              src={video.url}
              controls
              preload="metadata"
              playsInline
              style={videoStyle}
            />

            <div style={buttonRowStyle}>
              <a
                href={`/watch/creator/${video.id}`}
                style={watchButtonStyle}
              >
                Watch Page
              </a>

              {video.creator_email && (
                <a
                  href={getChannelUrl(video)}
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

const sectionStyle = {
  width: "min(1000px, 94%)",
  margin: "0 auto 50px",
  paddingTop: "35px",
};

const headerStyle = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const headingStyle = {
  color: "white",
  fontSize: "clamp(30px, 5vw, 48px)",
  margin: "0 0 12px",
};

const creatorHeaderStyle = {
  textAlign: "center" as const,
  margin: "40px 0 30px",
};

const creatorHeadingStyle = {
  color: "white",
  fontSize: "clamp(28px, 4vw, 42px)",
  margin: "0 0 12px",
};

const subtitleStyle = {
  color: "#dddddd",
  fontSize: "18px",
  margin: 0,
};

const searchBoxStyle = {
  width: "min(700px, 100%)",
  margin: "24px auto 0",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  background: "#ffffff",
  border: "3px solid black",
  borderRadius: "28px",
  boxSizing: "border-box" as const,
};

const searchIconStyle = {
  fontSize: "20px",
};

const searchInputStyle = {
  flex: 1,
  minWidth: 0,
  padding: "8px",
  background: "transparent",
  color: "#111111",
  border: "none",
  outline: "none",
  fontSize: "17px",
};

const clearButtonStyle = {
  padding: "8px 14px",
  background: "#222222",
  color: "white",
  border: "2px solid black",
  borderRadius: "18px",
  cursor: "pointer",
  fontWeight: "bold",
};

const searchResultsStyle = {
  background: "#171717",
  border: "2px solid black",
  borderRadius: "16px",
  padding: "18px",
  marginBottom: "25px",
};

const resultHeadingStyle = {
  color: "white",
  marginTop: 0,
};

const resultLinkStyle = {
  display: "block",
  color: "white",
  background: "#292929",
  border: "2px solid black",
  borderRadius: "10px",
  padding: "12px",
  marginTop: "8px",
  textDecoration: "none",
  fontWeight: "bold",
};

const messageStyle = {
  color: "white",
  textAlign: "center" as const,
  fontSize: "18px",
  padding: "25px",
};

const feedStyle = {
  display: "grid",
  gap: "30px",
};

const cardStyle = {
  overflow: "hidden",
  background: "#242424",
  border: "2px solid black",
  borderRadius: "20px",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
};

const titleStyle = {
  color: "white",
  fontSize: "25px",
  padding: "18px 20px 8px",
  margin: 0,
};

const creatorLinkStyle = {
  display: "inline-block",
  color: "#86efac",
  padding: "0 20px 14px",
  textDecoration: "none",
  fontWeight: "bold",
};

const videoStyle = {
  display: "block",
  width: "100%",
  maxHeight: "600px",
  background: "black",
};

const buttonRowStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "center",
  gap: "12px",
  padding: "16px",
};

const watchButtonStyle = {
  display: "inline-block",
  padding: "11px 22px",
  background: "#222222",
  color: "white",
  border: "2px solid black",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
  textDecoration: "none",
};

const channelButtonStyle = {
  display: "inline-block",
  padding: "11px 22px",
  background: "#22c55e",
  color: "black",
  border: "2px solid black",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
  textDecoration: "none",
};

const shareButtonStyle = {
  padding: "11px 22px",
  background: "#222222",
  color: "white",
  border: "2px solid black",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
}; 
