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
  const [loadingCreator, setLoadingCreator] =
    useState(true);

  const [subscription, setSubscription] =
    useState<SubscriptionStatus>({
      active: false,
      status: "inactive",
      currentPeriodEnd: null,
    });

  const [
    checkingSubscription,
    setCheckingSubscription,
  ] = useState(true);

  const [startingCheckout, setStartingCheckout] =
    useState(false);

  const [openingPortal, setOpeningPortal] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  useEffect(() => {
    async function loadCreator() {
      try {
        const sessionResponse = await fetch(
          "/api/creator-session",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        if (!sessionResponse.ok) {
          router.replace("/creator/login");
          return;
        }

        const sessionData =
          await sessionResponse.json();

        const creator = sessionData.creator;

        setCreatorName(creator.name || "");
        setCreatorEmail(creator.email || "");

        const subscriptionResponse =
          await fetch("/api/live-subscription", {
            cache: "no-store",
            credentials: "include",
          });

        if (subscriptionResponse.status === 401) {
          router.replace("/creator/login");
          return;
        }

        const subscriptionData =
          await subscriptionResponse.json();

        if (subscriptionResponse.ok) {
          setSubscription({
            active: Boolean(
              subscriptionData.active
            ),
            status:
              subscriptionData.status ||
              "inactive",
            currentPeriodEnd:
              subscriptionData.currentPeriodEnd ||
              null,
          });
        }
      } catch {
        router.replace("/creator/login");
      } finally {
        setLoadingCreator(false);
        setCheckingSubscription(false);
      }
    }

    loadCreator();
  }, [router]);

  async function logout() {
    try {
      await fetch("/api/creator-session", {
        method: "DELETE",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem(
        "raysstreamCreator"
      );
      localStorage.removeItem(
        "raysstreamCreatorEmail"
      );

      router.push("/creator/login");
    }
  }

  async function openCheckout() {
    if (startingCheckout) {
      return;
    }

    try {
      setStartingCheckout(true);
      setPaymentMessage(
        "Opening secure checkout..."
      );

      const response = await fetch(
        "/api/creator-live-checkout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(
          data.error ||
            "Unable to open Creator Live checkout."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Unable to open Creator Live checkout."
      );
      setStartingCheckout(false);
    }
  }

  async function openBillingPortal() {
    if (openingPortal) {
      return;
    }

    try {
      setOpeningPortal(true);
      setPaymentMessage(
        "Opening subscription management..."
      );

      const response = await fetch(
        "/api/billing-portal",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(
          data.error ||
            "Unable to open subscription management."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Unable to open subscription management."
      );
      setOpeningPortal(false);
    }
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

  if (loadingCreator) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          background: "black",
          fontFamily: "Arial, sans-serif",
          fontSize: "22px",
        }}
      >
        Verifying creator session...
      </main>
    );
  } 
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

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
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

                <button
                  type="button"
                  onClick={openBillingPortal}
                  disabled={openingPortal}
                  style={{
                    padding: "14px 24px",
                    background: "#facc15",
                    color: "black",
                    border: "3px solid white",
                    borderRadius: "24px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: openingPortal
                      ? "wait"
                      : "pointer",
                    opacity: openingPortal
                      ? 0.7
                      : 1,
                  }}
                >
                  {openingPortal
                    ? "Opening..."
                    : "Manage Subscription"}
                </button>
              </div>
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
                disabled={startingCheckout}
                style={{
                  padding: "14px 26px",
                  background: "#22c55e",
                  color: "black",
                  border: "3px solid white",
                  borderRadius: "24px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: startingCheckout
                    ? "wait"
                    : "pointer",
                  opacity: startingCheckout
                    ? 0.7
                    : 1,
                }}
              >
                {startingCheckout
                  ? "Opening Checkout..."
                  : "Get Creator Live"}
              </button>
            </>
          )}

          {paymentMessage && (
            <p
              style={{
                margin: "16px 0 0",
                fontWeight: "bold",
              }}
            >
              {paymentMessage}
            </p>
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
            type="button"
            onClick={() =>
              router.push("/upload")
            }
            style={buttonStyle}
          >
            Upload Video
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/uploaded")
            }
            style={buttonStyle}
          >
            My Uploaded Videos
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/creator/profile")
            }
            style={buttonStyle}
          >
            Creator Profile
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            style={buttonStyle}
          >
            Ray&apos;sStream Home
          </button>

          <button
            type="button"
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
