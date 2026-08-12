"use client";

import { useState } from "react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setMessage("Creating account...");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not create account.");
        return;
      }

      setMessage(data.message || "Account created successfully!");

      setUsername("");
      setEmail("");
      setPassword("");
    } catch {
      setMessage("Could not connect to the server.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "#111",
          padding: "30px",
          borderRadius: "16px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "34px",
          }}
        >
          Ray&apos;sStream
        </h1>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Creator Sign Up
        </h2>

        <form onSubmit={handleSignup}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #444",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #444",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "24px",
              borderRadius: "8px",
              border: "1px solid #444",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "25px",
              fontSize: "17px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Create Account
          </button>
        </form>

        {message && (
          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          <a
            href="/"
            style={{
              color: "#fff",
            }}
          >
            Back to Ray&apos;sStream
          </a>
        </div>
      </div>
    </main>
  );
} 
