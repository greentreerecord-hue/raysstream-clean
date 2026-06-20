import Link from "next/link";

const videos = {
  "its-cool": {
    title: "It's Cool",
    src: "/videos/itscool.mp4",
  },
  video2: {
    title: "Video 2",
    src: "/videos/video2.mp4",
  },
  video3: {
    title: "Spaceship",
    src: "/videos/video3.mp4",
  },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug as keyof typeof videos];

  if (!video) {
    return (
      <main style={{ background: "#050505", color: "white", minHeight: "100vh", padding: 24 }}>
        <h1>Video not found</h1>
        <Link href="/">Back Home</Link>
      </main>
    );
  }
