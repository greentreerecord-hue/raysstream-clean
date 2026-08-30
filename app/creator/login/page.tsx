"use client";

import { useState } from "react";

export default function CreatorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Login failed."
        );
        setLoading(false);
        return;
      }

      window.location.href =
        "/creator/dashboard";
    } catch {
      setMessage(
        "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: "18px",
          padding: "32px",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "34px",
          }}
        >
          Ray&apos;sStream
        </h1>

        <h2
          style={{
            margin: "0 0 24px",
            color: "#d0d0d0",
          }}
        >
          Creator Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "bold",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #444",
                background: "#1c1c1c",
                color: "white",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "bold",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #444",
                background: "#1c1c1c",
                color: "white",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#000000",
              fontWeight: "bold",
              fontSize: "17px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Logging In..."
              : "Creator Login"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#ff8a8a",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
} 
