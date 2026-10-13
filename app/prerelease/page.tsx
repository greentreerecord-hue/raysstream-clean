"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Prerelease = {
  id: string;
  title: string;
  creator: string;
  kind: "Music" | "Video";
  description: string;
  releaseDate: string;
  coverUrl: string;
  previewUrl: string;
};

export default function PrereleasePage() {
  const [releases, setReleases] = useState<Prerelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  async function loadReleases() {
    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch("/api/prerelease", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !Array.isArray(data.releases)) {
        throw new Error(data.error || "Could not load prereleases.");
      }

      setReleases(data.releases);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load prereleases."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Prerelease | Ray'sStream";
    void loadReleases();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = event.currentTarget;
    const fields = new FormData(form);
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/prerelease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.get("title"),
          kind: fields.get("kind"),
          description: fields.get("description"),
          releaseDate: fields.get("releaseDate"),
          coverUrl: fields.get("coverUrl"),
          previewUrl: fields.get("previewUrl"),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not publish prerelease.");
      }

      form.reset();
      setMessage("Your prerelease is published!");
      await loadReleases();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not publish prerelease."
      );
    } finally {
      setSaving(false);
    }
  }

  function pauseOthers(active: HTMLMediaElement) {
    document.querySelectorAll<HTMLMediaElement>("audio, video")
      .forEach((player) => {
        if (player !== active) player.pause();
      });
  }

  const visible = releases.filter((release) => {
    const matchesKind = filter === "All" || release.kind === filter;
    const matchesSearch =
      `${release.title} ${release.creator} ${release.description}`
        .toLowerCase()
        .includes(search.toLowerCase().trim());

    return matchesKind && matchesSearch;
  });

  return (
    <main className="prerelease">
      <div className="container">
        <Link href="/">← Ray&apos;sStream Home</Link>

        <header>
          <h1>🎬 Prerelease</h1>
          <p>Discover previews of new and upcoming music and videos.</p>
        </header>

        <details className="panel">
          <summary>Add a Prerelease</summary>
          <p>
            Creators: <Link href="/creator/login">log in</Link> before posting.
            Your submission will appear publicly under your creator name.
          </p>

          <form onSubmit={submit}>
            <fieldset disabled={saving}>
              <label>
                Title
                <input name="title" required maxLength={200} />
              </label>

              <label>
                Release type
                <select name="kind">
                  <option value="Music">Music</option>
                  <option value="Video">Video</option>
                </select>
              </label>

              <label>
                Release date
                <input name="releaseDate" type="date" required />
              </label>

              <label>
                Description
                <textarea name="description" rows={4} maxLength={3000} />
              </label>

              <label>
                Cover image link (optional)
                <input
                  name="coverUrl"
                  type="url"
                  placeholder="https://..."
                  maxLength={2048}
                  pattern="https://.*"
                />
              </label>

              <label>
                Preview audio or video link (optional)
                <input
                  name="previewUrl"
                  type="url"
                  placeholder="https://..."
                  maxLength={2048}
                  pattern="https://.*"
                />
              </label>

              <p>
                Use direct links to an image, audio file, or video file.
                Share only the preview you want visitors to access.
              </p>

              <button type="submit">
                {saving ? "Publishing..." : "Publish Prerelease"}
              </button>
            </fieldset>
          </form>

          {message && <p role="status">{message}</p>}
        </details>

        <div className="filters">
          <input
            aria-label="Search prereleases"
            placeholder="Search titles or creators..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="Filter release type"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All releases</option>
            <option value="Music">Music</option>
            <option value="Video">Videos</option>
          </select>
          <button
            type="button"
            onClick={() => void loadReleases()}
            disabled={loading}
          >
            Reload
          </button>
        </div>

        {loading ? (
          <p role="status">Loading prereleases...</p>
        ) : loadError ? (
          <p role="alert">{loadError} Try Reload.</p>
        ) : visible.length === 0 ? (
          <section className="panel">
            <h2>
              {releases.length === 0
                ? "No prereleases announced yet"
                : "No matching prereleases"}
            </h2>
            <p>
              {releases.length === 0
                ? "Check back for new previews and release dates."
                : "Try another search or release type."}
            </p>
          </section>
        ) : (
          <div className="grid">
            {visible.map((release) => (
              <article className="card" key={release.id}>
                {release.coverUrl && (
                  <img
                    src={release.coverUrl}
                    alt={`${release.title} cover`}
                    loading="lazy"
                  />
                )}
                <div className="card-body">
                  <span className="badge">{release.kind} • Prerelease</span>
                  <h2>{release.title}</h2>
                  <p>By {release.creator}</p>
                  <p className="description">{release.description}</p>
                  <p>
                    Release date:{" "}
                    <time dateTime={release.releaseDate}>
                      {release.releaseDate}
                    </time>
                  </p>

                  {release.previewUrl &&
                    (release.kind === "Music" ? (
                      <audio
                        controls
                        preload="none"
                        src={release.previewUrl}
                        onPlay={(event) => pauseOthers(event.currentTarget)}
                      />
                    ) : (
                      <video
                        controls
                        playsInline
                        preload="none"
                        src={release.previewUrl}
                        poster={release.coverUrl || undefined}
                        onPlay={(event) => pauseOthers(event.currentTarget)}
                      />
                    ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .prerelease {
          min-height: 100vh;
          padding: 30px 18px;
          background: #080808;
          color: white;
          font-family: Arial, sans-serif;
        }
        .container { max-width: 1050px; margin: auto; }
        .container :global(a) { color: #67e8f9; }
        header { text-align: center; padding: 30px 0; }
        h1 { font-size: clamp(32px, 7vw, 48px); }
        p { line-height: 1.6; color: #ccc; }
        .panel, .card {
          background: #151515;
          border: 1px solid #333;
          border-radius: 16px;
        }
        .panel { padding: 24px; margin-bottom: 24px; }
        summary { cursor: pointer; font-size: 22px; font-weight: bold; }
        fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
        label { display: block; margin: 16px 0; }
        input, select, textarea {
          display: block;
          box-sizing: border-box;
          width: 100%;
          margin-top: 8px;
          padding: 12px;
          border: 1px solid #666;
          border-radius: 8px;
          background: #222;
          color: white;
          font: inherit;
        }
        textarea { resize: vertical; }
        button {
          padding: 12px 18px;
          border: 0;
          border-radius: 8px;
          background: #0891b2;
          color: white;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }
        button:disabled { opacity: 0.6; cursor: wait; }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-bottom: 24px;
        }
        .filters input { flex: 2; min-width: 180px; margin: 0; }
        .filters select { flex: 1; min-width: 140px; margin: 0; }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }
        .card { overflow: hidden; min-width: 0; }
        .card img { width: 100%; height: 240px; object-fit: cover; }
        .card-body { padding: 20px; overflow-wrap: anywhere; }
        .badge { color: #67e8f9; }
        .description { white-space: pre-wrap; }
        audio, video { width: 100%; margin-top: 12px; }
      `}</style>
    </main>
  );
} 
