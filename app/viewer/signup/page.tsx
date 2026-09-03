"use client";

import { useState } from "react";

export default function ViewerSignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [accountCreated, setAccountCreated] =
    useState(false);

  async function createAccount(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setCreating(true);
      setMessage("Creating your account...");

      const response = await fetch(
        "/api/viewer-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Unable to create viewer account."
        );
        return;
      }

      setAccountCreated(true);
      setMessage(
        "Viewer account created successfully!"
      );

      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Viewer signup error:",
        error
      );

      setMessage(
        "Unable to connect to the signup system."
      );
    } finally {
      setCreating(false);
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
          Viewer Sign Up
        </h2>

        <p
          style={{
            color: "#bbb",
            textAlign: "center",
            marginBottom: "26px",
          }}
        >
          Create an account to like, comment, and
          personalize your Ray&apos;sStream experience.
        </p>

        <form onSubmit={createAccount}>
          <label style={labelStyle}>
            Full Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your full name"
            required
            maxLength={100}
            style={inputStyle}
          />

          <label style={labelStyle}>
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Choose a username"
            required
            minLength={3}
            maxLength={50}
            autoCapitalize="none"
            style={inputStyle}
          />

          <label style={labelStyle}>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
            maxLength={320}
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
            placeholder="At least 6 characters"
            required
            minLength={6}
            style={inputStyle}
          />

          <label style={labelStyle}>
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Enter your password again"
            required
            minLength={6}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={creating}
            style={{
              ...buttonStyle,
              width: "100%",
              marginTop: "8px",
              opacity: creating ? 0.65 : 1,
            }}
          >
            {creating
              ? "Creating Account..."
              : "Create Viewer Account"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px",
              textAlign: "center",
              background: accountCreated
                ? "#173b25"
                : "#2a2020",
              border: "2px solid black",
              borderRadius: "10px",
            }}
          >
            {message}
          </div>
        )}

        {accountCreated && (
          <a
            href="/viewer/login"
            style={{
              ...buttonStyle,
              display: "block",
              textAlign: "center",
              textDecoration: "none",
              marginTop: "12px",
            }}
          >
            Continue to Viewer Login
          </a>
        )}

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
