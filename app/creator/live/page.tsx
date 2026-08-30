"use client";

import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type SubscriptionStatus = {
  active: boolean;
  status: string;
};

type LiveAccessResponse = {
  authorized?: boolean;
  publishUrl?: string;
  playbackUrl?: string;
  error?: string;
};

function waitForIceGathering(
  peerConnection: RTCPeerConnection
) {
  return new Promise<void>((resolve) => {
    if (
      peerConnection.iceGatheringState ===
      "complete"
    ) {
      resolve();
      return;
    }

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

    window.setTimeout(() => {
      peerConnection.removeEventListener(
        "icegatheringstatechange",
        checkState
      );

      resolve();
    }, 10000);
  });
}

export default function CreatorLivePage() {
  const router = useRouter();

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const peerConnectionRef =
    useRef<RTCPeerConnection | null>(null);

  const whipResourceUrlRef =
    useRef<string>("");

  const [creatorEmail, setCreatorEmail] =
    useState("");

  const [title, setTitle] = useState("");

  const [cameraReady, setCameraReady] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [
    checkingSubscription,
    setCheckingSubscription,
  ] = useState(true);

  const [subscription, setSubscription] =
    useState<SubscriptionStatus>({
      active: false,
      status: "inactive",
    });

  const [broadcasting, setBroadcasting] =
    useState(false);

  const [connecting, setConnecting] =
    useState(false);

  const [message, setMessage] = useState(
    "Start your camera to preview your livestream."
  );

  useEffect(() => {
    async function loadCreator() {
      try {
        const sessionResponse = await fetch(
          "/api/creator-session",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        if (!sessionResponse.ok) {
          router.push("/creator/login");
          return;
        }

        const sessionData =
          await sessionResponse.json();

        const email =
          sessionData.creator?.email || "";

        if (!email) {
          router.push("/creator/login");
          return;
        }

        setCreatorEmail(email);

        const subscriptionResponse =
          await fetch(
            `/api/live-subscription?email=${encodeURIComponent(
              email
            )}`,
            {
              cache: "no-store",
              credentials: "include",
            }
          );

        const subscriptionData =
          await subscriptionResponse.json();

        if (subscriptionResponse.ok) {
          setSubscription({
            active: Boolean(
              subscriptionData.active
            ),
            status:
              subscriptionData.status ||
              "inactive",
          });
        }
      } catch {
        router.push("/creator/login");
      } finally {
        setCheckingSession(false);
        setCheckingSubscription(false);
      }
    }

    loadCreator();

    return () => {
      if (whipResourceUrlRef.current) {
        fetch(whipResourceUrlRef.current, {
          method: "DELETE",
          keepalive: true,
        }).catch(() => {
          // Page is closing.
        });

        whipResourceUrlRef.current = "";
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, [router]);

  function stopCameraTracks() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }
  }

  async function startCamera() {
    try {
      if (broadcasting || connecting) {
        setMessage(
          "Stop the broadcast before restarting the camera."
        );
        return;
      }

      stopCameraTracks();

      setMessage(
        "Requesting camera and microphone access..."
      );

      let mediaStream: MediaStream;

      try {
        mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: true,
          });
      } catch (firstError) {
        const errorName =
          firstError instanceof DOMException
            ? firstError.name
            : "";

        if (
          errorName !== "NotFoundError" &&
          errorName !== "OverconstrainedError"
        ) {
          throw firstError;
        }

        setMessage(
          "No microphone was found. Starting the camera without audio..."
        );

        mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          mediaStream;
      }

      const hasAudio =
        mediaStream.getAudioTracks().length > 0;

      setCameraReady(true);

      setMessage(
        hasAudio
          ? "Camera and microphone preview are ready. You are not broadcasting yet."
          : "Camera preview is ready without microphone audio. You are not broadcasting yet."
      );
    } catch (error) {
      const errorName =
        error instanceof DOMException
          ? error.name
          : "UnknownError";

      setCameraReady(false);

      setMessage(
        `Unable to start the camera (${errorName}). Check the browser and Windows camera settings.`
      );
    }
  }

  async function stopBroadcast(
    showMessage = true
  ) {
    const resourceUrl =
      whipResourceUrlRef.current;

    whipResourceUrlRef.current = "";

    if (resourceUrl) {
      try {
        await fetch(resourceUrl, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(
          "Unable to delete the Cloudflare broadcast session:",
          error
        );
      }
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setBroadcasting(false);
    setConnecting(false);

    if (showMessage) {
      setMessage(
        "Broadcast stopped. Your camera preview is still available."
      );
    }
  }

  async function stopCamera() {
    if (broadcasting || connecting) {
      await stopBroadcast(false);
    }

    stopCameraTracks();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);

    setMessage(
      "Camera and microphone stopped."
    );
  }

  async function startBroadcast() {
    if (connecting || broadcasting) {
      return;
    }

    if (!subscription.active) {
      setMessage(
        "An active Creator Live subscription is required before broadcasting."
      );
      return;
    }

    if (!cameraReady || !streamRef.current) {
      setMessage(
        "Start your camera before beginning the broadcast."
      );
      return;
    }

    if (!title.trim()) {
      setMessage(
        "Enter a livestream title before broadcasting."
      );
      return;
    }

    try {
      setConnecting(true);

      setMessage(
        "Verifying Creator Live access..."
      );

      const accessResponse = await fetch(
        "/api/live-access",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const accessData =
        (await accessResponse.json()) as LiveAccessResponse;

      if (
        !accessResponse.ok ||
        !accessData.authorized ||
        !accessData.publishUrl
      ) {
        throw new Error(
          accessData.error ||
            "Creator Live access was denied."
        );
      }

      setMessage(
        "Connecting your camera to Cloudflare Stream..."
      );

      const peerConnection =
        new RTCPeerConnection();

      peerConnectionRef.current =
        peerConnection;

      streamRef.current
        .getTracks()
        .forEach((track) => {
          peerConnection.addTrack(
            track,
            streamRef.current as MediaStream
          );
        });

      peerConnection.addEventListener(
        "connectionstatechange",
        () => {
          const state =
            peerConnection.connectionState;

          if (state === "connected") {
            setConnecting(false);
            setBroadcasting(true);

            setMessage(
              `🔴 LIVE: ${title.trim()}`
            );
          }

          if (
            state === "failed" ||
            state === "disconnected"
          ) {
            setConnecting(false);
            setBroadcasting(false);

            setMessage(
              "The live connection was interrupted. Stop the broadcast and try again."
            );
          }
        }
      );

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
          "The browser could not create a broadcast connection."
        );
      }

      const whipResponse = await fetch(
        accessData.publishUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
          },
          body: localDescription.sdp,
        }
      );

      if (!whipResponse.ok) {
        const responseText =
          await whipResponse.text();

        console.error(
          "Cloudflare WHIP error:",
          whipResponse.status,
          responseText
        );

        throw new Error(
          `Cloudflare could not start the broadcast (${whipResponse.status}).`
        );
      }

      const answerSdp =
        await whipResponse.text();

      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      const locationHeader =
        whipResponse.headers.get("Location");

      if (locationHeader) {
        whipResourceUrlRef.current =
          new URL(
            locationHeader,
            accessData.publishUrl
          ).toString();
      }

      setConnecting(false);
      setBroadcasting(true);

      setMessage(`🔴 LIVE: ${title.trim()}`);
    } catch (error) {
      console.error(
        "Start broadcast error:",
        error
      );

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      whipResourceUrlRef.current = "";

      setConnecting(false);
      setBroadcasting(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start the broadcast."
      );
    }
  }

  const buttonStyle: CSSProperties = {
    padding: "13px 22px",
    border: "3px solid white",
    borderRadius: "14px",
    color: "white",
    background: "#1d4ed8",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  if (checkingSession) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          background: "black",
          fontFamily: "Arial, sans-serif",
          fontSize: "22px",
        }}
      >
        Verifying creator session...
      </main>
    );
  }

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
          onClick={() =>
            router.push("/creator/dashboard")
          }
          style={{
            ...buttonStyle,
            marginBottom: "24px",
            background: "#374151",
          }}
        >
          ← Creator Dashboard
        </button>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "42px",
          }}
        >
          Creator Live Studio
        </h1>

        <p
          style={{
            marginTop: 0,
            color: "#d1d5db",
          }}
        >
          Signed in as {creatorEmail}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginTop: "28px",
          }}
        >
          <section>
            <div
              style={{
                overflow: "hidden",
                minHeight: "360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111827",
                border: broadcasting
                  ? "4px solid #ef4444"
                  : "4px solid white",
                borderRadius: "20px",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "360px",
                  objectFit: "cover",
                  display: cameraReady
                    ? "block"
                    : "none",
                }}
              />

              {!cameraReady && (
                <p
                  style={{
                    padding: "30px",
                    color: "#9ca3af",
                    fontSize: "20px",
                    textAlign: "center",
                  }}
                >
                  Camera preview will appear here
                </p>
              )}
            </div>

            {broadcasting && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  color: "white",
                  background: "#dc2626",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                🔴 LIVE NOW
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={startCamera}
                disabled={
                  broadcasting || connecting
                }
                style={{
                  ...buttonStyle,
                  opacity:
                    broadcasting || connecting
                      ? 0.6
                      : 1,
                }}
              >
                Start Camera
              </button>

              <button
                type="button"
                onClick={stopCamera}
                style={{
                  ...buttonStyle,
                  background: "#7f1d1d",
                }}
              >
                Stop Camera
              </button>
            </div>
          </section>

          <section
            style={{
              padding: "24px",
              color: "black",
              background: "white",
              border: "4px solid #7c3aed",
              borderRadius: "20px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "28px",
              }}
            >
              Broadcast Setup
            </h2>

            <label
              htmlFor="live-title"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Livestream title
            </label>

            <input
              id="live-title"
              value={title}
              disabled={broadcasting}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter a title"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border: "3px solid black",
                borderRadius: "10px",
                fontSize: "17px",
                opacity: broadcasting ? 0.7 : 1,
              }}
            />

            <div
              style={{
                marginTop: "22px",
                padding: "16px",
                borderRadius: "12px",
                background: checkingSubscription
                  ? "#e5e7eb"
                  : subscription.active
                    ? "#dcfce7"
                    : "#fee2e2",
              }}
            >
              {checkingSubscription
                ? "Checking subscription..."
                : subscription.active
                  ? "✓ Creator Live subscription active"
                  : "Creator Live subscription inactive"}
            </div>

            {!broadcasting ? (
              <button
                type="button"
                onClick={startBroadcast}
                disabled={connecting}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  marginTop: "22px",
                  color: "black",
                  background: subscription.active
                    ? "#22c55e"
                    : "#9ca3af",
                  cursor:
                    subscription.active &&
                    !connecting
                      ? "pointer"
                      : "not-allowed",
                  opacity: connecting ? 0.7 : 1,
                }}
              >
                {connecting
                  ? "Connecting..."
                  : "Start Broadcast"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  stopBroadcast(true)
                }
                style={{
                  ...buttonStyle,
                  width: "100%",
                  marginTop: "22px",
                  background: "#dc2626",
                }}
              >
                Stop Broadcast
              </button>
            )}

            <p
              style={{
                marginBottom: 0,
                marginTop: "18px",
                lineHeight: 1.5,
                color: broadcasting
                  ? "#b91c1c"
                  : "#374151",
                fontWeight: broadcasting
                  ? "bold"
                  : "normal",
              }}
            >
              {message}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
} 
