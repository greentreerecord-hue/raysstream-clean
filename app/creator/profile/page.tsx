"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

type CreatorProfile = {
  name: string;
  email: string;
  profilePictureUrl: string;
  profilePicturePathname: string;
};

const buttonStyle: CSSProperties = {
  padding: "12px 18px",
  borderRadius: "8px",
  border: "2px solid black",
  color: "white",
  background: "#2563eb",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default function CreatorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [name, setName] = useState("");
  const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPicture, setSavingPicture] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [pictureMessage, setPictureMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  const busy = savingName || savingPicture;

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/creator-profile", {
          cache: "no-store",
        });
        const data = await response.json();

        if (response.status === 401) {
          router.replace("/creator/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Could not load your profile.");
        }

        const loadedProfile: CreatorProfile = {
          name: data.name || "",
          email: data.email || "",
          profilePictureUrl: data.profilePictureUrl || "",
          profilePicturePathname: data.profilePicturePathname || "",
        };

        setProfile(loadedProfile);
        setName(loadedProfile.name);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || busy) return;

    const newName = name.trim().replace(/\s+/g, " ");

    if (!newName || newName.length > 100) {
      setNameMessage("Enter a name between 1 and 100 characters.");
      return;
    }

    setSavingName(true);
    setNameMessage("Saving your creator name...");

    try {
      const response = await fetch("/api/creator-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await response.json();

      if (response.status === 401) {
        router.replace("/creator/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not save your name.");
      }

      const savedName = String(data.name || newName);

      setName(savedName);
      setProfile((current) =>
        current ? { ...current, name: savedName } : current
      );

      // Refresh the name cached by the creator dashboard.
      try {
        const stored = localStorage.getItem("raysstreamCreator");
        if (stored) {
          const creator = JSON.parse(stored);
          if (
            creator &&
            typeof creator === "object" &&
            !Array.isArray(creator)
          ) {
            localStorage.setItem(
              "raysstreamCreator",
              JSON.stringify({ ...creator, name: savedName })
            );
          }
        }
      } catch {
        // The database name has already been saved.
      }

      setNameMessage(
        "Creator name updated! Your prerelease announcements use it too."
      );
      router.refresh();
    } catch (error) {
      setNameMessage(
        error instanceof Error
          ? error.message
          : "Could not save your name."
      );
    } finally {
      setSavingName(false);
    }
  }

  function choosePicture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setPictureMessage("");

    if (!file) {
      setSelectedPicture(null);
      setPreviewUrl("");
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      event.target.value = "";
      setSelectedPicture(null);
      setPreviewUrl("");
      setPictureMessage("Choose a JPG, PNG, or WebP image under 5 MB.");
      return;
    }

    setSelectedPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function savePicture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !selectedPicture || busy) return;

    const form = event.currentTarget;
    setSavingPicture(true);
    setPictureMessage("Uploading your profile picture...");

    try {
      const safeEmail = profile.email
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const blob = await upload(
        `profiles/${safeEmail}/${Date.now()}-${selectedPicture.name}`,
        selectedPicture,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      setPictureMessage("Saving your profile picture...");

      const response = await fetch("/api/creator-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profilePictureUrl: blob.url,
          profilePicturePathname: blob.pathname,
        }),
      });
      const data = await response.json();

      if (response.status === 401) {
        router.replace("/creator/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not save your picture.");
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              profilePictureUrl: data.profilePictureUrl,
              profilePicturePathname: data.profilePicturePathname,
            }
          : current
      );

      form.reset();
      setSelectedPicture(null);
      setPreviewUrl("");
      setPictureMessage("Profile picture updated successfully!");
    } catch (error) {
      setPictureMessage(
        error instanceof Error
          ? error.message
          : "Could not save your profile picture."
      );
    } finally {
      setSavingPicture(false);
    }
  }

  const displayedPicture = previewUrl || profile?.profilePictureUrl || "";
  const initial = profile?.name.trim().charAt(0).toUpperCase() || "C";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050816, #111827)",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => router.push("/creator/dashboard")}
          style={{
            ...buttonStyle,
            background: "white",
            color: "black",
            marginBottom: "25px",
          }}
        >
          ← Back to Creator Dashboard
        </button>

        <section
          style={{
            padding: "28px",
            borderRadius: "18px",
            border: "2px solid black",
            background: "white",
            color: "#111827",
            boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: "36px" }}>
            Creator Profile
          </h1>
          <p>Update your creator name and profile picture.</p>

          {loading ? (
            <p>Loading your profile...</p>
          ) : profile ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "22px",
                  margin: "28px 0",
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
                      border: "4px solid #111827",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      background: "#2563eb",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "64px",
                    }}
                  >
                    {initial}
                  </div>
                )}

                <div style={{ flex: "1 1 240px", overflowWrap: "anywhere" }}>
                  <h2>{profile.name}</h2>
                  <p>{profile.email}</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => router.push("/creator/email")}
                    style={buttonStyle}
                  >
                    Edit Email
                  </button>
                </div>
              </div>

              <form onSubmit={saveName}>
                <label
                  htmlFor="creator-name"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Creator Name
                </label>
                <input
                  id="creator-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                  disabled={busy}
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    padding: "12px",
                    margin: "10px 0 14px",
                    border: "1px solid #666",
                    borderRadius: "8px",
                    background: "white",
                    color: "#111827",
                    fontSize: "18px",
                  }}
                />
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  style={{
                    ...buttonStyle,
                    background: busy ? "#9ca3af" : "#16a34a",
                  }}
                >
                  {savingName ? "Saving..." : "Save Creator Name"}
                </button>
                {nameMessage && <p role="status">{nameMessage}</p>}
              </form>

              <hr style={{ margin: "30px 0" }} />

              <form onSubmit={savePicture}>
                <label
                  htmlFor="profile-picture"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Choose New Profile Picture
                </label>
                <p>Choose a JPG, PNG, or WebP image under 5 MB.</p>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={choosePicture}
                  disabled={busy}
                  style={{ width: "100%", marginBottom: "20px" }}
                />
                <button
                  type="submit"
                  disabled={busy || !selectedPicture}
                  style={{
                    ...buttonStyle,
                    width: "100%",
                    background:
                      busy || !selectedPicture ? "#9ca3af" : "#16a34a",
                  }}
                >
                  {savingPicture ? "Saving..." : "Save Profile Picture"}
                </button>
                {pictureMessage && <p role="status">{pictureMessage}</p>}
              </form>
            </>
          ) : (
            <p role="alert">
              {loadError || "Your creator profile could not be loaded."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
} 
