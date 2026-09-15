"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export default function CreatorEmailPage() {
  const router = useRouter();

  const [currentEmail, setCurrentEmail] =
    useState("");
  const [newEmail, setNewEmail] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadCreator() {
      try {
        const response = await fetch(
          "/api/creator-profile",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/creator/login");
          return;
        }

        if (!response.ok) {
          setMessage(
            data.error ||
              "Could not load your account."
          );
          return;
        }

        const email = data.email || "";

        setCurrentEmail(email);
        setNewEmail(email);
      } catch {
        setMessage(
          "Could not load your account."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCreator();
  }, [router]);

  async function updateEmail(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanedEmail =
      newEmail.trim().toLowerCase();

    if (!cleanedEmail) {
      setMessage(
        "Please enter your new email address."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("Updating your email...");

      const response = await fetch(
        "/api/creator-profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: cleanedEmail,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/creator/login");
        return;
      }

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not update your email."
        );
        return;
      }

      setCurrentEmail(data.email);
      setNewEmail(data.email);

      localStorage.setItem(
        "raysstreamCreatorEmail",
        data.email
      );

      setMessage(
        "Your creator email was updated successfully!"
      );
    } catch {
      setMessage(
        "Could not update your email."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        background:
          "linear-gradient(135deg, #050816, #111827)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.push("/creator/profile")
          }
          style={{
            marginBottom: "25px",
            padding: "12px 18px",
            color: "#000000",
            backgroundColor: "#ffffff",
            border: "2px solid #000000",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ← Back to Creator Profile
        </button>

        <section
          style={{
            padding: "30px",
            color: "#111827",
            backgroundColor: "#ffffff",
            border: "2px solid #000000",
            borderRadius: "18px",
            boxShadow:
              "0 18px 45px rgba(0,0,0,0.35)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              fontSize: "38px",
            }}
          >
            Edit Creator Email
          </h1>

          {loading ? (
            <p>Loading your account...</p>
          ) : (
            <>
              <p
                style={{
                  color: "#4b5563",
                  lineHeight: 1.6,
                }}
              >
                Update the email used for your
                creator account, videos, music,
                subscriptions, and payments.
              </p>

              <p
                style={{
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  overflowWrap: "anywhere",
                }}
              >
                <strong>Current email:</strong>{" "}
                {currentEmail}
              </p>

              <form onSubmit={updateEmail}>
                <label
                  htmlFor="new-email"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  New Email Address
                </label>

                <input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(event) =>
                    setNewEmail(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  required
                  autoComplete="email"
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    marginBottom: "18px",
                    padding: "14px",
                    border: "2px solid #374151",
                    borderRadius: "9px",
                    fontSize: "17px",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !newEmail.trim() ||
                    newEmail.trim().toLowerCase() ===
                      currentEmail.toLowerCase()
                  }
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    color: "#ffffff",
                    backgroundColor: saving
                      ? "#9ca3af"
                      : "#2563eb",
                    border: "2px solid #000000",
                    borderRadius: "9px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {saving
                    ? "Updating..."
                    : "Update Email"}
                </button>
              </form>
            </>
          )}

          {message && (
            <p
              style={{
                marginTop: "20px",
                padding: "12px",
                color: "#111827",
                backgroundColor: "#e0f2fe",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
} 
