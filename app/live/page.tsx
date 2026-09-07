"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PlaybackResponse = {
  available: boolean;
  playbackUrl?: string;
  error?: string;
};

export default function LiveViewerPage() {
  const router = useRouter();

  const [connecting, setConnecting] =
    useState(false);

  const [watching, setWatching] =
    useState(false);

  const [playbackUrl, setPlaybackUrl] =
    useState("");

  const [message, setMessage] = useState(
    "Press Watch Live to connect to the livestream."
  );

  async function watchLive() {
    if (connecting || watching) {
      return;
    }

    try {
      setConnecting(true);
      setMessage(
        "Connecting to the Ray’sStream live broadcast..."
      );

      const response = await fetch(
        "/api/live-playback",
        {
          cache: "no-store",
        }
      );

      const data =
        (await response.json()) as PlaybackResponse;

      if (
        !response.ok ||
        !data.available ||
        !data.playbackUrl
      ) {
        throw new Error(
          data.error ||
            "Live playback is unavailable."
        );
      }

      const separator =
        data.playbackUrl.includes("?") ? "&" : "?";

      setPlaybackUrl(
        `${data.playbackUrl}${separator}autoplay=true&muted=false`
      );

      setWatching(true);
      setMessage(
        "You are watching Ray’sStream Live."
      );
    } catch (error) {
      setPlaybackUrl("");
      setWatching(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect to the live broadcast."
      );
    } finally {
      setConnecting(false);
    }
  }

  function stopWatching() {
    setPlaybackUrl("");
    setWatching(false);
    setConnecting(false);
    setMessage("Live playback stopped.");
  }

  const buttonStyle = {
    padding: "14px 24px",
    border: "3px solid white",
    borderRadius: "14px",
    color: "white",
    background: "#2563eb",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  } as const;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "35px 20px",
        color: "white",
        background: "black",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            ...buttonStyle,
            background: "#374151",
          }}
        >
          ← Ray’sStream Home
        </button>

        <h1
          style={{
            marginBottom: "8px",
            fontSize: "44px",
          }}
        >
          Ray’sStream Live
        </h1>

        <p
          style={{
            color: "#d1d5db",
            fontSize: "19px",
          }}
        >
          Watch the current live broadcast.
        </p>

        <div
          style={{
            overflow: "hidden",
            position: "relative",
            minHeight: "480px",
            marginTop: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111827",
            border: watching
              ? "5px solid #ef4444"
              : "5px solid white",
            borderRadius: "22px",
          }}
        >
          {watching && playbackUrl ? (
            <iframe
              src={playbackUrl}
              title="Ray’sStream Live Broadcast"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              style={{
                width: "100%",
                minHeight: "480px",
                border: 0,
                background: "black",
              }}
            />
          ) : (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "60px",
                }}
              >
                📡
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#d1d5db",
                  fontSize: "22px",
                }}
              >
                {connecting
                  ? "Connecting..."
                  : "Live video will appear here"}
              </p>
            </div>
          )}

          {watching && (
            <div
              style={{
                position: "absolute",
                top: "18px",
                left: "18px",
                zIndex: 2,
                padding: "9px 15px",
                color: "white",
                background: "#dc2626",
                borderRadius: "999px",
                fontWeight: "bold",
                pointerEvents: "none",
              }}
            >
              ● LIVE
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            marginTop: "18px",
          }}
        >
          <button
            type="button"
            onClick={watchLive}
            disabled={connecting || watching}
            style={{
              ...buttonStyle,
              background:
                connecting || watching
                  ? "#6b7280"
                  : "#16a34a",
              cursor:
                connecting || watching
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {connecting
              ? "Connecting..."
              : watching
                ? "Watching Live"
                : "Watch Live"}
          </button>

          <button
            type="button"
            onClick={stopWatching}
            disabled={!connecting && !watching}
            style={{
              ...buttonStyle,
              background:
                !connecting && !watching
                  ? "#6b7280"
                  : "#b91c1c",
              cursor:
                !connecting && !watching
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Stop Watching
          </button>
        </div>

        <div
          style={{
            marginTop: "22px",
            padding: "18px",
            color: "black",
            background: watching
              ? "#dcfce7"
              : "#f3f4f6",
            borderRadius: "14px",
            fontSize: "18px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
      </div>
    </main>
  );
} 
