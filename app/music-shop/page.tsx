"use client";

import { useMemo, useState } from "react";

type Song = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  price: number;
  coverUrl: string;
  previewUrl: string;
};

const songs: Song[] = [];

export default function MusicShopPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const searchText = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        song.title
          .toLowerCase()
          .includes(searchText) ||
        song.artist
          .toLowerCase()
          .includes(searchText);

      const matchesGenre =
        genre === "All" ||
        song.genre === genre;

      return matchesSearch && matchesGenre;
    });
  }, [search, genre]);

  const genres = [
    "All",
    "Pop",
    "Rock",
    "Hip-Hop",
    "R&B",
    "Country",
    "Electronic",
    "Other",
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        background:
          "linear-gradient(180deg, #050505 0%, #111827 55%, #050505 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          padding: "28px 20px",
          textAlign: "center",
          borderBottom:
            "3px solid #f59e0b",
          background:
            "linear-gradient(135deg, #111827, #3b0764)",
        }}
      >
        <a
          href="/"
          style={{
            display: "inline-block",
            marginBottom: "22px",
            padding: "11px 20px",
            color: "white",
            background: "#1f2937",
            border: "3px solid white",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Ray&apos;sStream Home
        </a>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "clamp(38px, 8vw, 68px)",
          }}
        >
          🎵 Ray&apos;sStream Music Shop
        </h1>

        <p
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            color: "#e5e7eb",
            fontSize: "20px",
            lineHeight: 1.5,
          }}
        >
          Discover music, support artists, and
          purchase songs directly from
          Ray&apos;sStream creators.
        </p>
      </header>

      <section
        style={{
          width: "min(1100px, 92%)",
          margin: "32px auto",
          padding: "24px",
          color: "black",
          background: "white",
          border: "4px solid #f59e0b",
          borderRadius: "22px",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            textAlign: "center",
            fontSize: "30px",
          }}
        >
          Find Your Next Favorite Song
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by song or artist"
            style={{
              flex: "1 1 280px",
              padding: "14px",
              border: "3px solid black",
              borderRadius: "12px",
              fontSize: "17px",
            }}
          />

          <select
            value={genre}
            onChange={(event) =>
              setGenre(event.target.value)
            }
            style={{
              flex: "0 1 220px",
              padding: "14px",
              border: "3px solid black",
              borderRadius: "12px",
              fontSize: "17px",
              background: "white",
            }}
          >
            {genres.map((genreName) => (
              <option
                key={genreName}
                value={genreName}
              >
                {genreName}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section
        style={{
          width: "min(1100px, 92%)",
          margin: "0 auto",
          paddingBottom: "35px",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
          }}
        >
          Music Catalog
        </h2>

        {filteredSongs.length === 0 ? (
          <div
            style={{
              padding: "45px 24px",
              textAlign: "center",
              color: "black",
              background: "#fef3c7",
              border: "4px solid #f59e0b",
              borderRadius: "22px",
            }}
          >
            <div
              style={{
                marginBottom: "14px",
                fontSize: "64px",
              }}
            >
              🎧
            </div>

            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "28px",
              }}
            >
              The music catalog is opening soon
            </h3>

            <p
              style={{
                maxWidth: "650px",
                margin: "0 auto",
                fontSize: "18px",
                lineHeight: 1.5,
              }}
            >
              Ray&apos;sStream creators will be
              able to upload songs, add cover
              artwork, set prices, and sell their
              music here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredSongs.map((song) => (
              <article
                key={song.id}
                style={{
                  overflow: "hidden",
                  color: "black",
                  background: "white",
                  border:
                    "4px solid #f59e0b",
                  borderRadius: "20px",
                }}
              >
                <img
                  src={song.coverUrl}
                  alt={`${song.title} cover`}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    background: "#1f2937",
                  }}
                />

                <div
                  style={{
                    padding: "18px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: "24px",
                    }}
                  >
                    {song.title}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#4b5563",
                    }}
                  >
                    {song.artist}
                  </p>

                  <p
                    style={{
                      margin: "0 0 14px",
                      fontWeight: "bold",
                    }}
                  >
                    {song.genre}
                  </p>

                  <audio
                    src={song.previewUrl}
                    controls
                    preload="none"
                    style={{
                      width: "100%",
                    }}
                  />

                  <button
                    type="button"
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      padding: "13px",
                      color: "black",
                      background: "#f59e0b",
                      border: "3px solid black",
                      borderRadius: "12px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Buy for $
                    {song.price.toFixed(2)}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          width: "min(900px, 92%)",
          margin: "20px auto 45px",
          padding: "30px",
          textAlign: "center",
          color: "white",
          background:
            "linear-gradient(135deg, #7c3aed, #be123c)",
          border: "4px solid white",
          borderRadius: "22px",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "32px",
          }}
        >
          Sell Music on Ray&apos;sStream
        </h2>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.5,
          }}
        >
          Creator music uploads, pricing, secure
          checkout, purchases, and artist earnings
          are the next parts of the Music Shop.
        </p>

        <a
          href="/creator/dashboard"
          style={{
            display: "inline-block",
            marginTop: "10px",
            padding: "13px 24px",
            color: "black",
            background: "#22c55e",
            border: "3px solid white",
            borderRadius: "999px",
            textDecoration: "none",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Creator Dashboard
        </a>
      </section>

      <footer
        style={{
          padding: "28px",
          textAlign: "center",
          color: "#9ca3af",
          borderTop:
            "2px solid #374151",
        }}
      >
        © 2026 Ray&apos;sStream Music Shop
      </footer>
    </main>
  );
} 
