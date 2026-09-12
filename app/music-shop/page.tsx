"use client";

import { useEffect, useMemo, useState } from "react";

type ApiSong = {
  id: number;
  title: string;
  artist_name?: string;
  artistName?: string;
  genre: string;
  price_cents?: number;
  priceCents?: number;
  audio_url?: string;
  audioUrl?: string;
  cover_url?: string;
  coverUrl?: string;
};

type Song = {
  id: number;
  title: string;
  artistName: string;
  genre: string;
  priceCents: number;
  audioUrl: string;
  coverUrl: string;
};

export default function MusicShopPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(
    "Loading approved music..."
  );

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      setLoading(true);

      const response = await fetch("/api/music", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Unable to load the music catalog."
        );
      }

      const approvedSongs: Song[] = (
        data.songs ?? []
      ).map((song: ApiSong) => ({
        id: Number(song.id),
        title: String(song.title ?? "Untitled Song"),
        artistName: String(
          song.artist_name ??
            song.artistName ??
            "Ray’sStream Creator"
        ),
        genre: String(song.genre ?? "Other"),
        priceCents: Number(
          song.price_cents ?? song.priceCents ?? 0
        ),
        audioUrl: String(
          song.audio_url ?? song.audioUrl ?? ""
        ),
        coverUrl: String(
          song.cover_url ?? song.coverUrl ?? ""
        ),
      }));

      setSongs(approvedSongs);
      setMessage(
        approvedSongs.length
          ? `${approvedSongs.length} published song${
              approvedSongs.length === 1 ? "" : "s"
            } available.`
          : "No approved songs are available yet."
      );
    } catch (error) {
      setSongs([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load the music catalog."
      );
    } finally {
      setLoading(false);
    }
  }

  const genres = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(songs.map((song) => song.genre))
      ).sort(),
    ];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesSearch =
        !query ||
        song.title.toLowerCase().includes(query) ||
        song.artistName.toLowerCase().includes(query);

      const matchesGenre =
        genre === "All" || song.genre === genre;

      return matchesSearch && matchesGenre;
    });
  }, [songs, search, genre]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.navigation}>
          <a href="/" style={styles.homeLink}>
            ← Ray’sStream Home
          </a>

          <a
            href="/creator/music"
            style={styles.creatorLink}
          >
            🎙️ Creator Music Studio
          </a>
        </nav>

        <header style={styles.hero}>
          <div style={styles.musicNote}>♫</div>

          <div>
            <h1 style={styles.heading}>
              Ray’sStream Music Shop
            </h1>

            <p style={styles.subtitle}>
              Discover music, support artists, and
              purchase songs directly from Ray’sStream
              creators.
            </p>
          </div>
        </header>

        <section style={styles.searchPanel}>
          <h2 style={styles.searchHeading}>
            Find Your Next Favorite Song
          </h2>

          <div style={styles.searchRow}>
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by song or artist"
              style={styles.searchInput}
            />

            <select
              value={genre}
              onChange={(event) =>
                setGenre(event.target.value)
              }
              style={styles.select}
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

          <p style={styles.message}>{message}</p>
        </section>

        <section>
          <div style={styles.catalogHeader}>
            <h2 style={styles.catalogHeading}>
              Music Catalog
            </h2>

            <button
              type="button"
              onClick={loadSongs}
              style={styles.refreshButton}
            >
              Refresh Catalog
            </button>
          </div>

          {loading ? (
            <div style={styles.empty}>
              Loading music...
            </div>
          ) : filteredSongs.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.headphones}>🎧</div>

              <h3>No matching songs found</h3>

              <p>
                Try a different search or genre.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredSongs.map((song) => (
                <article
                  key={song.id}
                  style={styles.card}
                >
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={`${song.title} cover artwork`}
                      style={styles.cover}
                    />
                  ) : (
                    <div style={styles.coverPlaceholder}>
                      🎵
                    </div>
                  )}

                  <div style={styles.cardBody}>
                    <span style={styles.genre}>
                      {song.genre}
                    </span>

                    <h3 style={styles.songTitle}>
                      {song.title}
                    </h3>

                    <p style={styles.artist}>
                      {song.artistName}
                    </p>

                    {song.audioUrl && (
                      <audio
                        controls
                        preload="metadata"
                        src={song.audioUrl}
                        style={styles.audio}
                      />
                    )}

                    <div style={styles.purchaseRow}>
                      <strong style={styles.price}>
                        $
                        {(
                          song.priceCents / 100
                        ).toFixed(2)}
                      </strong>

                      <button
                        type="button"
                        disabled
                        title="Secure purchases are coming next."
                        style={styles.buyButton}
                      >
                        Purchases Coming Soon
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={styles.sellerPanel}>
          <h2>Sell Your Music on Ray’sStream</h2>

          <p>
            Approved creators can upload original music,
            artwork, prices, and rights information for
            administrator review.
          </p>

          <a
            href="/creator/music"
            style={styles.sellerButton}
          >
            Open Creator Music Studio
          </a>
        </section>

        <footer style={styles.footer}>
          © 2026 Ray’sStream Music Shop
        </footer>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "26px 18px 50px",
    color: "white",
    background:
      "linear-gradient(135deg, #030712, #111d4a, #291050)",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    width: "min(1180px, 100%)",
    margin: "0 auto",
  },
  navigation: {
    display: "flex",
    justifyContent: "center",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  homeLink: {
    color: "white",
    border: "3px solid white",
    borderRadius: 18,
    padding: "12px 20px",
    textDecoration: "none",
    fontWeight: 900,
  },
  creatorLink: {
    color: "#111",
    background: "#ff8a00",
    border: "3px solid white",
    borderRadius: 18,
    padding: "12px 20px",
    textDecoration: "none",
    fontWeight: 900,
  },
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    textAlign: "center",
    padding: "30px 18px",
    borderBottom: "4px solid #ff8a00",
    background:
      "radial-gradient(circle, #27135f, transparent 70%)",
  },
  musicNote: {
    color: "#1664ff",
    fontSize: "clamp(60px, 10vw, 110px)",
    fontWeight: 900,
  },
  heading: {
    margin: 0,
    fontSize: "clamp(38px, 7vw, 72px)",
  },
  subtitle: {
    maxWidth: 760,
    margin: "14px auto 0",
    fontSize: 20,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  searchPanel: {
    margin: "30px 0",
    padding: 24,
    color: "#111",
    background: "white",
    border: "4px solid #ff8a00",
    borderRadius: 22,
  },
  searchHeading: {
    margin: "0 0 18px",
    textAlign: "center",
    fontSize: 32,
  },
  searchRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  searchInput: {
    flex: "1 1 420px",
    minWidth: 0,
    padding: 14,
    border: "3px solid #111",
    borderRadius: 12,
    fontSize: 17,
  },
  select: {
    flex: "0 1 190px",
    padding: 14,
    border: "3px solid #111",
    borderRadius: 12,
    fontSize: 17,
  },
  message: {
    margin: "16px 0 0",
    fontWeight: 800,
    color: "#333",
  },
  catalogHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  catalogHeading: {
    fontSize: 34,
    margin: "0 0 16px",
  },
  refreshButton: {
    padding: "10px 16px",
    background: "#1664ff",
    color: "white",
    border: "2px solid white",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(290px, 1fr))",
    gap: 22,
  },
  card: {
    overflow: "hidden",
    color: "#111",
    background: "white",
    border: "4px solid #ff8a00",
    borderRadius: 22,
    boxShadow: "0 14px 35px rgba(0,0,0,.35)",
  },
  cover: {
    display: "block",
    width: "100%",
    height: 290,
    objectFit: "cover",
    background: "#ddd",
  },
  coverPlaceholder: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: 290,
    background:
      "linear-gradient(135deg, #6617a8, #1664ff)",
    fontSize: 90,
  },
  cardBody: {
    padding: 20,
  },
  genre: {
    display: "inline-block",
    padding: "5px 11px",
    background: "#efe5ff",
    border: "2px solid #4c1d95",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
  },
  songTitle: {
    margin: "14px 0 4px",
    fontSize: 30,
  },
  artist: {
    margin: 0,
    color: "#5522a8",
    fontSize: 19,
    fontWeight: 800,
  },
  audio: {
    width: "100%",
    margin: "18px 0",
  },
  purchaseRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 28,
    color: "#08783d",
  },
  buyButton: {
    flex: 1,
    minWidth: 170,
    padding: 12,
    color: "#333",
    background: "#d9d9d9",
    border: "3px solid #111",
    borderRadius: 12,
    fontWeight: 900,
  },
  empty: {
    padding: 35,
    color: "#111",
    background: "white",
    border: "4px solid #ff8a00",
    borderRadius: 22,
    textAlign: "center",
  },
  headphones: {
    fontSize: 70,
  },
  sellerPanel: {
    marginTop: 38,
    padding: 26,
    color: "#111",
    background: "#fff7e8",
    border: "4px solid #ff8a00",
    borderRadius: 22,
    textAlign: "center",
  },
  sellerButton: {
    display: "inline-block",
    marginTop: 10,
    padding: "13px 20px",
    color: "white",
    background: "#5922a8",
    border: "3px solid #111",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 900,
  },
  footer: {
    marginTop: 35,
    textAlign: "center",
    fontWeight: 700,
  },
}; 
