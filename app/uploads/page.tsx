import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

export default async function UploadedVideosPage() {
  const result = await list({
    prefix: "videos/",
    token: process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
  });

  const videos = result.blobs.filter((blob) =>
    [".mp4", ".webm", ".mov"].some((ext) =>
      blob.pathname.toLowerCase().endsWith(ext)
    )
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "34px", marginBottom: "10px" }}>
          Ray&apos;sStream Creator Videos
        </h1>

        <p style={{ color: "#bbbbbb", marginBottom: "30px" }}>
          Videos uploaded by Ray&apos;sStream creators.
        </p>

        {videos.length === 0 ? (
          <p>No uploaded videos yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "30px",
            }}
          >
            {videos.map((video) => (
              <div
                key={video.url}
                style={{
                  background: "#171717",
                  padding: "20px",
                  borderRadius: "16px",
                }}
              >
                <video
                  src={video.url}
                  controls
                  playsInline
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    background: "black",
                    borderRadius: "12px",
                  }}
                />

                <p
                  style={{
                    marginTop: "12px",
                    wordBreak: "break-word",
                  }}
                >
                  {video.pathname.replace("videos/", "")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 
