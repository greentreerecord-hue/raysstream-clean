export default function UploadPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "white", padding: 24 }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Ray&apos;sStream Upload</h1>

      <p style={{ fontSize: 18, color: "#ccc" }}>
        Real uploads are done through GitHub for now.
      </p>

      <section style={{ marginTop: 24, padding: 20, background: "#111", borderRadius: 12 }}>
        <h2>Upload video files here:</h2>

        <pre style={{ background: "#000", padding: 16, borderRadius: 8 }}>
public/videos
        </pre>

        <h2>Video file names:</h2>

        <pre style={{ background: "#000", padding: 16, borderRadius: 8 }}>
video1.mp4
video2.mp4
video3.mp4
        </pre>

        <p>
          After uploading to <b>public/videos</b>, commit the changes and redeploy on Vercel.
        </p>
      </section>

      <a
        href="/"
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "12px 18px",
          background: "red",
          color: "white",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Back to Home
      </a>
    </main>
  );
} 
