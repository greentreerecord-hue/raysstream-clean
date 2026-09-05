"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

type Video = {
  url: string;
  pathname: string;
  title: string | null;
  description?: string;
  thumbnailUrl?: string | null;
  thumbnailPathname?: string | null;
};

export default function UploadedPage() {
  const router = useRouter();

  const [videos, setVideos] =
    useState<Video[]>([]);

  const [creatorEmail, setCreatorEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [deletingUrl, setDeletingUrl] =
    useState("");

  const [editingUrl, setEditingUrl] =
    useState("");

  const [editTitle, setEditTitle] =
    useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editThumbnail,
    setEditThumbnail,
  ] = useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  async function loadVideos() {
    try {
      const response = await fetch(
        "/api/my-videos",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/creator/login");
        return;
      }

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not load videos."
        );
        return;
      }

      setCreatorEmail(
        String(data.creatorEmail || "")
      );

      setVideos(data.videos || []);
    } catch (error) {
      console.error(error);
      setMessage(
        "Could not load videos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  function cleanTitle(
    pathname: string
  ) {
    const fileName =
      pathname.split("/").pop() ||
      pathname;

    return fileName
      .replace(
        /\.(mp4|webm|mov)$/i,
        ""
      )
      .replace(/^\d+-/, "")
      .replace(
        /-[a-zA-Z0-9]{8,}$/,
        ""
      )
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function displayTitle(
    video: Video
  ) {
    return (
      video.title ||
      cleanTitle(video.pathname)
    );
  }

  function startEditing(
    video: Video
  ) {
    setEditingUrl(video.url);
    setEditTitle(displayTitle(video));
    setEditDescription(
      video.description || ""
    );
    setEditThumbnail(null);
    setMessage("");
  }

  function cancelEditing() {
    setEditingUrl("");
    setEditTitle("");
    setEditDescription("");
    setEditThumbnail(null);
  }

  async function saveDetails(
    video: Video
  ) {
    const newTitle =
      editTitle.trim();

    const newDescription =
      editDescription.trim();

    if (!newTitle) {
      setMessage(
        "Please enter a video title."
      );
      return;
    }

    if (!creatorEmail) {
      router.replace(
        "/creator/login"
      );
      return;
    }

    try {
      setSaving(true);

      let newThumbnailUrl =
        video.thumbnailUrl || null;

      let newThumbnailPathname =
        video.thumbnailPathname ||
        null;

      if (editThumbnail) {
        setMessage(
          "Uploading new thumbnail..."
        );

        const safeEmail =
          creatorEmail
            .toLowerCase()
            .replace(
              /[^a-z0-9]/g,
              "-"
            );

        const thumbnailBlob =
          await upload(
            `thumbnails/${safeEmail}/${Date.now()}-${editThumbnail.name}`,
            editThumbnail,
            {
              access: "public",
              handleUploadUrl:
                "/api/upload",
            }
          );

        newThumbnailUrl =
          thumbnailBlob.url;

        newThumbnailPathname =
          thumbnailBlob.pathname;
      }

      setMessage(
        "Saving video details..."
      );

      const response = await fetch(
        "/api/my-videos",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url: video.url,
            title: newTitle,
            description:
              newDescription,
            thumbnailUrl:
              newThumbnailUrl,
            thumbnailPathname:
              newThumbnailPathname,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        router.replace(
          "/creator/login"
        );
        return;
      }

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not update video details."
        );
        return;
      }

      setVideos((currentVideos) =>
        currentVideos.map(
          (currentVideo) =>
            currentVideo.url ===
            video.url
              ? {
                  ...currentVideo,
                  title: newTitle,
                  description:
                    newDescription,
                  thumbnailUrl:
                    data.thumbnailUrl ??
                    newThumbnailUrl,
                  thumbnailPathname:
                    data.thumbnailPathname ??
                    newThumbnailPathname,
                }
              : currentVideo
        )
      );

      cancelEditing();

      setMessage(
        "Video details updated successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Could not update video details."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteVideo(
    video: Video
  ) {
    const confirmed =
      window.confirm(
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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url: video.url,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        router.replace(
          "/creator/login"
        );
        return;
      }

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not delete video."
        );
        return;
      }

      setVideos((currentVideos) =>
        currentVideos.filter(
          (currentVideo) =>
            currentVideo.url !==
            video.url
        )
      );

      setMessage(
        "Video deleted successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Could not delete video."
      );
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
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <button
        onClick={() =>
          router.push(
            "/creator/dashboard"
          )
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

      {loading && (
        <p>Loading videos...</p>
      )}

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
          <p>
            Videos found: {videos.length}
          </p>

          {videos.length === 0 ? (
            <p>
              You have not uploaded any
              videos yet.
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
                    paddingBottom:
                      "30px",
                    borderBottom:
                      "1px solid #333",
                  }}
                >
                  {editingUrl ===
                  video.url ? (
                    <div
                      style={{
                        maxWidth:
                          "700px",
                        marginBottom:
                          "15px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "8px",
                          fontWeight:
                            "bold",
                        }}
                      >
                        Video Title
                      </label>

                      <input
                        type="text"
                        value={editTitle}
                        onChange={(
                          event
                        ) =>
                          setEditTitle(
                            event.target
                              .value
                          )
                        }
                        maxLength={150}
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          padding:
                            "12px",
                          fontSize:
                            "18px",
                          marginBottom:
                            "18px",
                        }}
                      />

                      <label
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "8px",
                          fontWeight:
                            "bold",
                        }}
                      >
                        Video Description
                      </label>

                      <textarea
                        value={
                          editDescription
                        }
                        onChange={(
                          event
                        ) =>
                          setEditDescription(
                            event.target
                              .value
                          )
                        }
                        maxLength={2000}
                        rows={6}
                        placeholder="Tell viewers about your video..."
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          padding:
                            "12px",
                          fontSize:
                            "16px",
                          resize:
                            "vertical",
                        }}
                      />

                      <p
                        style={{
                          color:
                            "#bbbbbb",
                          margin:
                            "6px 0 18px",
                        }}
                      >
                        {
                          editDescription.length
                        }
                        /2000 characters
                      </p>

                      <label
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "8px",
                          fontWeight:
                            "bold",
                        }}
                      >
                        Change Thumbnail
                      </label>

                      <p
                        style={{
                          color:
                            "#bbbbbb",
                          margin:
                            "0 0 8px",
                        }}
                      >
                        Optional: choose a
                        new JPG, PNG, or WebP
                        image.
                      </p>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(
                          event
                        ) => {
                          const file =
                            event.target
                              .files?.[0] ||
                            null;

                          setEditThumbnail(
                            file
                          );
                        }}
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "18px",
                        }}
                      />

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "10px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            saveDetails(
                              video
                            )
                          }
                          disabled={saving}
                          style={{
                            padding:
                              "10px 16px",
                            fontSize:
                              "15px",
                            fontWeight:
                              "bold",
                            cursor:
                              saving
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {saving
                            ? "Saving..."
                            : "Save Details"}
                        </button>

                        <button
                          onClick={
                            cancelEditing
                          }
                          disabled={saving}
                          style={{
                            padding:
                              "10px 16px",
                            fontSize:
                              "15px",
                            cursor:
                              saving
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2>
                        {displayTitle(
                          video
                        )}
                      </h2>

                      {video.description && (
                        <p
                          style={{
                            maxWidth:
                              "700px",
                            color:
                              "#dddddd",
                            fontSize:
                              "17px",
                            lineHeight:
                              1.6,
                            whiteSpace:
                              "pre-wrap",
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {
                            video.description
                          }
                        </p>
                      )}
                    </>
                  )} 
  <video
                    src={video.url}
                    poster={
                      video.thumbnailUrl ||
                      undefined
                    }
                    controls
                    style={{
                      width: "100%",
                      maxWidth: "700px",
                      borderRadius:
                        "10px",
                      display: "block",
                      marginBottom:
                        "15px",
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
                        startEditing(
                          video
                        )
                      }
                      style={{
                        padding:
                          "12px 18px",
                        fontSize: "16px",
                        fontWeight:
                          "bold",
                        cursor: "pointer",
                        backgroundColor:
                          "#fff",
                        color: "#000",
                        border:
                          "2px solid #000",
                        borderRadius:
                          "8px",
                      }}
                    >
                      Edit Details
                    </button>

                    <button
                      onClick={() =>
                        deleteVideo(
                          video
                        )
                      }
                      disabled={
                        deletingUrl ===
                        video.url
                      }
                      style={{
                        padding:
                          "12px 18px",
                        fontSize: "16px",
                        fontWeight:
                          "bold",
                        cursor:
                          deletingUrl ===
                          video.url
                            ? "not-allowed"
                            : "pointer",
                        backgroundColor:
                          "#b91c1c",
                        color: "#fff",
                        border:
                          "2px solid #000",
                        borderRadius:
                          "8px",
                      }}
                    >
                      {deletingUrl ===
                      video.url
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
