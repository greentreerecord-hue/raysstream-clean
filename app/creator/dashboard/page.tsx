"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatorDashboard() {
  const router = useRouter();

  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("raysstreamCreator");
    const email = localStorage.getItem("raysstreamCreatorEmail");

    if (!name || !email) {
      router.push("/creator/login");
      return;
    }

    setCreatorName(name);
    setCreatorEmail(email);
  }, [router]);

  function logout() {
    localStorage.removeItem("raysstreamCreator");
    localStorage.removeItem("raysstreamCreatorEmail");

    router.push("/creator/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          Ray&apos;sStream Creator Dashboard
        </h1>

        <p style={{ color: "#bbbbbb", marginBottom: "30px" }}>
          Welcome, {creatorName}
        </p>

        <div
          style={{
            background: "#151515",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
          }}
        >
          <h2>Creator Account</h2>

          <p>
            <strong>Name:</strong> {creatorName}
          </p>

          <p>
            <strong>Email:</strong> {creatorEmail}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => router.push("/upload")}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Upload Video
          </button>

          <button
            onClick={() => router.push("/uploaded")}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            My Videos
          </button>

          <button
            onClick={() => router.push("/")}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Ray&apos;sStream Home
          </button>

          <button
            onClick={logout}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
} 
