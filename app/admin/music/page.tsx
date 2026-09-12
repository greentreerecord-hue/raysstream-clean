"use client";

import { useEffect, useState } from "react";

type Release = {
  id: number;
  creator_email: string;
  title: string;
  artist_name: string;
  genre: string;
  price_cents: number;
  audio_url: string;
  cover_url: string;
  rights_confirmed: boolean;
  review_status: string;
  published: boolean;
  created_at: string;
};

export default function AdminMusicPage() {
  const [password, setPassword] = useState("");
  const [releases, setReleases] = useState<Release[]>([]);
  const [message, setMessage] = useState(
    "Enter the administrator password to review music."
  );
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  useEffect(() => {
    const saved =
      sessionStorage.getItem(
        "raysstreamAdminMusicPassword"
      ) ?? "";

    if (saved) {
      setPassword(saved);
      loadReleases(saved);
    }
  }, []);

  async function loadReleases(
    suppliedPassword = password
  ) {
    if (!suppliedPassword.trim()) {
      setMessage(
        "Enter the administrator password."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("Loading music releases...");

      const response = await fetch(
        "/api/admin/music",
        {
          method: "GET",
          headers: {
            "x-admin-password": suppliedPassword,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to load music releases."
        );
      }

      sessionStorage.setItem(
        "raysstreamAdminMusicPassword",
        suppliedPassword
      );

      setReleases(data.releases ?? []);
      setMessage(
        data.releases?.length
          ? "Music releases loaded."
          : "There are no music releases to review."
      );
    } catch (error) {
      setReleases([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load music releases."
      );
    } finally {
      setLoading(false);
    }
  }

  async function reviewRelease(
    id: number,
    action: "approve" | "reject"
  ) {
    const label =
      action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${label} this song?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(id);
      setMessage(
        action === "approve"
          ? "Approving and publishing song..."
          : "Rejecting song..."
      );

      const response = await fetch(
        "/api/admin/music",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": password,
          },
          body: JSON.stringify({
            id,
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to update music release."
        );
      }

      setMessage(data.message);
      await loadReleases(password);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update music release."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const pending = releases.filter(
    (release) =>
      release.review_status === "pending"
  );

  const reviewed = releases.filter(
    (release) =>
      release.review_status !== "pending"
  );

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.navigation}>
          <a href="/admin/dashboard" style={styles.link}>
            ← Admin Dashboard
          </a>

          <a href="/music-shop" style={styles.shopLink}>
            🎵 Music Shop
          </a>
        </nav>

        <header style={styles.header}>
          <div style={styles.icon}>🛡️</div>

          <div>
            <h1 style={styles.heading}>
              Admin Music Review
            </h1>

            <p style={styles.subtitle}>
              Preview, approve, publish, or reject
              creator music.
            </p>
          </div>
        </header>

        <section style={styles.loginPanel}>
          <label style={styles.label}>
            Administrator password
          </label>

          <div style={styles.loginRow}>
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadReleases();
                }
              }}
              placeholder="Enter administrator password"
              style={styles.input}
            />

            <button
              type="button"
              onClick={() => loadReleases()}
              disabled={loading}
              style={styles.loadButton}
            >
              {loading ? "Loading..." : "Load Reviews"}
            </button>
          </div>

          <p style={styles.message}>{message}</p>
        </section>

        <section>
          <h2 style={styles.sectionHeading}>
            Pending Review ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div style={styles.empty}>
              No songs are waiting for review.
            </div>
          ) : (
            <div style={styles.grid}>
              {pending.map((release) => (
                <ReleaseCard
                  key={release.id}
                  release={release}
                  updating={
                    updatingId === release.id
                  }
                  onApprove={() =>
                    reviewRelease(
                      release.id,
                      "approve"
                    )
                  }
                  onReject={() =>
                    reviewRelease(
                      release.id,
                      "reject"
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={styles.sectionHeading}>
            Review History ({reviewed.length})
          </h2>

          {reviewed.length > 0 && (
            <div style={styles.grid}>
              {reviewed.map((release) => (
                <ReleaseCard
                  key={release.id}
                  release={release}
                  updating={
                    updatingId === release.id
                  }
                  onApprove={() =>
                    reviewRelease(
                      release.id,
                      "approve"
                    )
                  }
                  onReject={() =>
                    reviewRelease(
                      release.id,
                      "reject"
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ReleaseCard({
  release,
  updating,
  onApprove,
  onReject,
}: {
  release: Release;
  updating: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article style={styles.card}>
      <img
        src={release.cover_url}
        alt={`${release.title} cover`}
        style={styles.cover}
      />

      <div style={styles.cardBody}>
        <div style={styles.status}>
          {release.review_status.toUpperCase()}
        </div>

        <h3 style={styles.songTitle}>
          {release.title}
        </h3>

        <p style={styles.artist}>
          {release.artist_name}
        </p>

        <p style={styles.details}>
          Genre: {release.genre}
          <br />
          Price: $
          {(release.price_cents / 100).toFixed(2)}
          <br />
          Creator: {release.creator_email}
          <br />
          Rights confirmed:{" "}
          {release.rights_confirmed ? "Yes" : "No"}
          <br />
          Published:{" "}
          {release.published ? "Yes" : "No"}
        </p>

        <audio
          controls
          preload="metadata"
          src={release.audio_url}
          style={styles.audio}
        />

        <div style={styles.actions}>
          <button
            type="button"
            onClick={onApprove}
            disabled={updating}
            style={styles.approveButton}
          >
            ✓ Approve & Publish
          </button>

          <button
            type="button"
            onClick={onReject}
            disabled={updating}
            style={styles.rejectButton}
          >
            ✕ Reject
          </button>
        </div>
      </div>
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #050816, #151142, #45104f)",
    color: "white",
    padding: "28px 18px 60px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    width: "min(1180px, 100%)",
    margin: "0 auto",
  },
  navigation: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 24,
  },
  link: {
    color: "white",
    border: "3px solid white",
    borderRadius: 16,
    padding: "12px 18px",
    textDecoration: "none",
    fontWeight: 800,
  },
  shopLink: {
    color: "#111",
    background: "#ff9d00",
    border: "3px solid white",
    borderRadius: 16,
    padding: "12px 18px",
    textDecoration: "none",
    fontWeight: 800,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: 26,
    border: "4px solid white",
    borderRadius: 24,
    background:
      "linear-gradient(90deg, #46178f, #c91d4a)",
    marginBottom: 24,
  },
  icon: {
    fontSize: 58,
  },
  heading: {
    margin: 0,
    fontSize: "clamp(32px, 6vw, 58px)",
  },
  subtitle: {
    margin: "10px 0 0",
    fontSize: 18,
    fontWeight: 700,
  },
  loginPanel: {
    background: "white",
    color: "#111",
    border: "4px solid #ff9d00",
    borderRadius: 22,
    padding: 22,
    marginBottom: 30,
  },
  label: {
    display: "block",
    fontWeight: 800,
    marginBottom: 8,
  },
  loginRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  input: {
    flex: "1 1 300px",
    border: "3px solid #111",
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
  },
  loadButton: {
    background: "#1565c0",
    color: "white",
    border: "3px solid #111",
    borderRadius: 12,
    padding: "12px 22px",
    fontSize: 17,
    fontWeight: 800,
    cursor: "pointer",
  },
  message: {
    margin: "16px 0 0",
    padding: 12,
    background: "#e6f5ff",
    borderRadius: 10,
    fontWeight: 700,
  },
  sectionHeading: {
    fontSize: 30,
    margin: "30px 0 16px",
  },
  empty: {
    background: "white",
    color: "#111",
    border: "3px solid #ff9d00",
    borderRadius: 18,
    padding: 24,
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(290px, 1fr))",
    gap: 20,
  },
  card: {
    overflow: "hidden",
    background: "white",
    color: "#111",
    border: "4px solid #ff9d00",
    borderRadius: 20,
  },
  cover: {
    width: "100%",
    height: 260,
    objectFit: "cover",
    background: "#ddd",
  },
  cardBody: {
    padding: 20,
  },
  status: {
    display: "inline-block",
    background: "#efefef",
    border: "2px solid #111",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 900,
  },
  songTitle: {
    margin: "14px 0 4px",
    fontSize: 28,
  },
  artist: {
    margin: 0,
    fontSize: 19,
    fontWeight: 700,
    color: "#512da8",
  },
  details: {
    lineHeight: 1.7,
    overflowWrap: "anywhere",
  },
  audio: {
    width: "100%",
    margin: "8px 0 16px",
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  approveButton: {
    flex: "1 1 170px",
    background: "#18b85a",
    color: "#08130c",
    border: "3px solid #111",
    borderRadius: 12,
    padding: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  rejectButton: {
    flex: "1 1 110px",
    background: "#dc2626",
    color: "white",
    border: "3px solid #111",
    borderRadius: 12,
    padding: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
}; 
