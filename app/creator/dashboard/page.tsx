"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SubscriptionStatus = {
  active: boolean;
  status: string;
  currentPeriodEnd: string | null;
};

export default function CreatorDashboardPage() {
  const router = useRouter();

  const [creatorName, setCreatorName] =
    useState("");
  const [creatorEmail, setCreatorEmail] =
    useState("");
  const [subscription, setSubscription] =
    useState<SubscriptionStatus>({
      active: false,
      status: "inactive",
      currentPeriodEnd: null,
    });
  const [checkingSubscription, setCheckingSubscription] =
    useState(true);

  useEffect(() => {
    const savedName =
      localStorage.getItem("raysstreamCreator") || "";

    const savedEmail =
      localStorage.getItem(
        "raysstreamCreatorEmail"
      ) || "";

    if (!savedEmail) {
      router.push("/creator/login");
      return;
    }

    setCreatorName(savedName);
    setCreatorEmail(savedEmail);

    async function checkSubscription() {
      try {
        setCheckingSubscription(true);

        const response = await fetch(
          `/api/live-subscription?email=${encodeURIComponent(
            savedEmail
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setSubscription({
            active: Boolean(data.active),
            status: data.status || "inactive",
            currentPeriodEnd:
              data.currentPeriodEnd || null,
          });
        }
      } catch (error) {
        console.error(
          "Unable to check Creator Live subscription:",
          error
        );
      } finally {
        setCheckingSubscription(false);
      }
    }

    checkSubscription();
  }, [router]);

  function logout() {
    localStorage.removeItem("raysstreamCreator");
    localStorage.removeItem(
      "raysstreamCreatorEmail"
    );
    router.push("/creator/login");
  }

  function openCheckout() {
    const checkoutUrl =
      "https://buy.stripe.com/aFa28r08qgwv0Nkcid2Nq04";

    const separator = checkoutUrl.includes("?")
      ? "&"
      : "?";

    window.location.href =
      `${checkoutUrl}${separator}prefilled_email=` +
      encodeURIComponent(creatorEmail);
  }

  const buttonStyle: React.CSSProperties = {
    padding: "14px 20px",
    background: "#111827",
    color: "white",
    border: "3px solid black",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "black",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          border: "4px solid white",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "8px 8px 0 #374151",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            fontSize: "38px",
          }}
        >
          Creator Dashboard
        </h1>

        <p
          style={{
            fontSize: "20px",
            marginBottom: "5px",
          }}
        >
          Welcome,{" "}
          <strong>
            {creatorName || "Creator"}
          </strong>
        </p>

        <p
          style={{
            marginTop: 0,
            color: "#4b5563",
          }}
        >
          {creatorEmail}
        </p>

        <section
          style={{
            marginTop: "30px",
            padding: "28px",
            color: "white",
            textAlign: "center",
            background: subscription.active
              ? "#14532d"
              : "#4c1d95",
            border: "4px solid black",
            borderRadius: "20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "30px",
            }}
          >
            Creator Live
          </h2>

          {checkingSubscription ? (
            <p
              style={{
                margin: 0,
                fontSize: "18px",
              }}
            >
              Checking your subscription...
            </p>
          ) : subscription.active ? (
            <>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                ✓ Your Creator Live subscription is
                active
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/creator/live")
                }
                style={{
                  padding: "14px 30px",
                  background: "#22c55e",
                  color: "black",
                  border: "3px solid white",
                  borderRadius: "24px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Go Live
              </button>
            </>
          ) : (
            <>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "18px",
                }}
              >
                Livestream directly to your
                Ray&apos;sStream audience.
              </p>

              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "25px",
                  fontWeight: "bold",
                }}
              >
                $19.99/month
              </p>

              <button
                type="button"
                onClick={openCheckout}
                style={{
                  padding: "14px 26px",
                  background: "#22c55e",
                  color: "black",
                  border: "3px solid white",
                  borderRadius: "24px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Get Creator Live
              </button>
            </>
          )}
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
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
