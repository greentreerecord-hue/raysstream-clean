"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

export default function CreatorDashboard() {
  const router = useRouter();

  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [profilePicture, setProfilePicture] =
    useState<File | null>(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [savingPicture, setSavingPicture] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem(
      "raysstreamCreator"
    );

    const savedEmail = localStorage.getItem(
      "raysstreamCreatorEmail"
    );

    if (!savedName || !savedEmail) {
      router.push("/creator/login");
      return;
    }

    setCreatorName(savedName);
    setCreatorEmail(savedEmail);

    async function loadCreatorProfile() {
      try {
        const response = await fetch(
          `/api/creator-profile?email=${encodeURIComponent(
            savedEmail
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setProfilePictureUrl(
            data.profilePictureUrl || ""
          );
        }
      } catch (error) {
        console.error(
          "Unable to load creator profile:",
          error
        );
      }
    }

    loadCreatorProfile();
  }, [router]);

  const creatorInitial =
    creatorName.trim().charAt(0).toUpperCase() || "C";

  async function saveProfilePicture() {
    if (!creatorEmail) {
      router.push("/creator/login");
      return;
    }

    if (!profilePicture) {
      setProfileMessage(
        "Please choose a profile picture first."
      );
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(profilePicture.type)) {
      setProfileMessage(
        "Please choose a JPG, PNG, or WebP image."
      );
      return;
    }

    try {
      setSavingPicture(true);
      setProfileMessage("Uploading profile picture...");

      const safeEmail = creatorEmail
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const blob = await upload(
        `profiles/${safeEmail}/${Date.now()}-${
          profilePicture.name
        }`,
        profilePicture,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      setProfileMessage("Saving profile picture...");

      const response = await fetch(
        "/api/creator-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: creatorEmail,
            profilePictureUrl: blob.url,
            profilePicturePathname: blob.pathname,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(
          data.error ||
            "Unable to save the profile picture."
        );
        return;
      }

      setProfilePictureUrl(blob.url);
      setProfilePicture(null);
      setProfileMessage(
        "Profile picture updated successfully!"
      );
    } catch (error) {
      console.error(
        "Profile picture upload error:",
        error
      );

      setProfileMessage(
        "Unable to upload the profile picture."
      );
    } finally {
      setSavingPicture(false);
    }
  }

  function logout() {
    localStorage.removeItem("raysstreamCreator");
    localStorage.removeItem("raysstreamCreatorEmail");
    router.push("/creator/login");
  }

  const buttonStyle: React.CSSProperties = {
    padding: "14px 18px",
    borderRadius: "10px",
    border: "1px solid #555",
    background: "#1f1f1f",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "50px 20px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#151515",
          padding: "32px",
          borderRadius: "16px",
          border: "1px solid #2d2d2d",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "38px",
            marginTop: 0,
            marginBottom: "28px",
          }}
        >
          Creator Dashboard
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "28px",
          }}
        >
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={`${creatorName} profile`}
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: "4px solid white",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "180px",
                height: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#22c55e",
                color: "black",
                border: "4px solid white",
                borderRadius: "50%",
                fontSize: "76px",
                fontWeight: "bold",
              }}
            >
              {creatorInitial}
            </div>
          )}

          <div>
            <h2
              style={{
                fontSize: "28px",
                margin: "0 0 12px",
              }}
            >
              Welcome, {creatorName}
            </h2>

            <p
              style={{
                color: "#cccccc",
                fontSize: "17px",
                margin: 0,
                overflowWrap: "anywhere",
              }}
            >
              <strong>Email:</strong> {creatorEmail}
            </p>
          </div>
        </div>

        <section
          style={{
            marginTop: "32px",
            padding: "24px",
            background: "#202020",
            border: "1px solid #444",
            borderRadius: "14px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "26px",
            }}
          >
            Creator Profile Picture
          </h2>

          <p
            style={{
              color: "#cccccc",
              fontSize: "17px",
            }}
          >
            Choose a JPG, PNG, or WebP image.
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file =
                event.target.files?.[0] || null;

              setProfilePicture(file);
              setProfileMessage("");
            }}
            style={{
              display: "block",
              marginBottom: "18px",
            }}
          />

          <button
            type="button"
            onClick={saveProfilePicture}
            disabled={savingPicture}
            style={{
              padding: "13px 22px",
              background: "#22c55e",
              color: "black",
              border: "2px solid white",
              borderRadius: "10px",
              fontSize: "17px",
              fontWeight: "bold",
              cursor: savingPicture
                ? "not-allowed"
                : "pointer",
              opacity: savingPicture ? 0.7 : 1,
            }}
          >
            {savingPicture
              ? "Saving..."
              : "Save Profile Picture"}
          </button>

          {profileMessage && (
            <p
              style={{
                marginBottom: 0,
                color: "#d1d5db",
                fontWeight: "bold",
              }}
            >
              {profileMessage}
            </p>
          )}
        </section>

        <section
          style={{
            marginTop: "28px",
            padding: "24px",
            background:
              "linear-gradient(135deg, #14532d, #052e16)",
            border: "2px solid #22c55e",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "28px",
            }}
          >
            🔴 Ray&apos;sStream Creator Live
          </h2>

          <p
            style={{
              margin: "0 0 8px",
              color: "#dcfce7",
              fontSize: "17px",
              lineHeight: 1.5,
            }}
          >
            Livestream for up to 5 hours each month with
            live chat, a LIVE badge, and saved replays.
          </p>

          <p
            style={{
              margin: "0 0 20px",
              fontSize: "25px",
              fontWeight: "bold",
            }}
          >
            $19.99/month
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "https://buy.stripe.com/aFa28r08qgwv0Nkcid2Nq04";
            }}
            style={{
              padding: "14px 26px",
              background: "#22c55e",
              color: "black",
              border: "3px solid white",
              borderRadius: "24px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Get Creator Live
          </button>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() => router.push("/upload")}
            style={buttonStyle}
          >
            Upload Video
          </button>

          <button
            onClick={() => router.push("/uploaded")}
            style={buttonStyle}
          >
            My Uploaded Videos
          </button>

          <button
            onClick={() => router.push("/")}
            style={buttonStyle}
          >
            Ray&apos;sStream Home
          </button>

          <button
            onClick={logout}
            style={{
              ...buttonStyle,
              background: "#7a1d1d",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
} 
