"use client";

const videos: Record<string, { title: string; file: string }> = {
  itscool: { title: "It's Cool", file: "/video1.mp4" },
  video1: { title: "It's Cool", file: "/video1.mp4" },
  video2: { title: "Video 2", file: "/video2.mp4" },
  video3: { title: "Spaceship", file: "/video3.mp4" },
};

export default function WatchPage({ params }: { params: { slug: string } }) {
  const video = videos[params.slug];

  if (!video) return <main style={{ padding: 20 }}>Video not found</main>;

  return (
    <main style={{ padding: 20 }}>
      <h1>{video.title}</h1>

      <video
        src={video.file}
        controls
        playsInline
        style={{ width: "100%", maxWidth: 900, background: "black" }}
      />
    </main>
  );
} 
