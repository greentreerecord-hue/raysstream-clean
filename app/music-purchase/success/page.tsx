"use client";

import {
  useEffect,
  useState,
} from "react";

type PurchasedSong = {
  id: number;
  title: string;
  artistName: string;
  genre: string;
  audioUrl: string;
  coverUrl: string;
};

type PurchaseData = {
  paid: boolean;
  buyerEmail: string;
  amountTotalCents: number;
  song: PurchasedSong;
};

export default function MusicPurchaseSuccessPage() {
  const [purchase, setPurchase] =
    useState<PurchaseData | null>(null);

  const [message, setMessage] =
    useState(
      "Verifying your secure payment..."
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function verifyPurchase() {
      try {
        const searchParams =
          new URLSearchParams(
            window.location.search
          );

        const sessionId =
          searchParams.get("session_id");

        if (!sessionId) {
          throw new Error(
            "The purchase session is missing."
          );
        }

        const response = await fetch(
          `/api/music-purchase?session_id=${encodeURIComponent(
            sessionId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to verify the purchase."
          );
        }

        setPurchase(data);
        setMessage(
          "Payment confirmed. Thank you for supporting this artist!"
        );
      } catch (error) {
        setPurchase(null);

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify the purchase."
        );
      } finally {
        setLoading(false);
      }
    }

    verifyPurchase();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "35px 18px",
        color: "white",
        background:
          "linear-gradient(135deg, #030712, #111d4a, #291050)",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(720px, 100%)",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: "28px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, #1664ff, #5922a8)",
            border:
              "4px solid white",
            borderRadius: "22px",
          }}
        >
          <div
            style={{
              fontSize: "70px",
            }}
          >
            {purchase ? "✓" : "🎵"}
          </div>

          <h1
            style={{
              margin: "5px 0 10px",
              fontSize:
                "clamp(34px, 7vw, 52px)",
            }}
          >
            {purchase
              ? "Purchase Complete"
              : "Ray’sStream Music"}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        </header>

        {loading && (
          <section
            style={{
              marginTop: "25px",
              padding: "30px",
              color: "black",
              background: "white",
              border:
                "4px solid #ff8a00",
              borderRadius: "22px",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Checking payment with
            Stripe...
          </section>
        )}

        {!loading && purchase && (
          <section
            style={{
              marginTop: "25px",
              overflow: "hidden",
              color: "black",
              background: "white",
              border:
                "4px solid #22c55e",
              borderRadius: "22px",
              boxShadow:
                "0 15px 35px rgba(0,0,0,.35)",
            }}
          >
            {purchase.song.coverUrl && (
              <img
                src={
                  purchase.song.coverUrl
                }
                alt={`${purchase.song.title} cover artwork`}
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: "430px",
                  objectFit: "cover",
                  background: "#111827",
                }}
              />
            )}

            <div
              style={{
                padding: "25px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  color: "#14532d",
                  background: "#dcfce7",
                  border:
                    "2px solid #22c55e",
                  borderRadius: "999px",
                  fontWeight: 900,
                }}
              >
                PAID
              </span>

              <h2
                style={{
                  margin:
                    "15px 0 5px",
                  fontSize: "36px",
                }}
              >
                {purchase.song.title}
              </h2>

              <p
                style={{
                  margin: "0 0 8px",
                  color: "#5922a8",
                  fontSize: "21px",
                  fontWeight: 900,
                }}
              >
                {
                  purchase.song
                    .artistName
                }
              </p>

              <p
                style={{
                  fontWeight: 700,
                }}
              >
                {purchase.song.genre} · $
                {(
                  purchase.amountTotalCents /
                  100
                ).toFixed(2)}
              </p>

              <audio
                controls
                preload="metadata"
                src={
                  purchase.song.audioUrl
                }
                style={{
                  width: "100%",
                  margin: "12px 0 20px",
                }}
              />

              <a
                href={
                  purchase.song.audioUrl
                }
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding: "15px",
                  color: "black",
                  background: "#22c55e",
                  border:
                    "3px solid black",
                  borderRadius: "13px",
                  textAlign: "center",
                  textDecoration: "none",
                  fontSize: "19px",
                  fontWeight: 900,
                }}
              >
                ⬇ Download Song
              </a>

              {purchase.buyerEmail && (
                <p
                  style={{
                    margin:
                      "18px 0 0",
                    color: "#374151",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  Purchase email:{" "}
                  <strong>
                    {
                      purchase.buyerEmail
                    }
                  </strong>
                </p>
              )}
            </div>
          </section>
        )}

        {!loading && !purchase && (
          <section
            style={{
              marginTop: "25px",
              padding: "28px",
              color: "black",
              background: "#fee2e2",
              border:
                "4px solid #dc2626",
              borderRadius: "22px",
              textAlign: "center",
            }}
          >
            <h2>
              Purchase Not Verified
            </h2>

            <p
              style={{
                lineHeight: 1.6,
              }}
            >
              No download was provided
              because Stripe could not
              confirm a completed payment.
            </p>
          </section>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "25px",
          }}
        >
          <a
            href="/music-shop"
            style={{
              padding: "13px 20px",
              color: "black",
              background: "#ff8a00",
              border:
                "3px solid white",
              borderRadius: "13px",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            ← Return to Music Shop
          </a>

          <a
            href="/"
            style={{
              padding: "13px 20px",
              color: "white",
              background: "#374151",
              border:
                "3px solid white",
              borderRadius: "13px",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Ray’sStream Home
          </a>
        </div>
      </div>
    </main>
  );
} 
