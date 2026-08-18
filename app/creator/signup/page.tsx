"use client";

import { useState } from "react";

export default function CreatorSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

      setMessage("Creator account created successfully!");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setMessage("Something went wrong. Please try again.");
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
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
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
            fontSize: "22px",
            color: "#d0d0d0",
          }}
        >
          Creator Sign Up
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "bold",
              }}
            >
              Creator Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <div style={{ marginBottom: "18px" }}>
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
              onChange={(e) => setEmail(e.target.value)}
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

          <div style={{ marginBottom: "22px" }}>
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
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
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
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Creator Account"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: message.includes("successfully")
                ? "#6ee7a8"
                : "#ff8a8a",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
} 
