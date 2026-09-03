"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Viewer = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export default function ViewerLoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!login.trim() || !password) {
      setMessage("Please enter your username or email and password.");
      return;
    }

    try {
      setLoggingIn(true);
      setSuccess(false);
      setMessage("Signing in...");

      const response = await fetch("/api/viewer-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      const viewer = data.viewer as Viewer;

      localStorage.setItem("raysstreamViewer", JSON.stringify(viewer));
      localStorage.setItem("raysstreamViewerId", String(viewer.id));
      localStorage.setItem("raysstreamViewerName", viewer.name);
      localStorage.setItem("raysstreamViewerUsername", viewer.username);
      localStorage.setItem("raysstreamViewerEmail", viewer.email);

      setSuccess(true);
      setMessage(`Welcome back, ${viewer.name}!`);

      window.setTimeout(() => {
        router.push("/viewer/dashboard");
      }, 1000);
    } catch (error) {
      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <Link href="/" style={styles.logoLink}>
          Ray&apos;sStream
        </Link>

        <h1 style={styles.heading}>Viewer Login</h1>

        <p style={styles.description}>
          Sign in to like, comment, and personalize your Ray&apos;sStream
          experience.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Username or Email
            <input
              type="text"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="Enter your username or email"
              autoComplete="username"
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              style={styles.input}
            />
          </label>

          <button
            type="submit"
            disabled={loggingIn}
            style={{
              ...styles.button,
              opacity: loggingIn ? 0.65 : 1,
              cursor: loggingIn ? "not-allowed" : "pointer",
            }}
          >
            {loggingIn ? "Signing In..." : "Viewer Login"}
          </button>
        </form>

        {message && (
          <div
            style={{
              ...styles.message,
              background: success
                ? "rgba(20, 184, 166, 0.22)"
                : "rgba(239, 68, 68, 0.18)",
              borderColor: success ? "#2dd4bf" : "#fb7185",
            }}
          >
            {message}
          </div>
        )}

        <p style={styles.signupText}>
          Don&apos;t have a viewer account?{" "}
          <Link href="/viewer/signup" style={styles.signupLink}>
            Create one
          </Link>
        </p>

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
    maxWidth: "620px",
    padding: "38px",
    borderRadius: "24px",
    border: "2px solid #000000",
    background: "rgba(28, 37, 61, 0.96)",
    boxShadow: "0 22px 60px rgba(0, 0, 0, 0.45)",
    textAlign: "center",
  },

  logoLink: {
    display: "inline-block",
    marginBottom: "26px",
    color: "#ffffff",
    fontSize: "42px",
    fontWeight: 800,
    textDecoration: "none",
  },

  heading: {
    margin: "0 0 12px",
    fontSize: "34px",
  },

  description: {
    margin: "0 auto 28px",
    maxWidth: "500px",
    color: "#cbd5e1",
    fontSize: "17px",
    lineHeight: 1.5,
  },

  form: {
    display: "grid",
    gap: "20px",
    textAlign: "left",
  },

  label: {
    display: "grid",
    gap: "9px",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: 800,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 17px",
    borderRadius: "13px",
    border: "2px solid #000000",
    outline: "none",
    background: "#e5e7eb",
    color: "#111827",
    fontSize: "16px",
  },

  button: {
    width: "100%",
    padding: "16px 20px",
    marginTop: "4px",
    borderRadius: "999px",
    border: "2px solid #000000",
    background: "linear-gradient(135deg, #fb7185, #f97316)",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: 800,
  },

  message: {
    marginTop: "22px",
    padding: "14px 16px",
    border: "2px solid",
    borderRadius: "13px",
    color: "#ffffff",
    fontWeight: 700,
  },

  signupText: {
    margin: "24px 0 18px",
    color: "#cbd5e1",
  },

  signupLink: {
    color: "#fb7185",
    fontWeight: 800,
    textDecoration: "none",
  },

  backLink: {
    color: "#cbd5e1",
    fontWeight: 700,
    textDecoration: "none",
  },
}; 
