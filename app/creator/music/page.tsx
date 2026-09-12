"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type CreatorSessionResponse = {
  creator?: {
    name?: string;
    email?: string;
  };
};

export default function CreatorMusicPage() {
  const router = useRouter();

  const [creatorName, setCreatorName] =
    useState("");

  const [creatorEmail, setCreatorEmail] =
    useState("");

  const [checkingSession, setCheckingSession] =
    useState(true);

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

  const [message, setMessage] = useState("");

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
      } catch {
        router.replace("/creator/login");
      } finally {
        setCheckingSession(false);
      }
    }

    verifyCreator();
  }, [router]);

  function prepareUpload(event: FormEvent) {
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

    const songPrice = Number(price);

    if (
      !Number.isFinite(songPrice) ||
      songPrice < 0.5 ||
      songPrice > 100
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

    setMessage(
      "Song information is ready. Secure music storage and database saving are the next step."
    );
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
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

          <p
            style={{
              color: "#4b5563",
              lineHeight: 1.5,
            }}
          >
            Add the song information, audio,
            artwork, price, and rights
            confirmation.
          </p>

          <form onSubmit={prepareUpload}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
              }}
            >
              <label
                style={{
                  fontWeight: "bold",
                }}
              >
                Song title
                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter song title"
                  maxLength={200}
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
                />
              </label>

              <label
                style={{
                  fontWeight: "bold",
                }}
              >
                Artist name
                <input
                  value={artistName}
                  onChange={(event) =>
                    setArtistName(
                      event.target.value
                    )
                  }
                  placeholder="Enter artist name"
                  maxLength={150}
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
                />
              </label>

              <label
                style={{
                  fontWeight: "bold",
                }}
              >
                Genre
                <select
                  value={genre}
                  onChange={(event) =>
                    setGenre(event.target.value)
                  }
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
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
                style={{
                  fontWeight: "bold",
                }}
              >
                Song price
                <input
                  type="number"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  min="0.50"
                  max="100"
                  step="0.01"
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
                />
              </label>

              <label
                style={{
                  fontWeight: "bold",
                }}
              >
                Song audio
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  onChange={(event) =>
                    setAudioFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
                />
              </label>

              <label
                style={{
                  fontWeight: "bold",
                }}
              >
                Cover artwork
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  onChange={(event) =>
                    setCoverFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  style={{
                    ...inputStyle,
                    marginTop: "8px",
                  }}
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
                beats, and samples included in
                this release.
              </span>
            </label>

            <button
              type="submit"
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: "22px",
                color: "black",
                background: "#22c55e",
              }}
            >
              Prepare Song Upload
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
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          {[
            {
              icon: "🎵",
              title: "My Releases",
              text: "Edit, publish, or remove your songs and albums.",
            },
            {
              icon: "💵",
              title: "Sales & Earnings",
              text: "Track purchases, platform fees, and creator earnings.",
            },
            {
              icon: "🏦",
              title: "Payout Setup",
              text: "Connect your secure Stripe seller account.",
            },
          ].map((item) => (
            <article
              key={item.title}
              style={{
                padding: "22px",
                color: "black",
                background: "white",
                border: "4px solid #7c3aed",
                borderRadius: "18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "46px",
                }}
              >
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p
                style={{
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                {item.text}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
} 
