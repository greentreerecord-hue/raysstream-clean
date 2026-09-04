"use client";

import type { CSSProperties } from "react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type Viewer = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  profilePictureUrl: string;
};

function saveViewerLocally(viewer: Viewer) {
  // These values support existing display features.
  // They are not proof that someone is logged in.
  try {
    localStorage.setItem(
      "raysstreamViewerId",
      String(viewer.id)
    );

    localStorage.setItem(
      "raysstreamViewerName",
      viewer.fullName
    );

    localStorage.setItem(
      "raysstreamViewerUsername",
      viewer.username
    );

    localStorage.setItem(
      "raysstreamViewerEmail",
      viewer.email
    );

    localStorage.setItem(
      "raysstreamViewerPicture",
      viewer.profilePictureUrl
    );

    localStorage.setItem(
      "raysstreamViewer",
      JSON.stringify(viewer)
    );
  } catch {
    // The session still works if storage is unavailable.
  }
}

function clearViewerLocally() {
  try {
    const keys = [
      "raysstreamViewer",
      "raysstreamViewerId",
      "raysstreamViewerName",
      "raysstreamViewerUsername",
      "raysstreamViewerEmail",
      "raysstreamViewerPicture",
    ];

    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch {
    // Server logout does not depend on local storage.
  }
}

function redirectToLogin() {
  clearViewerLocally();
  window.location.replace("/viewer/login");
}

export default function ViewerDashboard() {
  const [viewer, setViewer] =
    useState<Viewer | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");

  const [pictureFile, setPictureFile] =
    useState<File | null>(null);

  const [saving, setSaving] = useState(false);

  const [uploadingPicture, setUploadingPicture] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [message, setMessage] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const busy =
    saving || uploadingPicture || loggingOut;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/viewer-profile",
          {
            cache: "no-store",
            credentials: "same-origin",
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load your profile."
          );
        }

        const loadedViewer: Viewer = {
          id: Number(data.viewer.id),
          fullName: String(
            data.viewer.fullName
          ),
          username: String(
            data.viewer.username
          ),
          email: String(data.viewer.email),
          profilePictureUrl: String(
            data.viewer.profilePictureUrl || ""
          ),
        };

        if (controller.signal.aborted) {
          return;
        }

        setViewer(loadedViewer);
        setFullName(loadedViewer.fullName);
        saveViewerLocally(loadedViewer);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load your profile."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      controller.abort();
    };
  }, []); 
async function updateProfile(
    updatedName: string,
    updatedPictureUrl?: string
  ) {
    const response = await fetch(
      "/api/viewer-profile",
      {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: updatedName,
          ...(updatedPictureUrl !== undefined
            ? {
                profilePictureUrl:
                  updatedPictureUrl,
              }
            : {}),
        }),
      }
    );

    if (response.status === 401) {
      redirectToLogin();

      throw new Error(
        "Your session expired. Please log in again."
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to update profile."
      );
    }

    const updatedViewer: Viewer = {
      id: Number(data.viewer.id),
      fullName: String(data.viewer.fullName),
      username: String(data.viewer.username),
      email: String(data.viewer.email),
      profilePictureUrl: String(
        data.viewer.profilePictureUrl || ""
      ),
    };

    setViewer(updatedViewer);
    setFullName(updatedViewer.fullName);
    saveViewerLocally(updatedViewer);

    return updatedViewer;
  }

  async function saveProfile() {
    if (!viewer || busy) {
      return;
    }

    const cleanedName = fullName.trim();

    if (!cleanedName) {
      setMessage("Please enter your full name.");
      return;
    }

    if (cleanedName.length > 100) {
      setMessage(
        "Your name must be 100 characters or less."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("Saving profile...");

      // Omitting the picture keeps the existing one.
      await updateProfile(cleanedName);

      setEditing(false);
      setMessage("Your name has been updated.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadPicture() {
    if (!viewer || busy) {
      return;
    }

    if (!pictureFile) {
      setMessage("Please choose a picture first.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(pictureFile.type)) {
      setMessage(
        "Please choose a JPG, PNG, or WebP picture."
      );
      return;
    }

    if (
      pictureFile.size === 0 ||
      pictureFile.size > 4 * 1024 * 1024
    ) {
      setMessage(
        "Choose a picture larger than 0 bytes and no larger than 4 MB."
      );
      return;
    }

    try {
      setUploadingPicture(true);
      setMessage("Uploading profile picture...");

      const formData = new FormData();
      formData.append("picture", pictureFile);

      const uploadResponse = await fetch(
        "/api/viewer-picture-upload",
        {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        }
      );

      if (uploadResponse.status === 401) {
        redirectToLogin();

        throw new Error(
          "Your session expired. Please log in again."
        );
      }

      const uploadData =
        await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.error ||
            "Unable to upload profile picture."
        );
      }

      if (
        typeof uploadData.url !== "string" ||
        !uploadData.url
      ) {
        throw new Error(
          "The upload did not return a picture address."
        );
      }

      await updateProfile(
        viewer.fullName,
        uploadData.url
      );

      setPictureFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(
        "Your profile picture has been updated."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload profile picture."
      );
    } finally {
      setUploadingPicture(false);
    }
  }

  async function logout() {
    if (busy) {
      return;
    }

    try {
      setLoggingOut(true);
      setMessage("Logging out...");

      const response = await fetch(
        "/api/viewer-logout",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to log out. Please try again."
        );
      }

      // Clear display data only after server logout.
      redirectToLogin();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  } 
if (loading) {
    return (
      <main style={pageStyle}>
        <p>Loading viewer dashboard...</p>
      </main>
    );
  }

  if (!viewer) {
    return (
      <main style={pageStyle}>
        <section style={dashboardStyle}>
          <h1>Ray&apos;sStream</h1>

          <p role="alert">
            {loadError ||
              "Please log in to continue."}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            style={buttonStyle}
          >
            Try Again
          </button>

          <a
            href="/viewer/login"
            style={primaryLinkStyle}
          >
            Viewer Login
          </a>
        </section>
      </main>
    );
  }

  const initial =
    viewer.fullName.charAt(0).toUpperCase() || "V";

  return (
    <main style={pageStyle}>
      <section style={dashboardStyle}>
        <h1 style={logoStyle}>
          Ray&apos;sStream
        </h1>

        <p style={accountLabelStyle}>
          VIEWER ACCOUNT
        </p>

        <h2 style={headingStyle}>
          Viewer Dashboard
        </h2>

        <p style={welcomeStyle}>
          Welcome,{" "}
          <strong>{viewer.fullName}!</strong>
        </p>

        <div style={profileHeaderStyle}>
          {viewer.profilePictureUrl ? (
            <img
              src={viewer.profilePictureUrl}
              alt={viewer.fullName}
              style={profilePictureStyle}
            />
          ) : (
            <div style={avatarStyle}>
              {initial}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <h3 style={nameStyle}>
              {viewer.fullName}
            </h3>

            <p style={usernameStyle}>
              @{viewer.username}
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>
            Profile Picture
          </h3>

          <input
            ref={fileInputRef}
            type="file"
            aria-label="Choose a profile picture"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => {
              setPictureFile(
                event.target.files?.[0] || null
              );
              setMessage("");
            }}
            style={fileInputStyle}
          />

          <button
            onClick={uploadPicture}
            disabled={busy || !pictureFile}
            style={{
              ...primaryButtonStyle,
              marginTop: "14px",
              opacity:
                busy || !pictureFile ? 0.65 : 1,
            }}
          >
            {uploadingPicture
              ? "Uploading..."
              : "Upload Profile Picture"}
          </button>

          <p style={helpTextStyle}>
            JPG, PNG, or WebP. Maximum size: 4 MB.
          </p>
        </div>

        <div style={informationStyle}>
          <div style={rowStyle}>
            <strong>Full Name</strong>
            <span>{viewer.fullName}</span>
          </div>

          <div style={rowStyle}>
            <strong>Username</strong>
            <span>@{viewer.username}</span>
          </div>

          <div style={rowStyle}>
            <strong>Email</strong>
            <span>{viewer.email}</span>
          </div>
        </div>

        {editing && (
          <div style={cardStyle}>
            <label
              htmlFor="fullName"
              style={labelStyle}
            >
              Edit Full Name
            </label>

            <input
              id="fullName"
              value={fullName}
              disabled={busy}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              maxLength={100}
              style={inputStyle}
            />

            <div style={editButtonStyle}>
              <button
                onClick={saveProfile}
                disabled={busy}
                style={primaryButtonStyle}
              >
                {saving ? "Saving..." : "Save Name"}
              </button>

              <button
                onClick={() => {
                  setEditing(false);
                  setFullName(viewer.fullName);
                  setMessage("");
                }}
                disabled={busy}
                style={buttonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <p
            role="status"
            aria-live="polite"
            style={messageStyle}
          >
            {message}
          </p>
        )}

        <div style={buttonGridStyle}>
          <a href="/" style={primaryLinkStyle}>
            Watch Videos
          </a>

          <button
            onClick={() => {
              setFullName(viewer.fullName);
              setEditing(true);
              setMessage("");
            }}
            disabled={busy}
            style={buttonStyle}
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            disabled={busy}
            style={buttonStyle}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        <a href="/" style={backLinkStyle}>
          ← Back to Home
        </a>
      </section>
    </main>
  );
} 
const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  justifyContent: "center",
  padding: "40px 20px",
  boxSizing: "border-box",
};

const dashboardStyle: CSSProperties = {
  width: "min(850px, 100%)",
  textAlign: "center",
};

const logoStyle: CSSProperties = {
  fontSize: "48px",
  margin: "0 0 28px",
};

const accountLabelStyle: CSSProperties = {
  color: "#ff6347",
  fontWeight: "bold",
  letterSpacing: "4px",
};

const headingStyle: CSSProperties = {
  fontSize: "42px",
  margin: "8px 0",
};

const welcomeStyle: CSSProperties = {
  color: "#9dc5ff",
  fontSize: "22px",
  marginBottom: "30px",
};

const profileHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "24px",
  textAlign: "left",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  padding: "24px",
};

const avatarStyle: CSSProperties = {
  width: "92px",
  height: "92px",
  flex: "0 0 92px",
  borderRadius: "50%",
  background:
    "linear-gradient(135deg, #ff5577, #ff7a00)",
  display: "grid",
  placeItems: "center",
  fontSize: "38px",
  fontWeight: "bold",
};

const profilePictureStyle: CSSProperties = {
  width: "92px",
  height: "92px",
  flex: "0 0 92px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #ff6347",
  background: "#222",
};

const nameStyle: CSSProperties = {
  fontSize: "28px",
  margin: "0 0 8px",
  overflowWrap: "anywhere",
};

const usernameStyle: CSSProperties = {
  color: "#80b7ff",
  fontSize: "20px",
  margin: 0,
  overflowWrap: "anywhere",
};

const cardStyle: CSSProperties = {
  marginTop: "20px",
  padding: "22px",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  textAlign: "left",
};

const fileInputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  background: "#1b1b1b",
  color: "white",
  border: "2px solid black",
  borderRadius: "10px",
};

const helpTextStyle: CSSProperties = {
  color: "#aaa",
  fontSize: "14px",
  marginBottom: 0,
};

const informationStyle: CSSProperties = {
  marginTop: "20px",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  overflow: "hidden",
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  padding: "20px",
  borderBottom: "1px solid #333",
  textAlign: "left",
  overflowWrap: "anywhere",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: "bold",
  marginBottom: "8px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  background: "#1b1b1b",
  color: "white",
  border: "2px solid black",
  borderRadius: "10px",
  fontSize: "18px",
};

const editButtonStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "14px",
};

const messageStyle: CSSProperties = {
  color: "#9dc5ff",
  textAlign: "center",
};

const buttonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "24px",
};

const buttonStyle: CSSProperties = {
  background: "#222",
  color: "white",
  border: "2px solid black",
  borderRadius: "24px",
  padding: "13px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background:
    "linear-gradient(90deg, #ff5577, #ff7a00)",
};

const primaryLinkStyle: CSSProperties = {
  display: "block",
  background:
    "linear-gradient(90deg, #ff5577, #ff7a00)",
  color: "white",
  textDecoration: "none",
  border: "2px solid black",
  borderRadius: "24px",
  padding: "13px 20px",
  fontWeight: "bold",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  color: "#ccc",
  textDecoration: "none",
  marginTop: "24px",
}; 
