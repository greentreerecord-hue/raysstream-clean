"use client";

import { useEffect, useState } from "react";

type Viewer = {
  id: number;
  fullName: string;
  username: string;
  email: string;
};

export default function ViewerDashboard() {
  const [viewer, setViewer] = useState<Viewer | null>(
    null
  );
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const viewerId = localStorage.getItem(
      "raysstreamViewerId"
    );
    const viewerName = localStorage.getItem(
      "raysstreamViewerName"
    );
    const viewerUsername = localStorage.getItem(
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

    const savedViewer = {
      id: Number(viewerId),
      fullName: viewerName,
      username: viewerUsername,
      email: viewerEmail,
    };

    setViewer(savedViewer);
    setFullName(viewerName);
  }, []);

  async function saveProfile() {
    if (!viewer) {
      return;
    }

    const cleanedName = fullName.trim();

    if (!cleanedName) {
      setMessage("Please enter your full name.");
      return;
    }

    try {
      setSaving(true);
      setMessage("Saving profile...");

      const response = await fetch(
        "/api/viewer-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            viewerId: viewer.id,
            fullName: cleanedName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Unable to update profile."
        );
        return;
      }

      const updatedViewer = {
        ...viewer,
        fullName: data.viewer.fullName,
      };

      setViewer(updatedViewer);
      setFullName(data.viewer.fullName);

      localStorage.setItem(
        "raysstreamViewerName",
        data.viewer.fullName
      );

      localStorage.setItem(
        "raysstreamViewer",
        JSON.stringify(updatedViewer)
      );

      setEditing(false);
      setMessage("Your name has been updated.");
    } catch (error) {
      console.error("Profile update error:", error);

      setMessage(
        "Unable to connect to the database."
      );
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    localStorage.removeItem("raysstreamViewer");
    localStorage.removeItem("raysstreamViewerId");
    localStorage.removeItem("raysstreamViewerName");
    localStorage.removeItem(
      "raysstreamViewerUsername"
    );
    localStorage.removeItem("raysstreamViewerEmail");

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
    viewer.fullName.charAt(0).toUpperCase() || "V";

  return (
    <main style={pageStyle}>
      <section style={dashboardStyle}>
        <h1
          style={{
            fontSize: "48px",
            margin: "0 0 28px",
          }}
        >
          Ray&apos;sStream
        </h1>

        <p style={accountLabelStyle}>
          VIEWER ACCOUNT
        </p>

        <h2
          style={{
            fontSize: "42px",
            margin: "8px 0",
          }}
        >
          Viewer Dashboard
        </h2>

        <p
          style={{
            color: "#9dc5ff",
            fontSize: "22px",
            marginBottom: "30px",
          }}
        >
          Welcome, <strong>{viewer.fullName}!</strong>
        </p>

        <div style={profileHeaderStyle}>
          <div style={avatarStyle}>{initial}</div>

          <div>
            <h3
              style={{
                fontSize: "28px",
                margin: "0 0 8px",
              }}
            >
              {viewer.fullName}
            </h3>

            <p
              style={{
                color: "#80b7ff",
                fontSize: "20px",
                margin: 0,
              }}
            >
              @{viewer.username}
            </p>
          </div>
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
          <div style={editBoxStyle}>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Edit Full Name
            </label>

            <input
              id="fullName"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              maxLength={100}
              style={inputStyle}
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "14px",
              }}
            >
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
                  setFullName(viewer.fullName);
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
          <p
            style={{
              color: "#9dc5ff",
              textAlign: "center",
            }}
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
              setEditing(true);
              setMessage("");
            }}
            style={buttonStyle}
          >
            Edit Profile
          </button>

          <button onClick={logout} style={buttonStyle}>
            Logout
          </button>
        </div>

        <a
          href="/"
          style={{
            display: "inline-block",
            color: "#ccc",
            textDecoration: "none",
            marginTop: "24px",
          }}
        >
          ← Back to Home
        </a>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  fontFamily: "Arial, sans-serif",
  display: "flex",
  justifyContent: "center",
  padding: "40px 20px",
  boxSizing: "border-box" as const,
};

const dashboardStyle = {
  width: "min(850px, 100%)",
  textAlign: "center" as const,
};

const accountLabelStyle = {
  color: "#ff6347",
  fontWeight: "bold",
  letterSpacing: "4px",
};

const profileHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  textAlign: "left" as const,
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  padding: "24px",
};

const avatarStyle = {
  width: "92px",
  height: "92px",
  borderRadius: "50%",
  background:
    "linear-gradient(135deg, #ff5577, #ff7a00)",
  display: "grid",
  placeItems: "center",
  fontSize: "38px",
  fontWeight: "bold",
};

const informationStyle = {
  marginTop: "20px",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  overflow: "hidden",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap" as const,
  gap: "12px",
  padding: "20px",
  borderBottom: "1px solid #333",
  textAlign: "left" as const,
};

const editBoxStyle = {
  marginTop: "20px",
  padding: "22px",
  background: "#121212",
  border: "2px solid black",
  borderRadius: "18px",
  textAlign: "left" as const,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px",
  background: "#1b1b1b",
  color: "white",
  border: "2px solid black",
  borderRadius: "10px",
  fontSize: "18px",
};

const buttonGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "24px",
};

const buttonStyle = {
  background: "#222",
  color: "white",
  border: "2px solid black",
  borderRadius: "24px",
  padding: "13px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

const primaryButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(90deg, #ff5577, #ff7a00)",
};

const primaryLinkStyle = {
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
