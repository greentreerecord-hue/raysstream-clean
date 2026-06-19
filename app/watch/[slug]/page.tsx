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
          background: "#111827",
          minHeight: "100vh",
          color: "white",
          padding: "20px",
        }}
      >
        <h1 style={{ color: "orange" }}>Video Not Found</h1>

        <ul>
          <li>
            <Link href="/watch/itscool">It's Cool</Link>
          </li>
          <li>
            <Link href="/watch/video2">Video 2</Link>
          </li>
          <li>
            <Link href="/watch/spaceship">Spaceship</Link>
          </li>
        </ul>

        <Link href="/">← Back Home</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#111827",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>{video.title}</h1>

      <video
        key={video.src}
        controls
        autoPlay
        playsInline
        preload="auto"
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "black",
          borderRadius: "12px",
        }}
      >
        <source src={video.src} type="video/mp4" />
      </video>

      <br />
      <br />

      <Link href="/">← Back Home</Link>
    </main>
  );
} 
