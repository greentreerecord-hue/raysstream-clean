"use client";

import Link from "next/link";
import { upload } from "@vercel/blob/client";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

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

async function uploadPreview(file: File) {
  if (
    !file.name.toLowerCase().endsWith(".mp3")
  ) {
    throw new Error(
      "Please choose an MP3 file."
    );
  }

  if (
    file.size === 0 ||
    file.size > 10 * 1024 * 1024
  ) {
    throw new Error(
      "Choose a nonempty MP3 up to 10 MB."
    );
  }

  const blob = await upload(
    `prerelease/${crypto.randomUUID()}.mp3`,
    file,
    {
      access: "public",
      contentType: "audio/mpeg",
      handleUploadUrl:
        "/api/prerelease-upload",
    }
  );

  return blob.url;
}

function EditPrerelease({
  release,
  onSaved,
}: {
  release: Prerelease;
  onSaved: (release: Prerelease) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (busy) return;

    const fields = new FormData(
      event.currentTarget
    );

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/prerelease",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: release.id,
            title: fields.get("title"),
            kind: fields.get("kind"),
            description:
              fields.get("description"),
            releaseDate:
              fields.get("releaseDate"),
            coverUrl:
              fields.get("coverUrl"),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not update prerelease."
        );
      }

      if (
        !data.release ||
        String(data.release.id) !== release.id
      ) {
        throw new Error(
          "Could not confirm the update. Reload the page to check."
        );
      }

      onSaved(data.release);
      setMessage(
        "Prerelease details updated!"
      );
      setOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update prerelease."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="edit-section">
      <button
        type="button"
        className="secondary"
        aria-expanded={open}
        disabled={busy}
        onClick={() => {
          setOpen(!open);
          setMessage("");
        }}
      >
        {open
          ? "Cancel Editing"
          : "Edit Prerelease"}
      </button>

      {open && (
        <form onSubmit={save}>
          <p>
            Only the creator of this
            announcement can save changes.{" "}
            <Link href="/creator/login">
              Creator login
            </Link>
          </p>

          <fieldset disabled={busy}>
            <label>
              Title
              <input
                name="title"
                required
                maxLength={200}
                defaultValue={release.title}
              />
            </label>

            <label>
              Release type
              <select
                name="kind"
                defaultValue={release.kind}
              >
                <option value="Music">
                  Music
                </option>
                <option value="Video">
                  Video
                </option>
              </select>
            </label>

            <label>
              Release date
              <input
                name="releaseDate"
                type="date"
                required
                defaultValue={
                  release.releaseDate
                }
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                rows={4}
                maxLength={3000}
                defaultValue={
                  release.description
                }
              />
            </label>

            <label>
              Cover image link (optional)
              <input
                name="coverUrl"
                type="url"
                placeholder="https://..."
                maxLength={2048}
                pattern="https://.*"
                defaultValue={
                  release.coverUrl
                }
              />
            </label>

            <p>
              Leave the cover link blank to
              remove the cover. Your current
              preview is preserved.
            </p>

            <button type="submit">
              {busy
                ? "Saving..."
                : "Save Changes"}
            </button>
          </fieldset>
        </form>
      )}

      {message && (
        <p role="status">{message}</p>
      )}
    </section>
  );
}

function AttachPreview({
  release,
  onSaved,
}: {
  release: Prerelease;
  onSaved: (
    id: string,
    previewUrl: string
  ) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedUrl, setUploadedUrl] =
    useState("");

  async function attach(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (busy) return;

    const form = event.currentTarget;
    const file = new FormData(form).get(
      "previewFile"
    );

    setBusy(true);
    setMessage("");

    try {
      let url = uploadedUrl;

      if (
        file instanceof File &&
        file.size > 0
      ) {
        setMessage(
          "Uploading preview..."
        );

        url = await uploadPreview(file);
        setUploadedUrl(url);

        const input =
          form.elements.namedItem(
            "previewFile"
          );

        if (
          input instanceof HTMLInputElement
        ) {
          input.value = "";
        }
      }

      if (!url) {
        throw new Error(
          "Choose your MP3 preview first."
        );
      }

      setMessage("Saving preview...");

      const response = await fetch(
        "/api/prerelease",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: release.id,
            previewUrl: url,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not attach preview."
        );
      }

      onSaved(release.id, url);
      setUploadedUrl("");
      form.reset();

      setMessage(
        "Audio preview attached!"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not attach preview."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="attach-section">
      <summary>
        {release.previewUrl
          ? "Replace Audio Preview"
          : "Attach Audio Preview"}
      </summary>

      <p>
        For the creator of this
        announcement.{" "}
        <Link href="/creator/login">
          Log in to your creator account
        </Link>{" "}
        before saving.
      </p>

      <form onSubmit={attach}>
        <fieldset disabled={busy}>
          <label>
            Choose MP3 preview (up to 10 MB)
            <input
              name="previewFile"
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={() =>
                setUploadedUrl("")
              }
            />
          </label>

          <p>
            Your snippet will be publicly
            playable.
          </p>

          <button type="submit">
            {busy
              ? "Saving..."
              : "Save Audio Preview"}
          </button>
        </fieldset>
      </form>

      {message && (
        <p role="status">{message}</p>
      )}
    </details>
  );
}

export default function PrereleasePage() {
  const [releases, setReleases] =
    useState<Prerelease[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [loadError, setLoadError] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [saving, setSaving] =
    useState(false);
  const [search, setSearch] =
    useState("");
  const [filter, setFilter] =
    useState("All");

  async function loadReleases() {
    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch(
        "/api/prerelease",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !Array.isArray(data.releases)
      ) {
        throw new Error(
          data.error ||
            "Could not load prereleases."
        );
      }

      setReleases(data.releases);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load prereleases."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title =
      "Prerelease | Ray'sStream";

    void loadReleases();
  }, []);

  function updateRelease(
    updated: Prerelease
  ) {
    setReleases((current) =>
      current.map((release) =>
        release.id === updated.id
          ? {
              ...updated,
              // Details editing preserves the
              // latest audio preview in state.
              previewUrl: release.previewUrl,
            }
          : release
      )
    );
  }

  function updatePreview(
    id: string,
    previewUrl: string
  ) {
    setReleases((current) =>
      current.map((release) =>
        release.id === id
          ? {
              ...release,
              previewUrl,
            }
          : release
      )
    );
  }

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const form = event.currentTarget;
    const fields = new FormData(form);

    setSaving(true);
    setMessage("");

    try {
      const file = fields.get(
        "audioFile"
      );

      if (
        file instanceof File &&
        file.size > 0
      ) {
        if (
          fields.get("kind") !== "Music"
        ) {
          throw new Error(
            "Choose Music for an MP3 preview."
          );
        }

        setMessage(
          "Uploading your audio preview..."
        );

        const url =
          await uploadPreview(file);

        fields.set("previewUrl", url);

        const linkInput =
          form.elements.namedItem(
            "previewUrl"
          );

        if (
          linkInput instanceof
          HTMLInputElement
        ) {
          linkInput.value = url;
        }

        const fileInput =
          form.elements.namedItem(
            "audioFile"
          );

        if (
          fileInput instanceof
          HTMLInputElement
        ) {
          fileInput.value = "";
        }
      }

      setMessage(
        "Publishing your prerelease..."
      );

      const response = await fetch(
        "/api/prerelease",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: fields.get("title"),
            kind: fields.get("kind"),
            description:
              fields.get("description"),
            releaseDate:
              fields.get("releaseDate"),
            coverUrl:
              fields.get("coverUrl"),
            previewUrl:
              fields.get("previewUrl"),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not publish prerelease."
        );
      }

      form.reset();

      setMessage(
        "Your prerelease is published!"
      );

      await loadReleases();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not publish prerelease."
      );
    } finally {
      setSaving(false);
    }
  }

  function pauseOthers(
    active: HTMLMediaElement
  ) {
    document
      .querySelectorAll<HTMLMediaElement>(
        "audio, video"
      )
      .forEach((player) => {
        if (player !== active) {
          player.pause();
        }
      });
  }

  const visible = releases.filter(
    (release) =>
      (
        filter === "All" ||
        release.kind === filter
      ) &&
      `${release.title} ${release.creator} ${release.description}`
        .toLowerCase()
        .includes(
          search.toLowerCase().trim()
        )
  );

  return (
    <main className="prerelease">
      <div className="container">
        <Link href="/">
          ← Ray&apos;sStream Home
        </Link>

        <header>
          <h1>🎬 Prerelease</h1>
          <p>
            Discover previews of new and
            upcoming music and videos.
          </p>
        </header>

        <details className="panel">
          <summary>
            Add a Prerelease
          </summary>

          <p>
            Creators:{" "}
            <Link href="/creator/login">
              log in
            </Link>{" "}
            before posting. Your announcement
            appears publicly under your
            creator name.
          </p>

          <form onSubmit={submit}>
            <fieldset disabled={saving}>
              <label>
                Title
                <input
                  name="title"
                  required
                  maxLength={200}
                />
              </label>

              <label>
                Release type
                <select name="kind">
                  <option value="Music">
                    Music
                  </option>
                  <option value="Video">
                    Video
                  </option>
                </select>
              </label>

              <label>
                Release date
                <input
                  name="releaseDate"
                  type="date"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  rows={4}
                  maxLength={3000}
                />
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
                Choose Audio File
                (optional MP3 preview)
                <input
                  name="audioFile"
                  type="file"
                  accept=".mp3,audio/mpeg"
                />
              </label>

              <p>
                MP3 snippets up to 10 MB.
                Uploaded snippets are public.
                A chosen file replaces the
                preview link below.
              </p>

              <label>
                Preview audio or video link
                (optional)
                <input
                  name="previewUrl"
                  type="url"
                  placeholder="https://..."
                  maxLength={2048}
                  pattern="https://.*"
                />
              </label>

              <p>
                Use direct HTTPS links to
                media files.
              </p>

              <button type="submit">
                {saving
                  ? "Uploading / Publishing..."
                  : "Publish Prerelease"}
              </button>
            </fieldset>
          </form>

          {message && (
            <p role="status">
              {message}
            </p>
          )}
        </details>

        <div className="filters">
          <input
            aria-label="Search prereleases"
            placeholder="Search titles or creators..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <select
            aria-label="Filter release type"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All releases
            </option>
            <option value="Music">
              Music
            </option>
            <option value="Video">
              Videos
            </option>
          </select>

          <button
            type="button"
            disabled={
              loading || saving
            }
            onClick={() =>
              void loadReleases()
            }
          >
            Reload
          </button>
        </div>

        {loadError && (
          <p role="alert">
            {loadError} Try Reload.
          </p>
        )}

        {loading && (
          <p role="status">
            Loading prereleases...
          </p>
        )}

        {!loading &&
          !loadError &&
          visible.length === 0 && (
            <section className="panel">
              <h2>
                {releases.length === 0
                  ? "No prereleases announced yet"
                  : "No matching prereleases"}
              </h2>
              <p>
                Check back for previews or
                try another search.
              </p>
            </section>
          )}

        <div className="grid">
          {visible.map((release) => (
            <article
              className="card"
              key={release.id}
            >
              {release.coverUrl && (
                <img
                  src={release.coverUrl}
                  alt={`${release.title} cover`}
                  loading="lazy"
                />
              )}

              <div className="card-body">
                <span className="badge">
                  {release.kind} • Prerelease
                </span>

                <h2>{release.title}</h2>

                <p>
                  By {release.creator}
                </p>

                <p className="description">
                  {release.description}
                </p>

                <p>
                  Release date:{" "}
                  <time
                    dateTime={
                      release.releaseDate
                    }
                  >
                    {release.releaseDate}
                  </time>
                </p>

                {release.previewUrl &&
                  (
                    release.kind ===
                    "Music" ? (
                      <audio
                        key={
                          release.previewUrl
                        }
                        controls
                        preload="none"
                        src={
                          release.previewUrl
                        }
                        onPlay={(event) =>
                          pauseOthers(
                            event.currentTarget
                          )
                        }
                      />
                    ) : (
                      <video
                        key={
                          release.previewUrl
                        }
                        controls
                        playsInline
                        preload="none"
                        src={
                          release.previewUrl
                        }
                        poster={
                          release.coverUrl ||
                          undefined
                        }
                        onPlay={(event) =>
                          pauseOthers(
                            event.currentTarget
                          )
                        }
                      />
                    )
                  )}

                <EditPrerelease
                  release={release}
                  onSaved={updateRelease}
                />

                {release.kind ===
                  "Music" && (
                  <AttachPreview
                    release={release}
                    onSaved={updatePreview}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .prerelease {
          min-height: 100vh;
          padding: 30px 18px;
          background: #080808;
          color: white;
          font-family: Arial, sans-serif;
        }

        .prerelease .container {
          max-width: 1050px;
          margin: auto;
        }

        .prerelease a {
          color: #67e8f9;
        }

        .prerelease header {
          text-align: center;
          padding: 30px 0;
        }

        .prerelease h1 {
          font-size: clamp(32px, 7vw, 48px);
        }

        .prerelease p {
          line-height: 1.6;
          color: #ccc;
        }

        .prerelease .panel,
        .prerelease .card {
          background: #151515;
          border: 1px solid #333;
          border-radius: 16px;
        }

        .prerelease .panel {
          padding: 24px;
          margin-bottom: 24px;
        }

        .prerelease summary {
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
        }

        .prerelease fieldset {
          border: 0;
          padding: 0;
          margin: 0;
          min-width: 0;
        }

        .prerelease label {
          display: block;
          margin: 16px 0;
        }

        .prerelease input,
        .prerelease select,
        .prerelease textarea {
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

        .prerelease textarea {
          resize: vertical;
        }

        .prerelease button {
          padding: 12px 18px;
          border: 0;
          border-radius: 8px;
          background: #0891b2;
          color: white;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .prerelease button.secondary {
          background: #333;
          border: 1px solid #666;
        }

        .prerelease button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .prerelease .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-bottom: 24px;
        }

        .prerelease .filters input {
          flex: 2;
          min-width: 180px;
          margin: 0;
        }

        .prerelease .filters select {
          flex: 1;
          min-width: 140px;
          margin: 0;
        }

        .prerelease .grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(min(260px, 100%), 1fr)
            );
          gap: 24px;
        }

        .prerelease .card {
          overflow: hidden;
          min-width: 0;
        }

        .prerelease .card img {
          width: 100%;
          height: 240px;
          object-fit: cover;
        }

        .prerelease .card-body {
          padding: 20px;
          overflow-wrap: anywhere;
        }

        .prerelease .badge {
          color: #67e8f9;
        }

        .prerelease .description {
          white-space: pre-wrap;
        }

        .prerelease audio,
        .prerelease video {
          width: 100%;
          margin-top: 12px;
        }

        .prerelease .edit-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #333;
        }

        .prerelease .attach-section {
          margin-top: 20px;
        }
      `}</style>
    </main>
  );
} 
