"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type PlaybackResponse = {
  available: boolean;
  playbackUrl?: string;
  error?: string;
};

export default function LiveViewerPage() {
  const router = useRouter();

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const peerConnectionRef =
    useRef<RTCPeerConnection | null>(null);

  const playbackResourceRef =
    useRef<string | null>(null);

  const [connecting, setConnecting] =
    useState(false);

  const [watching, setWatching] =
    useState(false);

  const [message, setMessage] = useState(
    "Press Watch Live to connect to the livestream."
  );

  useEffect(() => {
    return () => {
      void disconnectPlayback(false);
    };
  }, []);

  function waitForIceGathering(
    peerConnection: RTCPeerConnection
  ) {
    if (
      peerConnection.iceGatheringState ===
      "complete"
    ) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      function checkState() {
        if (
          peerConnection.iceGatheringState ===
          "complete"
        ) {
          peerConnection.removeEventListener(
            "icegatheringstatechange",
            checkState
          );

          resolve();
        }
      }

      peerConnection.addEventListener(
        "icegatheringstatechange",
        checkState
      );
    });
  }

  async function disconnectPlayback(
    showMessage = true
  ) {
    const playbackResource =
      playbackResourceRef.current;

    playbackResourceRef.current = null;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (playbackResource) {
      try {
        await fetch(playbackResource, {
          method: "DELETE",
        });
      } catch {
        // The connection is already closed locally.
      }
    }

    setWatching(false);
    setConnecting(false);

    if (showMessage) {
      setMessage("Live playback stopped.");
    }
  }

  async function watchLive() {
    if (connecting || watching) {
      return;
    }

    try {
      await disconnectPlayback(false);

      setConnecting(true);
      setMessage(
        "Connecting to the Ray’sStream live broadcast..."
      );

      const playbackResponse = await fetch(
        "/api/live-playback",
        {
          cache: "no-store",
        }
      );

      const playbackData =
        (await playbackResponse.json()) as PlaybackResponse;

      if (
        !playbackResponse.ok ||
        !playbackData.available ||
        !playbackData.playbackUrl
      ) {
        throw new Error(
          playbackData.error ||
            "Live playback is unavailable."
        );
      }

      const peerConnection =
        new RTCPeerConnection();

      peerConnectionRef.current =
        peerConnection;

      const receivedStream = new MediaStream();

      peerConnection.ontrack = (event) => {
        receivedStream.addTrack(event.track);

        if (videoRef.current) {
          videoRef.current.srcObject =
            receivedStream;

          void videoRef.current.play().catch(
            () => {
              setMessage(
                "The livestream connected. Press play on the video if it does not start automatically."
              );
            }
          );
        }
      };

      peerConnection.onconnectionstatechange =
        () => {
          const state =
            peerConnection.connectionState;

          if (state === "connected") {
            setConnecting(false);
            setWatching(true);
            setMessage(
              "You are watching Ray’sStream Live."
            );
          }

          if (
            state === "failed" ||
            state === "disconnected"
          ) {
            setWatching(false);
            setConnecting(false);
            setMessage(
              "The live broadcast is offline or the connection ended."
            );
          }
        };

      peerConnection.addTransceiver("video", {
        direction: "recvonly",
      });

      peerConnection.addTransceiver("audio", {
        direction: "recvonly",
      });

      const offer =
        await peerConnection.createOffer();

      await peerConnection.setLocalDescription(
        offer
      );

      await waitForIceGathering(
        peerConnection
      );

      const localDescription =
        peerConnection.localDescription;

      if (!localDescription?.sdp) {
        throw new Error(
          "The browser could not create a playback connection."
        );
      }

      const whepResponse = await fetch(
        playbackData.playbackUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
          },
          body: localDescription.sdp,
        }
      );

      if (!whepResponse.ok) {
        throw new Error(
          "No live broadcast is currently available."
        );
      }

      const answerSdp =
        await whepResponse.text();

      const resourceLocation =
        whepResponse.headers.get("Location");

      if (resourceLocation) {
        playbackResourceRef.current = new URL(
          resourceLocation,
          playbackData.playbackUrl
        ).toString();
      }

      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });
    } catch (error) {
      await disconnectPlayback(false);

      setConnecting(false);
      setWatching(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect to the live broadcast."
      );
    }
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
          <video
            ref={videoRef}
            autoPlay
            controls
            playsInline
            style={{
              width: "100%",
              minHeight: "480px",
              objectFit: "contain",
              display: watching
                ? "block"
                : "none",
              background: "black",
            }}
          />

          {!watching && (
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
                padding: "9px 15px",
                color: "white",
                background: "#dc2626",
                borderRadius: "999px",
                fontWeight: "bold",
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
            onClick={() =>
              void disconnectPlayback(true)
            }
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
