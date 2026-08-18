"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatorDashboard() {
  const router = useRouter();

  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("raysstreamCreator");
    const savedEmail = localStorage.getItem("raysstreamCreatorEmail");

    if (!savedName || !savedEmail) {
      router.push("/creator/login");
      return;
    }

    setCreatorName(savedName);
    setCreatorEmail(savedEmail);
  }, [router]);

  function logout() {
    localStorage.removeItem("raysstreamCreator");
    localStorage.removeItem("raysstreamCreatorEmail");
    router.push("/creator/login");
  }

  const buttonStyle = {
    padding: "14px 18px",
    borderRadius: "10px",
    border: "1px solid #555",
    background: "#1f1f1f",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "50px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#151515",
          padding: "32px",
          borderRadius: "16px",
          border: "1px solid #2d2d2d",
        }}
      >
        <h1
          style={{
            fontSize: "38px",
            marginBottom: "20px",
          }}
        >
          Creator Dashboard
        </h1>

        <h2
          style={{
            fontSize: "26px",
            marginBottom: "12px",
          }}
        >
          Welcome, {creatorName}
        </h2>

        <p
          style={{
            color: "#cccccc",
            fontSize: "17px",
          }}
        >
          <strong>Email:</strong> {creatorEmail}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() => router.push("/upload")}
            style={buttonStyle}
          >
            Upload Video
          </button>

          <button
            onClick={() => router.push("/uploaded")}
            style={buttonStyle}
          >
            My Uploaded Videos
          </button>

          <button
            onClick={() => router.push("/")}
            style={buttonStyle}
          >
            Ray&apos;sStream Home
          </button>

          <button
            onClick={logout}
            style={{
              ...buttonStyle,
              background: "#7a1d1d",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
} 
