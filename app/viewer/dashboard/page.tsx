"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Viewer = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export default function ViewerDashboardPage() {
  const router = useRouter();

  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedViewer = localStorage.getItem("raysstreamViewer");

    if (!savedViewer) {
      router.replace("/viewer/login");
      return;
    }

    try {
      const parsedViewer = JSON.parse(savedViewer) as Viewer;

      if (
        !parsedViewer.id ||
        !parsedViewer.name ||
        !parsedViewer.username ||
        !parsedViewer.email
      ) {
        throw new Error("Invalid viewer account");
      }

      setViewer(parsedViewer);
      setLoading(false);
    } catch {
      localStorage.removeItem("raysstreamViewer");
      localStorage.removeItem("raysstreamViewerId");
      localStorage.removeItem("raysstreamViewerName");
      localStorage.removeItem("raysstreamViewerUsername");
      localStorage.removeItem("raysstreamViewerEmail");

      router.replace("/viewer/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("raysstreamViewer");
    localStorage.removeItem("raysstreamViewerId");
    localStorage.removeItem("raysstreamViewerName");
    localStorage.removeItem("raysstreamViewerUsername");
    localStorage.removeItem("raysstreamViewerEmail");

    router.push("/");
  }

  if (loading || !viewer) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.loadingText}>Loading viewer account...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <Link href="/" style={styles.logoLink}>
          Ray&apos;sStream
        </Link>

        <p style={styles.eyebrow}>VIEWER ACCOUNT</p>

        <h1 style={styles.heading}>Viewer Dashboard</h1>

        <p style={styles.welcome}>
          Welcome, <strong>{viewer.name}</strong>!
        </p>

        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {viewer.name.charAt(0).toUpperCase()}
          </div>

          <div style={styles.profileDetails}>
            <h2 style={styles.name}>{viewer.name}</h2>
            <p style={styles.username}>@{viewer.username}</p>
          </div>
        </div>

        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span style={styles.label}>Full Name</span>
            <span style={styles.value}>{viewer.name}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.label}>Username</span>
            <span style={styles.value}>@{viewer.username}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{viewer.email}</span>
          </div>
        </div>

        <div style={styles.actions}>
          <Link href="/" style={styles.primaryButton}>
            Watch Videos
          </Link>

          <button type="button" onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        <Link href="/" style={styles.backLink}>
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at top, #273353 0%, #111827 42%, #05070d 100%)",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "650px",
    padding: "38px",
    borderRadius: "24px",
    border: "2px solid #000000",
    background: "rgba(28, 37, 61, 0.96)",
    boxShadow: "0 22px 60px rgba(0, 0, 0, 0.45)",
    textAlign: "center",
  },

  logoLink: {
    display: "inline-block",
    marginBottom: "24px",
    color: "#ffffff",
    fontSize: "42px",
    fontWeight: 800,
    textDecoration: "none",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#fb7185",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "2px",
  },

  heading: {
    margin: "0 0 12px",
    fontSize: "34px",
  },

  welcome: {
    margin: "0 0 28px",
    color: "#cbd5e1",
    fontSize: "18px",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "20px",
    marginBottom: "22px",
    borderRadius: "18px",
    border: "2px solid #000000",
    background: "#111827",
    textAlign: "left",
  },

  avatar: {
    width: "72px",
    height: "72px",
    flexShrink: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    border: "2px solid #000000",
    background: "linear-gradient(135deg, #fb7185, #f97316)",
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: 800,
  },

  profileDetails: {
    minWidth: 0,
  },

  name: {
    margin: "0 0 6px",
    fontSize: "24px",
    overflowWrap: "anywhere",
  },

  username: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "17px",
    overflowWrap: "anywhere",
  },

  details: {
    marginBottom: "24px",
    overflow: "hidden",
    borderRadius: "18px",
    border: "2px solid #000000",
    background: "#111827",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "17px 20px",
    borderBottom: "1px solid #334155",
    textAlign: "left",
  },

  label: {
    color: "#94a3b8",
    fontWeight: 700,
  },

  value: {
    color: "#ffffff",
    fontWeight: 700,
    textAlign: "right",
    overflowWrap: "anywhere",
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "22px",
  },

  primaryButton: {
    padding: "15px 18px",
    borderRadius: "999px",
    border: "2px solid #000000",
    background: "linear-gradient(135deg, #fb7185, #f97316)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    textDecoration: "none",
    textAlign: "center",
  },

  logoutButton: {
    padding: "15px 18px",
    borderRadius: "999px",
    border: "2px solid #000000",
    background: "#334155",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
  },

  backLink: {
    color: "#cbd5e1",
    fontWeight: 700,
    textDecoration: "none",
  },

  loadingText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "18px",
  },
}; 
