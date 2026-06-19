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
      <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
        <h1>Video Not Found</h1>
        <ul>
          {videos.map((v) => (
            <li key={v.slug}>
              <Link href={`/watch/${v.slug}`}>{v.title}</Link>
            </li>
          ))}
        </ul>
        <Link href="/">← Back Home</Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#111827", color: "white", padding: 20 }}>
      <h1>{video.title}</h1>

      <video
        id="mainVideo"
        key={video.src}
        controls
        autoPlay
        muted
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

      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function () {
              var video = document.getElementById("mainVideo");
              if (video) {
                video.muted = true;
                video.play().catch(function () {});
              }
            }, 500);
          `,
        }}
      />

      <div style={{ marginTop: "20px" }}>
        <Link href="/">← Back Home</Link>
      </div>
    </main>
  );
} 
