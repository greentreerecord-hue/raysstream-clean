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

  const library = useRef<ShuffleVideo[]>(originals);
  const queue = useRef<ShuffleVideo[]>([]);
  const currentId = useRef("");
  const failed = useRef(new Set<string>());
  const player = useRef<HTMLVideoElement>(null);

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
            watchUrl: `/creator/watch/${video.id.replace(
              "creator-",
              ""
            )}`,
            creatorName:
              video.creatorName || "Ray'sStream Creator",
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

        // Add new creator videos to the remaining queue.
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

    // Prepare originals while creator videos load.
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

      // Avoid the same video at the start of a new round.
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

    currentId.current = next.id;
    setCurrent(next);
    setStarted(autoplay);
    setVisible(true);
  }

  function openPlayer() {
    setVisible(true);

    if (!current) {
      nextVideo(false);
    }
  }

  function hidePlayer() {
    player.current?.pause();
    setPlaying(false);
    setStarted(false);
    setVisible(false);
  }

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

              <video
                ref={player}
                key={current.id}
                src={current.url}
                poster={current.thumbnailUrl || undefined}
                controls
                playsInline
                preload="metadata"
                autoPlay={started}
                onPlay={() => {
                  setPlaying(true);
                  setStarted(true);
                }}
                onPause={() => setPlaying(false)}
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
                  onClick={() => {
                    setMessage("");
                    nextVideo(true);
                  }}
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
