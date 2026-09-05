"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

type CreatorProfile = {
  name: string;
  email: string;
  profilePictureUrl: string;
  profilePicturePathname: string;
};

export default function CreatorProfilePage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<CreatorProfile | null>(null);

  const [selectedPicture, setSelectedPicture] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/creator-profile",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/creator/login");
          return;
        }

        if (!response.ok) {
          setMessage(
            data.error ||
              "Could not load your profile."
          );
          return;
        }

        setProfile({
          name: data.name || "",
          email: data.email || "",
          profilePictureUrl:
            data.profilePictureUrl || "",
          profilePicturePathname:
            data.profilePicturePathname || "",
        });
      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        setMessage(
          "Could not load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function choosePicture(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] || null;

    setMessage("");

    if (!file) {
      setSelectedPicture(null);
      setPreviewUrl("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setSelectedPicture(null);
      setPreviewUrl("");
      setMessage(
        "Please choose a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setSelectedPicture(null);
      setPreviewUrl("");
      setMessage(
        "Please choose an image smaller than 5 MB."
      );
      return;
    }

    setSelectedPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function saveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    if (!selectedPicture) {
      setMessage(
        "Please choose a new profile picture."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage(
        "Uploading your profile picture..."
      );

      const safeEmail = profile.email
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const pictureBlob = await upload(
        `profiles/${safeEmail}/${Date.now()}-${selectedPicture.name}`,
        selectedPicture,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      setMessage("Saving your profile...");

      const response = await fetch(
        "/api/creator-profile",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            profilePictureUrl:
              pictureBlob.url,
            profilePicturePathname:
              pictureBlob.pathname,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/creator/login");
        return;
      }

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not save your profile."
        );
        return;
      }

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              profilePictureUrl:
                data.profilePictureUrl,
              profilePicturePathname:
                data.profilePicturePathname,
            }
          : currentProfile
      );

      setSelectedPicture(null);
      setPreviewUrl("");
      setMessage(
        "Profile picture updated successfully!"
      );
    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      setMessage(
        "Could not save your profile picture."
      );
    } finally {
      setSaving(false);
    }
  } 
  const displayedPicture =
    previewUrl ||
    profile?.profilePictureUrl ||
    "";

  const creatorInitial =
    profile?.name?.trim().charAt(0)
      .toUpperCase() || "C";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #050816, #111827)",
        color: "#ffffff",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.push("/creator/dashboard")
          }
          style={{
            padding: "12px 18px",
            marginBottom: "25px",
            borderRadius: "8px",
            border: "2px solid #000000",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ← Back to Creator Dashboard
        </button>

        <section
          style={{
            padding: "30px",
            borderRadius: "18px",
            border: "2px solid #000000",
            backgroundColor: "#ffffff",
            color: "#111827",
            boxShadow:
              "0 18px 45px rgba(0, 0, 0, 0.35)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "10px",
              fontSize: "38px",
            }}
          >
            Creator Profile
          </h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: "28px",
              color: "#4b5563",
              fontSize: "17px",
            }}
          >
            View your account and update your
            creator profile picture.
          </p>

          {loading ? (
            <p>Loading your profile...</p>
          ) : profile ? (
            <form onSubmit={saveProfile}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "22px",
                  flexWrap: "wrap",
                  marginBottom: "28px",
                }}
              >
                {displayedPicture ? (
                  <img
                    src={displayedPicture}
                    alt={`${profile.name} profile`}
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      border:
                        "4px solid #111827",
                      objectFit: "cover",
                      backgroundColor: "#e5e7eb",
                    }}
                  />
                ) : (
                  <div
                    aria-label="Creator profile placeholder"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      border:
                        "4px solid #111827",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #4f46e5, #06b6d4)",
                      color: "#ffffff",
                      fontSize: "64px",
                      fontWeight: "bold",
                    }}
                  >
                    {creatorInitial}
                  </div>
                )}

                <div
                  style={{
                    flex: "1 1 260px",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 8px",
                      fontSize: "28px",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {profile.name}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#4b5563",
                      fontSize: "17px",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {profile.email}
                  </p>
                </div>
              </div>

              <label
                htmlFor="profile-picture"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Choose New Profile Picture
              </label>

              <p
                style={{
                  margin: "0 0 12px",
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                Choose a JPG, PNG, or WebP image
                smaller than 5 MB.
              </p>

              <input
                id="profile-picture"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={choosePicture}
                disabled={saving}
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: "22px",
                  fontSize: "16px",
                }}
              />

              <button
                type="submit"
                disabled={
                  saving || !selectedPicture
                }
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "9px",
                  border: "2px solid #000000",
                  backgroundColor:
                    saving || !selectedPicture
                      ? "#9ca3af"
                      : "#16a34a",
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor:
                    saving || !selectedPicture
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save Profile Picture"}
              </button>
            </form>
          ) : (
            <p>
              Your creator profile could not be
              loaded.
            </p>
          )}

          {message && (
            <p
              style={{
                marginTop: "20px",
                marginBottom: 0,
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#f3f4f6",
                color: "#111827",
                fontWeight: "bold",
                overflowWrap: "anywhere",
              }}
            >
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
} 
