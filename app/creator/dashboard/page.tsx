"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

export default function CreatorDashboard() {
  const router = useRouter();

  const [creatorName, setCreatorName] =
    useState("");
  const [creatorEmail, setCreatorEmail] =
    useState("");
  const [profilePicture, setProfilePicture] =
    useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] =
    useState("");
  const [profileMessage, setProfileMessage] =
    useState("");
  const [savingProfile, setSavingProfile] =
    useState(false);

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

    async function loadProfilePicture() {
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

        if (
          response.ok &&
          data.profilePictureUrl
        ) {
          setProfilePictureUrl(
            data.profilePictureUrl
          );
        }
      } catch (error) {
        console.error(
          "Unable to load creator profile:",
          error
        );
      }
    }

    loadProfilePicture();
  }, [router]);

  async function saveProfilePicture() {
    if (!creatorEmail) {
      setProfileMessage(
        "Please log in again."
      );
      return;
    }

    if (!profilePicture) {
      setProfileMessage(
        "Please choose a profile picture."
      );
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage(
        "Uploading profile picture..."
      );

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

      setProfileMessage(
        "Saving creator profile..."
      );

      const response = await fetch(
        "/api/creator-profile",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: creatorEmail,
            profilePictureUrl: blob.url,
            profilePicturePathname:
              blob.pathname,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(
          data.error ||
            "Could not save profile picture."
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
        "Profile picture error:",
        error
      );

      setProfileMessage(
        "Could not upload the profile picture."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "raysstreamCreator"
    );

    localStorage.removeItem(
      "raysstreamCreatorEmail"
    );

    router.push("/creator/login");
  }

  const creatorInitial =
    creatorName.trim().charAt(0).toUpperCase() ||
    "C";

  const buttonStyle: React.CSSProperties = {
    padding: "14px 18px",
    borderRadius: "10px",
    border: "2px solid black",
    background: "#1f1f1f",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "bold",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "50px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#151515",
          padding: "32px",
          borderRadius: "16px",
          border: "2px solid black",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "38px",
            marginBottom: "20px",
          }}
        >
          Creator Dashboard
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={`${creatorName} profile`}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "4px solid white",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#22c55e",
                color: "black",
                borderRadius: "50%",
                border: "4px solid white",
                fontSize: "55px",
                fontWeight: "bold",
              }}
            >
              {creatorInitial}
            </div>
          )}

          <div>
            <h2
              style={{
                fontSize: "26px",
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
              }}
            >
              <strong>Email:</strong>{" "}
              {creatorEmail}
            </p>
          </div>
        </div>

        <section
          style={{
            padding: "22px",
            background: "#202020",
            border: "2px solid black",
            borderRadius: "14px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Creator Profile Picture
          </h2>

          <p style={{ color: "#cccccc" }}>
            Choose a JPG, PNG, or WebP image.
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file =
                event.target.files?.[0] ||
                null;

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
            disabled={savingProfile}
            style={{
              ...buttonStyle,
              width: "auto",
              background: "#22c55e",
              color: "black",
              opacity: savingProfile
                ? 0.7
                : 1,
              cursor: savingProfile
                ? "not-allowed"
                : "pointer",
            }}
          >
            {savingProfile
              ? "Saving..."
              : "Save Profile Picture"}
          </button>

          {profileMessage && (
            <p
              style={{
                marginBottom: 0,
                color: "#cccccc",
                fontWeight: "bold",
              }}
            >
              {profileMessage}
            </p>
          )}
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
            onClick={() =>
              router.push("/upload")
            }
            style={buttonStyle}
          >
            Upload Video
          </button>

          <button
            onClick={() =>
              router.push("/uploaded")
            }
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
