"use client";

import { useState } from "react";

export default function ViewerLoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function logIn(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoggingIn(true);
      setMessage("Logging in...");

      const response = await fetch(
        "/api/viewer-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Unable to log in."
        );
        return;
      }

      localStorage.setItem(
        "raysstreamViewer",
        JSON.stringify(data.viewer)
      );

      localStorage.setItem(
        "raysstreamViewerId",
        String(data.viewer.id)
      );

      localStorage.setItem(
        "raysstreamViewerName",
        String(data.viewer.name)
      );

      localStorage.setItem(
        "raysstreamViewerUsername",
        String(data.viewer.username)
      );

      localStorage.setItem(
        "raysstreamViewerEmail",
        String(data.viewer.email)
      );

      setMessage(
        `Welcome to Ray'sStream, ${data.viewer.name}!`
      );

      window.setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Viewer login error:", error);

      setMessage(
        "Unable to connect to the login system."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          width: "min(520px, 100%)",
          margin: "0 auto",
          padding: "28px",
          boxSizing: "border-box",
          background: "#121212",
          border: "2px solid black",
          borderRadius: "18px",
        }}
      >
        <a
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              fontSize: "38px",
              margin: "0 0 8px",
            }}
          >
            Ray&apos;sStream
          </h1>
        </a>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Viewer Login
        </h2>

        <p
          style={{
            color: "#bbb",
            textAlign: "center",
            marginBottom: "26px",
          }}
        >
          Log in with your username or email.
        </p>

        <form onSubmit={logIn}>
          <label style={labelStyle}>
            Username or Email
          </label>

          <input
            type="text"
            value={login}
            onChange={(event) =>
              setLogin(event.target.value)
            }
            placeholder="Enter username or email"
            required
            autoCapitalize="none"
            style={inputStyle}
          />

          <label style={labelStyle}>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loggingIn}
            style={{
              ...buttonStyle,
              width: "100%",
              marginTop: "8px",
              opacity: loggingIn ? 0.65 : 1,
            }}
          >
            {loggingIn
              ? "Logging In..."
              : "Viewer Login"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px",
              textAlign: "center",
              background: "#1b1b1b",
              border: "2px solid black",
              borderRadius: "10px",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            marginTop: "22px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#bbb" }}>
            Don&apos;t have a viewer account?
          </p>

          <a
            href="/viewer/signup"
            style={{
              ...buttonStyle,
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            Create Viewer Account
          </a>
        </div>

        <div
          style={{
            marginTop: "22px",
            textAlign: "center",
          }}
        >
          <a href="/" style={homeLinkStyle}>
            ← Back to Home
          </a>
        </div>
      </section>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "16px",
  boxSizing: "border-box" as const,
  borderRadius: "10px",
  border: "2px solid black",
  background: "#1b1b1b",
  color: "white",
  fontSize: "16px",
};

const buttonStyle = {
  background: "#2b2b2b",
  color: "white",
  border: "2px solid black",
  padding: "12px 18px",
  borderRadius: "20px",
  cursor: "pointer",
  fontWeight: "bold",
};

const homeLinkStyle = {
  color: "#bbb",
  textDecoration: "none",
  fontWeight: "bold",
}; 
