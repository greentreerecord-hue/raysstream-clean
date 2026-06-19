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

  const video = videos.find((v) => v.slug === slug);

  if (!video) {
    return (
      <main
        style={{
          padding: "40px",
          background: "#111827",
          minHeight: "100vh",
          color: "white",
        }}
      >
        <h1 style={{ color: "#f97316" }}>Video Not Found</h1>

        <p>Available videos:</p>

        <ul>
          {videos.map((v) => (
            <li key={v.slug}>
              <Link href={`/watch/${v.slug}`}>{v.title}</Link>
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
        padding: "20px",
        background: "#111827",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>{video.title}</h1>

      <video
        controls
        autoPlay
        style={{
          width: "100%",
          maxWidth: "1000px",
          borderRadius: "12px",
        }}
      >
        <source src={video.src} type="video/mp4" />
      </video>

      <div style={{ marginTop: "20px" }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
