"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";

type CreatorSessionResponse = {
  creator?: {
    name?: string;
    email?: string;
  };
};

type MusicRelease = {
  id: number;
  artistName: string;
  title: string;
  genre: string;
  priceCents: number;
  audioUrl: string;
  coverUrl: string;
  reviewStatus: string;
  published: boolean;
};

type StripeStatus = {
  connected: boolean;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  accountId?: string;
};

function safePath(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreatorMusicPage() {
  const router = useRouter();

  const [creatorName, setCreatorName] =
    useState("");

  const [creatorEmail, setCreatorEmail] =
    useState("");

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [stripeStatus, setStripeStatus] =
    useState<StripeStatus | null>(null);

  const [checkingStripe, setCheckingStripe] =
    useState(true);

  const [startingStripe, setStartingStripe] =
    useState(false);

  const [stripeMessage, setStripeMessage] =
    useState("");

  const [title, setTitle] = useState("");

  const [artistName, setArtistName] =
    useState("");

  const [genre, setGenre] = useState("Pop");

  const [price, setPrice] = useState("0.99");

  const [audioFile, setAudioFile] =
    useState<File | null>(null);

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [ownsRights, setOwnsRights] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] = useState("");

  const [releases, setReleases] =
    useState<MusicRelease[]>([]);

  async function loadMyReleases() {
    try {
      const response = await fetch(
        "/api/music?mine=true",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setReleases(data.songs || []);
    } catch (error) {
      console.error(
        "Unable to load music releases:",
        error
      );
    }
  }

  async function loadStripeStatus() {
    try {
      setCheckingStripe(true);

      const response = await fetch(
        "/api/stripe-connect",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to check payout status."
        );
      }

      setStripeStatus(data);
      setStripeMessage("");
    } catch (error) {
      console.error(
        "Unable to check Stripe status:",
        error
      );

      setStripeMessage(
        error instanceof Error
          ? error.message
          : "Unable to check payout status."
      );
    } finally {
      setCheckingStripe(false);
    }
  }

  useEffect(() => {
    async function verifyCreator() {
      try {
        const response = await fetch(
          "/api/creator-session",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        if (!response.ok) {
          router.replace("/creator/login");
          return;
        }

        const data =
          (await response.json()) as CreatorSessionResponse;

        const name =
          data.creator?.name?.trim() || "";

        const email =
          data.creator?.email?.trim() || "";

        if (!email) {
          router.replace("/creator/login");
          return;
        }

        setCreatorName(name);
        setCreatorEmail(email);
        setArtistName(name);

        await Promise.all([
          loadMyReleases(),
          loadStripeStatus(),
        ]);
      } catch {
        router.replace("/creator/login");
      } finally {
        setCheckingSession(false);
      }
    }

    verifyCreator();
  }, [router]);

  async function startStripeSetup() {
    try {
      setStartingStripe(true);
      setStripeMessage(
        "Opening secure Stripe payout setup..."
      );

      const response = await fetch(
        "/api/stripe-connect",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to start Stripe payout setup."
        );
      }

      if (!data.url) {
        throw new Error(
          "Stripe did not return a setup link."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(
        "Stripe payout setup error:",
        error
      );

      setStripeMessage(
        error instanceof Error
          ? error.message
          : "Unable to start Stripe payout setup."
      );

      setStartingStripe(false);
    }
  }

  async function submitSong(event: FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Enter the song title.");
      return;
    }

    if (!artistName.trim()) {
      setMessage("Enter the artist name.");
      return;
    }

    if (!audioFile) {
      setMessage("Choose the song audio file.");
      return;
    }

    if (!coverFile) {
      setMessage("Choose the cover artwork.");
      return;
    }

    const priceNumber = Number(price);

    if (
      !Number.isFinite(priceNumber) ||
      priceNumber < 0.5 ||
      priceNumber > 100
    ) {
      setMessage(
        "Enter a price between $0.50 and $100.00."
      );
      return;
    }

    if (!ownsRights) {
      setMessage(
        "You must confirm that you own or license all rights."
      );
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading song audio...");

      const emailPath =
        safePath(creatorEmail);

      const timestamp = Date.now();

      const audioName =
        safePath(audioFile.name) ||
        "song-audio";

      const coverName =
        safePath(coverFile.name) ||
        "cover-artwork";

      const audioBlob = await upload(
        `music/${emailPath}/${timestamp}-${audioName}`,
        audioFile,
        {
          access: "public",
          handleUploadUrl:
            "/api/music-upload",
        }
      );

      setMessage("Uploading cover artwork...");

      const coverBlob = await upload(
        `music/${emailPath}/${timestamp}-${coverName}`,
        coverFile,
        {
          access: "public",
          handleUploadUrl:
            "/api/music-upload",
        }
      );

      setMessage(
        "Saving song information..."
      );

      const saveResponse = await fetch(
        "/api/music",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            artistName:
              artistName.trim(),
            genre,
            priceCents: Math.round(
              priceNumber * 100
            ),
            audioUrl: audioBlob.url,
            audioPathname:
              audioBlob.pathname,
            coverUrl: coverBlob.url,
            coverPathname:
              coverBlob.pathname,
            rightsConfirmed: true,
          }),
        }
      );

      const saveData =
        await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData.error ||
            "Unable to save the song."
        );
      }

      setMessage(
        "Song uploaded successfully and submitted for administrator review."
      );

      setTitle("");
      setPrice("0.99");
      setAudioFile(null);
      setCoverFile(null);
      setOwnsRights(false);

      const audioInput =
        document.getElementById(
          "music-audio-file"
        ) as HTMLInputElement | null;

      const coverInput =
        document.getElementById(
          "music-cover-file"
        ) as HTMLInputElement | null;

      if (audioInput) {
        audioInput.value = "";
      }

      if (coverInput) {
        coverInput.value = "";
      }

      await loadMyReleases();
    } catch (error) {
      console.error(
        "Music upload error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload the song."
      );
    } finally {
      setUploading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    marginTop: "8px",
    padding: "13px",
    border: "3px solid black",
    borderRadius: "11px",
    fontSize: "17px",
    background: "white",
  };

  const buttonStyle = {
    display: "inline-block",
    padding: "13px 22px",
    border: "3px solid white",
    borderRadius: "14px",
    color: "white",
    background: "#374151",
    textDecoration: "none",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  if (checkingSession) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "white",
          background: "black",
          fontFamily: "Arial, sans-serif",
          fontSize: "22px",
        }}
      >
        Verifying creator account...
      </main>
    );
  }

  const stripeReady =
    stripeStatus?.onboardingComplete &&
    stripeStatus?.payoutsEnabled &&
    stripeStatus?.chargesEnabled;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 18px",
        color: "white",
        background:
          "linear-gradient(180deg, #050505, #111827, #050505)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(1000px, 100%)",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <a
            href="/creator/dashboard"
            style={buttonStyle}
          >
            ← Creator Dashboard
          </a>

          <a
            href="/music-shop"
            style={{
              ...buttonStyle,
              color: "black",
              background: "#f59e0b",
            }}
          >
            🎵 Music Shop
          </a>
        </div>

        <header
          style={{
            marginTop: "28px",
            padding: "28px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, #581c87, #be123c)",
            border: "4px solid white",
            borderRadius: "22px",
          }}
        >
          <h1
            style={{
              margin: "0 0 12px",
              fontSize:
                "clamp(38px, 7vw, 58px)",
            }}
          >
            🎙️ Creator Music Studio
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "19px",
            }}
          >
            Welcome,{" "}
            <strong>
              {creatorName || creatorEmail}
            </strong>
          </p>
        </header>

        <section
          style={{
            marginTop: "28px",
            padding: "26px",
            color: "black",
            background: "white",
            border: `4px solid ${
              stripeReady
                ? "#22c55e"
                : "#635bff"
            }`,
            borderRadius: "22px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "30px",
            }}
          >
            💳 Creator Payouts
          </h2>

          {checkingStripe ? (
            <p style={{ fontWeight: "bold" }}>
              Checking Stripe payout status...
            </p>
          ) : stripeReady ? (
            <div
              style={{
                padding: "16px",
                background: "#dcfce7",
                border: "3px solid #22c55e",
                borderRadius: "12px",
                fontWeight: "bold",
                lineHeight: 1.6,
              }}
            >
              ✓ Stripe payouts are ready. You can
              receive your 60% creator share from
              eligible music sales.
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: "18px",
                  lineHeight: 1.6,
                }}
              >
                Connect a Stripe account to receive
                payouts when customers purchase your
                music.
              </p>

              <div
                style={{
                  marginBottom: "18px",
                  padding: "16px",
                  background: "#fef3c7",
                  border: "3px solid #f59e0b",
                  borderRadius: "12px",
                  lineHeight: 1.6,
                }}
              >
                <strong>Music sales split:</strong>
                <br />
                Creator receives 60%.
                <br />
                Ray&apos;sStream receives a 40%
                platform administration fee.
                <br />
                Stripe processing fees may also
                apply.
              </div>

              <button
                type="button"
                disabled={startingStripe}
                onClick={startStripeSetup}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  color: "white",
                  background: startingStripe
                    ? "#9ca3af"
                    : "#635bff",
                  cursor: startingStripe
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {startingStripe
                  ? "Opening Stripe..."
                  : stripeStatus?.connected
                    ? "Continue Stripe Payout Setup"
                    : "Connect Stripe for Payouts"}
              </button>
            </>
          )}

          {stripeMessage && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                background: "#e0f2fe",
                border: "3px solid #0284c7",
                borderRadius: "12px",
                fontWeight: "bold",
              }}
            >
              {stripeMessage}
            </div>
          )}
        </section>

        <section
          style={{
            marginTop: "28px",
            padding: "26px",
            color: "black",
            background: "white",
            border: "4px solid #f59e0b",
            borderRadius: "22px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "30px",
            }}
          >
            Add a New Song
          </h2>

          <form onSubmit={submitSong}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
              }}
            >
              <label
                style={{ fontWeight: "bold" }}
              >
                Song title
                <input
                  value={title}
                  disabled={uploading}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter song title"
                  maxLength={200}
                  style={inputStyle}
                />
              </label>

              <label
                style={{ fontWeight: "bold" }}
              >
                Artist name
                <input
                  value={artistName}
                  disabled={uploading}
                  onChange={(event) =>
                    setArtistName(
                      event.target.value
                    )
                  }
                  placeholder="Enter artist name"
                  maxLength={150}
                  style={inputStyle}
                />
              </label>

              <label
                style={{ fontWeight: "bold" }}
              >
                Genre
                <select
                  value={genre}
                  disabled={uploading}
                  onChange={(event) =>
                    setGenre(event.target.value)
                  }
                  style={inputStyle}
                >
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Hip-Hop</option>
                  <option>R&amp;B</option>
                  <option>Country</option>
                  <option>Electronic</option>
                  <option>Jazz</option>
                  <option>Gospel</option>
                  <option>Other</option>
                </select>
              </label>

              <label
                style={{ fontWeight: "bold" }}
              >
                Song price
                <input
                  type="number"
                  value={price}
                  disabled={uploading}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  min="0.50"
                  max="100"
                  step="0.01"
                  style={inputStyle}
                />
              </label>

              <label
                style={{ fontWeight: "bold" }}
              >
                Song audio
                <input
                  id="music-audio-file"
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  disabled={uploading}
                  onChange={(event) =>
                    setAudioFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  style={inputStyle}
                />
              </label>

              <label
                style={{ fontWeight: "bold" }}
              >
                Cover artwork
                <input
                  id="music-cover-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  disabled={uploading}
                  onChange={(event) =>
                    setCoverFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  style={inputStyle}
                />
              </label>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                marginTop: "24px",
                padding: "18px",
                background: "#fef3c7",
                border: "3px solid #f59e0b",
                borderRadius: "14px",
                fontWeight: "bold",
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={ownsRights}
                disabled={uploading}
                onChange={(event) =>
                  setOwnsRights(
                    event.target.checked
                  )
                }
                style={{
                  width: "22px",
                  height: "22px",
                  flexShrink: 0,
                }}
              />

              <span>
                I confirm that I own or have
                permission to use and sell the
                recording, composition, artwork,
                beats, and samples included in this
                release.
              </span>
            </label>

            <button
              type="submit"
              disabled={uploading}
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: "22px",
                color: "black",
                background: uploading
                  ? "#9ca3af"
                  : "#22c55e",
                cursor: uploading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {uploading
                ? "Uploading Song..."
                : "Upload Song for Review"}
            </button>
          </form>

          {message && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "#e0f2fe",
                border: "3px solid #0284c7",
                borderRadius: "12px",
                fontWeight: "bold",
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          )}
        </section>

        <section
          style={{
            marginTop: "28px",
            padding: "26px",
            color: "black",
            background: "white",
            border: "4px solid #7c3aed",
            borderRadius: "22px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "30px",
            }}
          >
            My Music Releases
          </h2>

          {releases.length === 0 ? (
            <p>
              You have not submitted any songs yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >
              {releases.map((release) => (
                <article
                  key={release.id}
                  style={{
                    overflow: "hidden",
                    border: "3px solid black",
                    borderRadius: "16px",
                    background: "#f3f4f6",
                  }}
                >
                  <img
                    src={release.coverUrl}
                    alt={`${release.title} cover`}
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      background: "#111827",
                    }}
                  />

                  <div style={{ padding: "16px" }}>
                    <h3
                      style={{
                        margin: "0 0 6px",
                      }}
                    >
                      {release.title}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 6px",
                      }}
                    >
                      {release.artistName}
                    </p>

                    <p>
                      {release.genre} · $
                      {(
                        release.priceCents / 100
                      ).toFixed(2)}
                    </p>

                    <audio
                      src={release.audioUrl}
                      controls
                      preload="none"
                      style={{ width: "100%" }}
                    />

                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px",
                        background:
                          release.reviewStatus ===
                          "approved"
                            ? "#dcfce7"
                            : "#fef3c7",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Status:{" "}
                      {release.reviewStatus}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
} 
