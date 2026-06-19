import Link from "next/link";

const videos = [
  {
    slug: "itscool",
    title: "It's Cool",
    src: "/videos/itscool.mp4",
  },
  {
    slug: "video2",
    title: "Video 2",
    src: "/videos/video2.mp4",
  },
  {
    slug: "spaceship",
    title: "Spaceship",
    src: "/videos/video3.mp4",
  },
];

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const video = videos.find(
    (v) =>
      v.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!video) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#111827",
          color: "white",
          padding: "40px",
        }}
      >
        <h1 style={{ color: "orange" }}>Video Not Found</h1>

        <p>Available videos:</p>

        <ul>
          {videos.map((v) => (
            <li key={v.slug}>
              <Link href={`/watch/${v.slug}`}>
                {v.title}
              </Link>
            </li>
          ))}
        </ul>

        <br />

        <Link href="/">← Back Home</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>{video.title}</h1>

      <video
        src={video.src}
        controls
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: "1000px",
          borderRadius: "12px",
        }}
      />

      <div style={{ marginTop: "20px" }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
