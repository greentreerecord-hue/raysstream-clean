"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

type PurchasedSong = {
  id: number;
  title: string;
  artistName: string;
  genre: string;
  coverUrl: string;
  audioUrl: string;
  available: boolean;
  purchasedAt: string;
  purchaseUrl: string;
  downloadUrl: string;
};

const buttonStyle: CSSProperties = {
  display: "inline-block",
  padding: "13px 18px",
  border: "2px solid white",
  borderRadius: "12px",
  color: "white",
  background: "#374151",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
};

export default function MyMusicPage() {
  const [songs, setSongs] =
    useState<PurchasedSong[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [needsLogin, setNeedsLogin] =
    useState(false);

  const [reload, setReload] =
    useState(0);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadMusic() {
      setLoading(true);
      setMessage("");
      setNeedsLogin(false);
      setSongs([]);

      try {
        const response = await fetch(
          "/api/my-music",
          {
            cache: "no-store",
            credentials: "same-origin",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          setNeedsLogin(true);
          setMessage(
            "Sign in to your viewer account to see your purchased music."
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load your music."
          );
        }

        if (!Array.isArray(data.songs)) {
          throw new Error(
            "Unable to load your music."
          );
        }

        setSongs(data.songs);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your music."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMusic();

    return () => controller.abort();
  }, [reload]);

  const query = search.trim().toLowerCase();

  const visibleSongs = songs.filter(
    (song) =>
      `${song.title} ${song.artistName} ${song.genre}`
        .toLowerCase()
        .includes(query)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "35px 18px",
        color: "white",
        background:
          "linear-gradient(135deg, #030712, #111d4a, #291050)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: "28px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, #1664ff, #5922a8)",
            border: "4px solid white",
            borderRadius: "22px",
          }}
        >
          <div style={{ fontSize: "58px" }}>
            🎵
          </div>

          <h1
            style={{
              margin: "8px 0",
              fontSize: "clamp(34px, 7vw, 52px)",
            }}
          >
            My Music
          </h1>

          <p style={{ lineHeight: 1.6 }}>
            Your purchased Ray’sStream songs.
            Play them or download them again.
          </p>

          <nav
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <a
              href="/music-shop"
              style={{
                ...buttonStyle,
                color: "black",
                background: "#ff8a00",
              }}
            >
              Music Shop
            </a>

              <a href="/" style={buttonStyle}>
  Ray’sStream Home
</a>

<a
  href="/viewer/dashboard"
  style={{
    ...buttonStyle,
    background: "#1664ff",
  }}
>
  Back to Viewer Dashboard
</a> 


            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setReload((value) => value + 1)
              }
              style={{
                ...buttonStyle,
                opacity: loading ? 0.6 : 1,
              }}
            >
              Refresh Music
            </button>
          </nav>
        </header>

        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          {loading && (
            <p>Loading your purchased music...</p>
          )}

          {!loading && message && (
            <p>{message}</p>
          )}
        </div>

        {!loading && needsLogin && (
          <section
            style={{
              padding: "28px",
              textAlign: "center",
              background: "#111827",
              borderRadius: "18px",
            }}
          >
            <a
              href="/viewer/login"
              style={{
                ...buttonStyle,
                background: "#1664ff",
              }}
            >
              Viewer Login
            </a>

            <p style={{ lineHeight: 1.6 }}>
              After signing in, return to My Music.
            </p>

            <a
              href="/viewer/signup"
              style={buttonStyle}
            >
              Create Viewer Account
            </a>
          </section>
        )}

        {!loading && !message && (
          <>
            <p
              style={{
                textAlign: "center",
                lineHeight: 1.6,
                color: "#d1d5db",
              }}
            >
              Purchases made while signed in
              through the updated checkout appear here.
              Earlier guest purchases still use their
              original purchase confirmation link.
            </p>

            {songs.length === 0 ? (
              <section
                style={{
                  marginTop: "24px",
                  padding: "30px",
                  textAlign: "center",
                  background: "#111827",
                  border: "2px solid #5922a8",
                  borderRadius: "18px",
                }}
              >
                <h2>No purchased songs yet</h2>

                <p style={{ lineHeight: 1.6 }}>
                  Stay signed in to your viewer account
                  when purchasing a song to add it
                  to My Music.
                </p>

                <a
                  href="/music-shop"
                  style={{
                    ...buttonStyle,
                    color: "black",
                    background: "#22c55e",
                  }}
                >
                  Browse Music
                </a>
              </section>
            ) : (
              <>
                <label
                  htmlFor="music-search"
                  style={{
                    display: "block",
                    margin: "24px 0 8px",
                    fontWeight: 800,
                  }}
                >
                  Search your music
                </label>

                <input
                  id="music-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Song, artist, or genre"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "15px",
                    border: "2px solid #a78bfa",
                    borderRadius: "12px",
                    fontSize: "17px",
                    color: "black",
                    background: "white",
                  }}
                />

                <p>
                  {visibleSongs.length} of {songs.length} songs
                </p>

                {visibleSongs.length === 0 && (
                  <p>No songs match your search.</p>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                    gap: "22px",
                    marginTop: "20px",
                  }}
                >
                  {visibleSongs.map((song) => (
                    <article
                      key={song.id}
                      style={{
                        overflow: "hidden",
                        color: "black",
                        background: "white",
                        border: "3px solid #22c55e",
                        borderRadius: "18px",
                      }}
                    >
                      {song.coverUrl && (
                        <img
                          src={song.coverUrl}
                          alt={`${song.title} cover artwork`}
                          loading="lazy"
                          style={{
                            display: "block",
                            width: "100%",
                            height: "240px",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      <div style={{ padding: "22px" }}>
                        <span
                          style={{
                            color: "#166534",
                            fontWeight: 900,
                          }}
                        >
                          PURCHASED
                        </span>

                        <h2
                          style={{
                            margin: "12px 0 6px",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {song.title}
                        </h2>

                        <p
                          style={{
                            color: "#5922a8",
                            fontWeight: 800,
                          }}
                        >
                          {song.artistName}
                        </p>

                        <p>{song.genre}</p>

                        {song.available ? (
                          <>
                            <audio
                              controls
                              preload="none"
                              src={song.audioUrl}
                              style={{
                                width: "100%",
                                margin: "12px 0 18px",
                              }}
                            />

                            <a
                              href={song.downloadUrl}
                              download
                              style={{
                                ...buttonStyle,
                                display: "block",
                                textAlign: "center",
                                color: "black",
                                background: "#22c55e",
                                borderColor: "black",
                              }}
                            >
                              ⬇ Download Song
                            </a>

                            <a
                              href={song.purchaseUrl}
                              style={{
                                display: "block",
                                marginTop: "16px",
                                color: "#5922a8",
                                textAlign: "center",
                                fontWeight: 800,
                              }}
                            >
                              Purchase Details
                            </a>
                          </>
                        ) : (
                          <p>
                            This song is currently unavailable.
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
} 
