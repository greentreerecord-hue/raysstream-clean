"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type SubscriptionStatus = {
  active: boolean;
  status: string;
};

export default function CreatorLivePage() {
  const router = useRouter();
  const videoRef =
    useRef<HTMLVideoElement | null>(null);
  const streamRef =
    useRef<MediaStream | null>(null);

  const [creatorEmail, setCreatorEmail] =
    useState("");
  const [title, setTitle] = useState("");
  const [cameraReady, setCameraReady] =
    useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);
  const [checkingSubscription, setCheckingSubscription] =
    useState(true);
  const [subscription, setSubscription] =
    useState<SubscriptionStatus>({
      active: false,
      status: "inactive",
    });
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
      stopCameraTracks();
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
      stopCameraTracks();

      setMessage(
        "Requesting camera and microphone access..."
      );

      let mediaStream: MediaStream;

      try {
        mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
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
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          });
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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

  function stopCamera() {
    stopCameraTracks();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setMessage("Camera and microphone stopped.");
  }

  function startBroadcast() {
    if (!subscription.active) {
      setMessage(
        "An active Creator Live subscription is required before broadcasting."
      );
      return;
    }

    if (!cameraReady) {
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

    setMessage(
      "Your camera is ready. The secure Cloudflare broadcast connection is the next step."
    );
  }

  const buttonStyle: React.CSSProperties = {
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
                border: "4px solid white",
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
                style={buttonStyle}
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

            <button
              type="button"
              onClick={startBroadcast}
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: "22px",
                color: "black",
                background: subscription.active
                  ? "#22c55e"
                  : "#9ca3af",
                cursor: subscription.active
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              Start Broadcast
            </button>

            <p
              style={{
                marginBottom: 0,
                marginTop: "18px",
                lineHeight: 1.5,
                color: "#374151",
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
