"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type ShuffleVideo = {
  id: string;
  title: string;
  url: string;
  watchUrl: string;
  creatorName: string;
  thumbnailUrl?: string;
};

type FeedVideo = {
  id: string;
  title: string;
  url: string;
  creatorName?: string;
  thumbnailUrl?: string;
};

type LikeStatus = {
  count: number;
  liked: boolean;
};

const originals: ShuffleVideo[] = [
  {
    id: "original-1",
    title: "Ray'sStream Video 1",
    url: "/videos/video1.mp4",
    watchUrl: "/watch/video-1",
    creatorName: "Ray'sStream",
  },
  {
    id: "original-2",
    title: "Ray'sStream Video 2",
    url: "/videos/video2.mp4",
    watchUrl: "/watch/video-2",
    creatorName: "Ray'sStream",
  },
  {
    id: "original-3",
    title: "Ray'sStream Video 3",
    url: "/videos/video3.mp4",
    watchUrl: "/watch/video-3",
    creatorName: "Ray'sStream",
  },
];

function shuffled(items: ShuffleVideo[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export default function ShufflePlayer() {
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] =
    useState<ShuffleVideo | null>(null);
  const [message, setMessage] = useState("");

  const [viewCounts, setViewCounts] = useState<
    Record<string, number | null>
  >({});

  const [likeStatuses, setLikeStatuses] = useState<
    Record<string, LikeStatus | null>
  >({});

  const [likingId, setLikingId] = useState<
    string | null
  >(null);

  const library = useRef<ShuffleVideo[]>(originals);
  const queue = useRef<ShuffleVideo[]>([]);
  const currentId = useRef("");
  const failed = useRef(new Set<string>());
  const player = useRef<HTMLVideoElement>(null);
  const countedVideos = useRef(new Set<string>());
const watchedSeconds = useRef(0);
const lastPlaybackTime = useRef<number | null>(null); 

  const pendingLikes = useRef(new Set<string>());

  // Prevent an older GET from overwriting a saved like.
  const likeVersions = useRef<Record<string, number>>(
    {}
  );

  useEffect(() => {
    if (!current) return;

    const video = current;
    const controller = new AbortController();

    async function loadViewCount() {
      try {
        const isOriginal =
          video.id.startsWith("original-");

        const numericId = Number(
          video.id.replace("original-", "")
        );

        const response = await fetch(
          isOriginal
            ? "/api/views"
            : `/api/creator-engagement?videoId=${encodeURIComponent(
                video.id
              )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Views unavailable");
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        const count = Number(
          isOriginal
            ? data.views?.[numericId] ?? 0
            : data.views ?? 0
        );

        setViewCounts((previous) => ({
          ...previous,
          [video.id]: Math.max(
            previous[video.id] ?? 0,
            count
          ),
        }));
      } catch {
        if (!controller.signal.aborted) {
          setViewCounts((previous) => ({
            ...previous,
            [video.id]: previous[video.id] ?? null,
          }));
        }
      }
    }

    void loadViewCount();

    return () => controller.abort();
  }, [current]);

  useEffect(() => {
    if (!current) return;

    const video = current;
    const controller = new AbortController();
    const version =
      likeVersions.current[video.id] ?? 0;

    async function loadLikes() {
      try {
        const isOriginal =
          video.id.startsWith("original-");

        const numericId = Number(
          video.id.replace("original-", "")
        );

        const response = await fetch(
          isOriginal
            ? "/api/likes"
            : `/api/creator-engagement?videoId=${encodeURIComponent(
                video.id
              )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Likes unavailable");
        }

        const data = await response.json();

        if (
          controller.signal.aborted ||
          (likeVersions.current[video.id] ?? 0) !==
            version
        ) {
          return;
        }

        const liked = isOriginal
          ? Array.isArray(data.likedVideoIds) &&
            data.likedVideoIds.some(
              (id: unknown) => Number(id) === numericId
            )
          : Boolean(data.liked);

        const count = Number(
          isOriginal
            ? data.likes?.[numericId] ?? 0
            : data.likes ?? 0
        );

        setLikeStatuses((previous) => ({
          ...previous,
          [video.id]: { count, liked },
        }));
      } catch {
        if (
          !controller.signal.aborted &&
          (likeVersions.current[video.id] ?? 0) ===
            version
        ) {
          setLikeStatuses((previous) => ({
            ...previous,
            [video.id]:
              previous[video.id] ?? null,
          }));
        }
      }
    }

    void loadLikes();

    return () => controller.abort();
  }, [current]);

  async function countView(video: ShuffleVideo) {
    if (countedVideos.current.has(video.id)) return;

    countedVideos.current.add(video.id);

    const isOriginal =
      video.id.startsWith("original-");

    try {
      const response = await fetch(
        isOriginal
          ? "/api/views"
          : "/api/creator-engagement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isOriginal
              ? {
                  videoId: Number(
                    video.id.replace("original-", "")
                  ),
                }
              : {
                  videoId: video.id,
                  action: "view",
                }
          ),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save view");
      }

      const data = await response.json();

      setViewCounts((previous) => ({
        ...previous,
        [video.id]: Math.max(
          previous[video.id] ?? 0,
          Number(data.count ?? 0)
        ),
      }));
    } catch (error) {
      countedVideos.current.delete(video.id);

      console.error(
        "Unable to count shuffle view:",
        error
      );
    }
  }

  async function likeVideo(video: ShuffleVideo) {
    if (
      likeStatuses[video.id]?.liked ||
      pendingLikes.current.has(video.id)
    ) {
      return;
    }

    pendingLikes.current.add(video.id);
    setLikingId(video.id);
    setMessage("");

    const isOriginal =
      video.id.startsWith("original-");

    try {
      const response = await fetch(
        isOriginal
          ? "/api/likes"
          : "/api/creator-engagement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isOriginal
              ? {
                  videoId: Number(
                    video.id.replace("original-", "")
                  ),
                }
              : {
                  videoId: video.id,
                  action: "like",
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (currentId.current === video.id) {
          setMessage(
            response.status === 401
              ? "Please log in to your viewer account to like videos."
              : data.error || "Unable to save like."
          );
        }

        return;
      }

      likeVersions.current[video.id] =
        (likeVersions.current[video.id] ?? 0) + 1;

      setLikeStatuses((previous) => ({
        ...previous,
        [video.id]: {
          count: Number(data.count ?? 0),
          liked: true,
        },
      }));

      if (currentId.current === video.id) {
        setMessage(
          data.alreadyLiked
            ? "You already liked this video."
            : "Thanks! Your like has been saved."
        );
      }
    } catch (error) {
      console.error(
        "Unable to like shuffle video:",
        error
      );

      if (currentId.current === video.id) {
        setMessage(
          "Unable to save your like. Please try again."
        );
      }
    } finally {
      pendingLikes.current.delete(video.id);

      setLikingId((value) =>
        value === video.id ? null : value
      );
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    const timeout = window.setTimeout(
      () => controller.abort(),
      10000
    );

    async function loadCreators() {
      try {
        const response = await fetch("/api/feed", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Feed unavailable");
        }

        const data = await response.json();

        const feed: FeedVideo[] = Array.isArray(
          data.videos
        )
          ? data.videos
          : [];

        const creators: ShuffleVideo[] = feed
          .filter(
            (video) =>
              typeof video.id === "string" &&
              /^creator-\d+$/.test(video.id) &&
              typeof video.url === "string" &&
              video.url.length > 0
          )
          .map((video) => ({
            id: video.id,
            title: video.title || "Creator Video",
            url: video.url,
            watchUrl: `/watch/creator/${video.id}`, 
            creatorName:
              video.creatorName ||
              "Ray'sStream Creator",
            thumbnailUrl: video.thumbnailUrl || "",
          }));

        const uniqueCreators = Array.from(
          new Map(
            creators.map((video) => [video.url, video])
          ).values()
        );

        library.current = [
          ...originals,
          ...uniqueCreators,
        ];

        queue.current = shuffled([
          ...queue.current,
          ...uniqueCreators,
        ]);
      } catch {
        if (!controller.signal.aborted) {
          setMessage(
            "Creator videos could not load. Originals are available."
          );
        } else {
          setMessage(
            "Creator videos took too long to load. Originals are available."
          );
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }

    queue.current = shuffled(originals);
    void loadCreators();

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setVisible(true),
      15000
    );

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (playing) return;

    const timer = window.setTimeout(
      () => setVisible((value) => !value),
      visible ? 30000 : 45000
    );

    return () => window.clearTimeout(timer);
  }, [visible, playing, current]);

  function nextVideo(autoplay = true) {
    const available = library.current.filter(
      (video) => !failed.current.has(video.id)
    );

    queue.current = queue.current.filter(
      (video) => !failed.current.has(video.id)
    );

    if (!available.length) {
      setStarted(false);
      setPlaying(false);
      setMessage(
        "No videos could play. Refresh the page to try again."
      );
      return;
    }

    if (!queue.current.length) {
      queue.current = shuffled(available);

      if (
        queue.current.length > 1 &&
        queue.current[0].id === currentId.current
      ) {
        [queue.current[0], queue.current[1]] = [
          queue.current[1],
          queue.current[0],
        ];
      }
    }

    const next = queue.current.shift();
    if (!next) return;

    countedVideos.current.delete(next.id);
    watchedSeconds.current = 0;
lastPlaybackTime.current = null;
    currentId.current = next.id;
    setMessage("");
    setCurrent(next);
    setStarted(autoplay);
    setVisible(true);
  }

  function openPlayer() {
    player.current?.pause();
    setPlaying(false);
    setMessage("");
    nextVideo(true);
  }
async function shareVideo(video: ShuffleVideo) {
  const url = new URL(
    video.watchUrl,
    window.location.origin
  ).href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: video.title,
        text: `Watch ${video.title} on Ray'sStream`,
        url,
      });
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    setMessage("Video link copied!");
  } catch {
    window.prompt("Copy this video link:", url);
  }
} 

  function hidePlayer() {
    player.current?.pause();
    setPlaying(false);
    setStarted(false);
    setVisible(false);
  }

  const currentLikes = current
    ? likeStatuses[current.id]
    : undefined;

  const savingLike =
    current !== null && likingId === current.id;

  return (
    <section
      style={{
        width: "min(1000px, 94%)",
        margin: "24px auto",
        color: "white",
      }}
    >
      <button
        type="button"
        onClick={openPlayer}
        style={{
          ...buttonStyle,
          background: "#7c3aed",
        }}
      >
        🔀 Shuffle Videos
      </button>

      {visible && (
        <div
          style={{
            marginTop: "16px",
            padding: "20px",
            background: "#121212",
            border: "2px solid #7c3aed",
            borderRadius: "18px",
          }}
        >
          <h2>🔀 Ray&apos;sStream Shuffle</h2>

          <p style={{ color: "#bbb" }}>
            Originals and creator uploads in random order.
          </p>

          {!current && (
            <button
              type="button"
              onClick={() => nextVideo(false)}
              style={buttonStyle}
            >
              Choose a Video
            </button>
          )}

          {current && (
            <>
              <h3>{current.title}</h3>
              <p>{current.creatorName}</p>

              <p
                style={{
                  color: "#bbb",
                  fontWeight: "bold",
                }}
              >
                {viewCounts[current.id] === undefined
                  ? "Loading views..."
                  : viewCounts[current.id] === null
                    ? "Views unavailable"
                    : `👁 ${viewCounts[
                        current.id
                      ]?.toLocaleString()} views`}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => void likeVideo(current)}
                  disabled={
                    savingLike ||
                    Boolean(currentLikes?.liked)
                  }
                  aria-pressed={
                    Boolean(currentLikes?.liked)
                  }
                  style={{
                    ...buttonStyle,
                    background: currentLikes?.liked
                      ? "#7c3aed"
                      : "#2b2b2b",
                    opacity: savingLike ? 0.7 : 1,
                    cursor:
                      savingLike || currentLikes?.liked
                        ? "default"
                        : "pointer",
                  }}
                >
                  {savingLike
                    ? "Saving..."
                    : currentLikes?.liked
                      ? "👍 Liked"
                      : "👍 Like"}
                </button>

                <span style={{ color: "#bbb" }}>
                  {currentLikes === undefined
                    ? "Loading likes..."
                    : currentLikes === null
                      ? "Likes unavailable"
                      : `${currentLikes.count.toLocaleString()} ${
                          currentLikes.count === 1
                            ? "like"
                            : "likes"
                        }`}
                </span>

                <a
                  href="/viewer/login"
                  style={{ color: "#c4b5fd" }}
                >
                  Viewer Login
                </a>
              </div>

              <video
                ref={player}
                key={current.id}
                src={current.url}
                poster={current.thumbnailUrl || undefined}
                controls
                playsInline
                preload="metadata"
                autoPlay={started}
                onPlay={(event) => {
                  const activeVideo = event.currentTarget;

                  document
                    .querySelectorAll("video")
                    .forEach((video) => {
                      if (video !== activeVideo) {
                        video.pause();
                      }
                    });

                  setPlaying(true);
                  setStarted(true);
                }}
                  onPlaying={(event) => {
                  
  lastPlaybackTime.current =
    event.currentTarget.currentTime;
}}
onSeeking={() => {
  lastPlaybackTime.current = null;
}}
onSeeked={(event) => {
  lastPlaybackTime.current =
    event.currentTarget.currentTime;
}}
onWaiting={() => {
  lastPlaybackTime.current = null;
}}
onTimeUpdate={(event) => {
  const video = event.currentTarget;
  const previous = lastPlaybackTime.current;
  lastPlaybackTime.current = video.currentTime;

  if (
    video.paused ||
    video.seeking ||
    previous === null ||
    video.playbackRate <= 0
  ) {
    return;
  }

  const elapsed =
    (video.currentTime - previous) /
    video.playbackRate;

  if (elapsed > 0 && elapsed <= 1) {
    watchedSeconds.current += elapsed;
  }

  if (watchedSeconds.current >= 30) {
    void countView(current);
  }
}} 

                
                onPause={() => {
  lastPlaybackTime.current = null;
  setPlaying(false);
}} 
                onEnded={() => nextVideo(true)}
                onError={() => {
                  failed.current.add(current.id);
                  setPlaying(false);
                  setMessage(
                    "That video could not play. Select Next Video."
                  );
                }}
                style={{
                  width: "100%",
                  maxHeight: "550px",
                  background: "black",
                  borderRadius: "12px",
                }}
              />

              <p style={{ color: "#bbb" }}>
                Press Play to start. The next video plays
                automatically when this one finishes.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => nextVideo(true)}
                  style={buttonStyle}
                >
                  ⏭ Next Video
                </button>

                <a
                  href={current.watchUrl}
                  style={{
                    ...buttonStyle,
                    textDecoration: "none",
                  }}
                >
                  Open Watch Page
                </a>
                <button
  type="button"
  onClick={() => {
    void shareVideo(current);
  }}
  style={buttonStyle}
>
  Share
</button> 
              </div>
            </>
          )}

          {message && <p role="status">{message}</p>}

          <button
            type="button"
            onClick={hidePlayer}
            style={{
              ...buttonStyle,
              marginTop: "16px",
            }}
          >
            Hide Player
          </button>
        </div>
      )}
    </section>
  );
}

const buttonStyle: CSSProperties = {
  display: "inline-block",
  background: "#2b2b2b",
  color: "white",
  border: "2px solid #555",
  padding: "12px 18px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
}; 
