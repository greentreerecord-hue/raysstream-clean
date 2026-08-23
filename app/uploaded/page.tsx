"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Video = {
  url: string;
  pathname: string;
  title: string | null;
  description?: string;
  thumbnailUrl?: string;
};

export default function UploadedPage() {
  const router = useRouter();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingUrl, setDeletingUrl] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] =
    useState("");

  async function loadVideos() {
    const creatorEmail = localStorage.getItem(
      "raysstreamCreatorEmail"
    );

    if (!creatorEmail) {
      router.push("/creator/login");
      return;
    }

    try {
      const response = await fetch(
        `/api/my-videos?email=${encodeURIComponent(
          creatorEmail
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Could not load videos."
        );
        return;
      }

      setVideos(data.videos || []);
    } catch (error) {
      console.error(error);
      setMessage("Could not load videos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  function cleanTitle(pathname: string) {
    const fileName =
      pathname.split("/").pop() || pathname;

    return fileName
      .replace(/\.(mp4|webm|mov)$/i, "")
      .replace(/^\d+-/, "")
      .replace(/-[a-zA-Z0-9]{8,}$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function displayTitle(video: Video) {
    return video.title || cleanTitle(video.pathname);
  }

  function startEditing(video: Video) {
    setEditingUrl(video.url);
    setEditTitle(displayTitle(video));
    setEditDescription(video.description || "");
    setMessage("");
  }

  function cancelEditing() {
    setEditingUrl("");
    setEditTitle("");
    setEditDescription("");
  }

  async function saveDetails(video: Video) {
    const creatorEmail = localStorage.getItem(
      "raysstreamCreatorEmail"
    );

    if (!creatorEmail) {
      router.push("/creator/login");
      return;
    }

    const newTitle = editTitle.trim();
    const newDescription = editDescription.trim();

    if (!newTitle) {
      setMessage("Please enter a video title.");
      return;
    }

    try {
      setMessage("Saving video details...");

      const response = await fetch(
        "/api/my-videos",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: creatorEmail,
            url: video.url,
            pathname: video.pathname,
            title: newTitle,
            description: newDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not update video details."
        );
        return;
      }

      setVideos((currentVideos) =>
        currentVideos.map((currentVideo) =>
          currentVideo.url === video.url
            ? {
                ...currentVideo,
                title: newTitle,
                description: newDescription,
              }
            : currentVideo
        )
      );

      setEditingUrl("");
      setEditTitle("");
      setEditDescription("");
      setMessage(
        "Video details updated successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage("Could not update video details.");
    }
  }

  async function deleteVideo(video: Video) {
    const creatorEmail = localStorage.getItem(
      "raysstreamCreatorEmail"
    );

    if (!creatorEmail) {
      router.push("/creator/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUrl(video.url);
      setMessage("");

      const response = await fetch(
        "/api/my-videos",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: creatorEmail,
            url: video.url,
            pathname: video.pathname,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Could not delete video."
        );
        return;
      }

      setVideos((currentVideos) =>
        currentVideos.filter(
          (currentVideo) =>
            currentVideo.url !== video.url
        )
      );

      setMessage("Video deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Could not delete video.");
    } finally {
      setDeletingUrl("");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <button
        onClick={() =>
          router.push("/creator/dashboard")
        }
        style={{
          padding: "12px 18px",
          marginBottom: "25px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          backgroundColor: "#fff",
          color: "#000",
          border: "2px solid #000",
          borderRadius: "8px",
        }}
      >
        ← Back to Creator Dashboard
      </button>

      <h1>My Uploaded Videos</h1>

      {loading && <p>Loading videos...</p>}

      {message && (
        <p
          style={{
            marginTop: "15px",
            marginBottom: "15px",
          }}
        >
          {message}
        </p>
      )}

      {!loading && (
        <>
          <p>Videos found: {videos.length}</p>

          {videos.length === 0 ? (
            <p>
              You have not uploaded any videos yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "30px",
                marginTop: "30px",
              }}
            >
              {videos.map((video) => (
                <div
                  key={video.url}
                  style={{
                    paddingBottom: "30px",
                    borderBottom: "1px solid #333",
                  }}
                >
                  {editingUrl === video.url ? (
                    <div
                      style={{
                        maxWidth: "700px",
                        marginBottom: "15px",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        Video Title
                      </label>

                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(
                            event.target.value
                          )
                        }
                        maxLength={150}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "12px",
                          fontSize: "18px",
                          marginBottom: "18px",
                        }}
                      />

                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        Video Description
                      </label>

                      <textarea
                        value={editDescription}
                        onChange={(event) =>
                          setEditDescription(
                            event.target.value
                          )
                        }
                        maxLength={2000}
                        rows={6}
                        placeholder="Tell viewers about your video..."
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "12px",
                          fontSize: "16px",
                          resize: "vertical",
                        }}
                      />

                      <p
                        style={{
                          color: "#bbbbbb",
                          margin: "6px 0 14px",
                        }}
                      >
                        {editDescription.length}/2000
                        characters
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            saveDetails(video)
                          }
                          style={{
                            padding: "10px 16px",
                            fontSize: "15px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Save Details
                        </button>

                        <button
                          onClick={cancelEditing}
                          style={{
                            padding: "10px 16px",
                            fontSize: "15px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2>
                        {displayTitle(video)}
                      </h2>

                      {video.description && (
                        <p
                          style={{
                            maxWidth: "700px",
                            color: "#dddddd",
                            fontSize: "17px",
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {video.description}
                        </p>
                      )}
                    </>
                  )}

                  <video
                    src={video.url}
                    poster={
                      video.thumbnailUrl || undefined
                    }
                    controls
                    style={{
                      width: "100%",
                      maxWidth: "700px",
                      borderRadius: "10px",
                      display: "block",
                      marginBottom: "15px",
                      background: "#111",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() =>
                        startEditing(video)
                      }
                      style={{
                        padding: "12px 18px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                        color: "#000",
                        border: "2px solid #000",
                        borderRadius: "8px",
                      }}
                    >
                      Edit Details
                    </button>

                    <button
                      onClick={() =>
                        deleteVideo(video)
                      }
                      disabled={
                        deletingUrl === video.url
                      }
                      style={{
                        padding: "12px 18px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor:
                          deletingUrl === video.url
                            ? "not-allowed"
                            : "pointer",
                        backgroundColor: "#b91c1c",
                        color: "#fff",
                        border: "2px solid #000",
                        borderRadius: "8px",
                      }}
                    >
                      {deletingUrl === video.url
                        ? "Deleting..."
                        : "Delete Video"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
} 
