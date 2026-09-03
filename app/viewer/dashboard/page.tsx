"use client";

import { useEffect, useState } from "react";

type Viewer = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  profilePictureUrl: string;
};

export default function ViewerDashboard() {
  const [viewer, setViewer] =
    useState<Viewer | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [fullName, setFullName] =
    useState("");

  const [pictureFile, setPictureFile] =
    useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [uploadingPicture, setUploadingPicture] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const viewerId = localStorage.getItem(
      "raysstreamViewerId"
    );

    const viewerName = localStorage.getItem(
      "raysstreamViewerName"
    );

    const viewerUsername =
      localStorage.getItem(
        "raysstreamViewerUsername"
      );

    const viewerEmail = localStorage.getItem(
      "raysstreamViewerEmail"
    );

    if (
      !viewerId ||
      !viewerName ||
      !viewerUsername ||
      !viewerEmail
    ) {
      window.location.href = "/viewer/login";
      return;
    }

    const savedViewer: Viewer = {
      id: Number(viewerId),
      fullName: viewerName,
      username: viewerUsername,
      email: viewerEmail,
      profilePictureUrl:
        localStorage.getItem(
          "raysstreamViewerPicture"
        ) || "",
    };

    setViewer(savedViewer);
    setFullName(savedViewer.fullName);

    async function loadProfile() {
      try {
        const response = await fetch(
          `/api/viewer-profile?viewerId=${viewerId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return;
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

        setViewer(loadedViewer);
        setFullName(loadedViewer.fullName);
        saveViewerLocally(loadedViewer);
      } catch (error) {
        console.error(
          "Unable to load viewer profile:",
          error
        );
      }
    }

    loadProfile();
  }, []);

  function saveViewerLocally(
    updatedViewer: Viewer
  ) {
    localStorage.setItem(
      "raysstreamViewerName",
      updatedViewer.fullName
    );

    localStorage.setItem(
      "raysstreamViewerPicture",
      updatedViewer.profilePictureUrl
    );

    localStorage.setItem(
      "raysstreamViewer",
      JSON.stringify(updatedViewer)
    );
  }

  async function updateProfile(
    updatedName: string,
    updatedPictureUrl: string
  ) {
    if (!viewer) {
      return null;
    }

    const response = await fetch(
      "/api/viewer-profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewerId: viewer.id,
          fullName: updatedName,
          profilePictureUrl:
            updatedPictureUrl,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to update profile."
      );
    }

    const updatedViewer: Viewer = {
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

    setViewer(updatedViewer);
    setFullName(updatedViewer.fullName);
    saveViewerLocally(updatedViewer);

    return updatedViewer;
  }

  async function saveProfile() {
    if (!viewer) {
      return;
    }

    const cleanedName = fullName.trim();

    if (!cleanedName) {
      setMessage(
        "Please enter your full name."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("Saving profile...");

      await updateProfile(
        cleanedName,
        viewer.profilePictureUrl
      );

      setEditing(false);

      setMessage(
        "Your profile has been updated."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

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
    if (!viewer || !pictureFile) {
      setMessage(
        "Please choose a picture first."
      );
      return;
    }

    try {
      setUploadingPicture(true);

      setMessage(
        "Uploading profile picture..."
      );

      const formData = new FormData();

      formData.append(
        "picture",
        pictureFile
      );

      const uploadResponse = await fetch(
        "/api/viewer-picture-upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData =
        await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.error ||
            "Unable to upload profile picture."
        );
      }

      await updateProfile(
        viewer.fullName,
        String(uploadData.url)
      );

      setPictureFile(null);

      setMessage(
        "Your profile picture has been updated."
      );
    } catch (error) {
      console.error(
        "Profile picture error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload profile picture."
      );
    } finally {
      setUploadingPicture(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "raysstreamViewer"
    );

    localStorage.removeItem(
      "raysstreamViewerId"
    );

    localStorage.removeItem(
      "raysstreamViewerName"
    );

    localStorage.removeItem(
      "raysstreamViewerUsername"
    );

    localStorage.removeItem(
      "raysstreamViewerEmail"
    );

    localStorage.removeItem(
      "raysstreamViewerPicture"
    );

    window.location.href = "/viewer/login";
  }

  if (!viewer) {
    return (
      <main style={pageStyle}>
        <p>Loading viewer dashboard...</p>
      </main>
    );
  }

  const initial =
    viewer.fullName
      .charAt(0)
      .toUpperCase() || "V";

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

          <div>
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
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setPictureFile(
                event.target.files?.[0] ||
                  null
              )
            }
            style={fileInputStyle}
          />

          <button
            onClick={uploadPicture}
            disabled={
              uploadingPicture ||
              !pictureFile
            }
            style={{
              ...primaryButtonStyle,
              marginTop: "14px",
              opacity:
                uploadingPicture ||
                !pictureFile
                  ? 0.65
                  : 1,
            }}
          >
            {uploadingPicture
              ? "Uploading..."
              : "Upload Profile Picture"}
          </button>

          <p style={helpTextStyle}>
            JPG, PNG, or WebP. Maximum size:
            4 MB.
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
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
              maxLength={100}
              style={inputStyle}
            />

            <div style={editButtonStyle}>
              <button
                onClick={saveProfile}
                disabled={saving}
                style={primaryButtonStyle}
              >
                {saving
                  ? "Saving..."
                  : "Save Name"}
              </button>

              <button
                onClick={() => {
                  setEditing(false);
                  setFullName(
                    viewer.fullName
                  );
                  setMessage("");
                }}
                disabled={saving}
                style={buttonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <p style={messageStyle}>
            {message}
          </p>
        )}

        <div style={buttonGridStyle}>
          <a
            href="/"
            style={primaryLinkStyle}
          >
            Watch Videos
          </a>

          <button
            onClick={() => {
              setEditing(true);
              setMessage("");
            }}
            style={buttonStyle}
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            style={buttonStyle}
          >
            Logout
          </button>
        </div>

        <a href="/" style={backLinkStyle}>
          ← Back to Home
        </a>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  justifyContent: "center",
  padding: "40px 20px",
  boxSizing: "border-box",
};

const dashboardStyle: React.CSSProperties = {
  width: "min(850px, 100%)",
  textAlign: "center",
};

const logoStyle: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 28px",
};

const accountLabelStyle: React.CSSProperties = {
  color: "#ff6347",
  fontWeight: "bold",
  letterSpacing: "4px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "42px",
  margin: "8px 0",
};

const welcomeStyle: React.CSSProperties = {
  color: "#9dc5ff",
  fontSize: "22px",
  marginBottom: "30px",
};

const profileHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  textAlign: "left",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  padding: "24px",
};

const avatarStyle: React.CSSProperties = {
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

const profilePictureStyle: React.CSSProperties = {
  width: "92px",
  height: "92px",
  flex: "0 0 92px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #ff6347",
  background: "#222",
};

const nameStyle: React.CSSProperties = {
  fontSize: "28px",
  margin: "0 0 8px",
};

const usernameStyle: React.CSSProperties = {
  color: "#80b7ff",
  fontSize: "20px",
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "22px",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  textAlign: "left",
};

const fileInputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  background: "#1b1b1b",
  color: "white",
  border: "2px solid black",
  borderRadius: "10px",
};

const helpTextStyle: React.CSSProperties = {
  color: "#aaa",
  fontSize: "14px",
  marginBottom: 0,
};

const informationStyle: React.CSSProperties = {
  marginTop: "20px",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  overflow: "hidden",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  padding: "20px",
  borderBottom: "1px solid #333",
  textAlign: "left",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "bold",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  background: "#1b1b1b",
  color: "white",
  border: "2px solid black",
  borderRadius: "10px",
  fontSize: "18px",
};

const editButtonStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "14px",
};

const messageStyle: React.CSSProperties = {
  color: "#9dc5ff",
  textAlign: "center",
};

const buttonGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "24px",
};

const buttonStyle: React.CSSProperties = {
  background: "#222",
  color: "white",
  border: "2px solid black",
  borderRadius: "24px",
  padding: "13px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background:
    "linear-gradient(90deg, #ff5577, #ff7a00)",
};

const primaryLinkStyle: React.CSSProperties = {
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

const backLinkStyle: React.CSSProperties = {
  display: "inline-block",
  color: "#ccc",
  textDecoration: "none",
  marginTop: "24px",
}; 
