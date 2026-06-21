export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main style={{ padding: "20px" }}>
      <h1>{slug}</h1>

      <video width="800" controls>
        <source src={`/videos/${slug}.mp4`} type="video/mp4" />
      </video>

      <p>Views: 0</p>
      <button>👍 Like</button>
      <button style={{ marginLeft: "10px" }}>🔔 Subscribe</button>

      <div style={{ marginTop: "20px" }}>
        <h3>Comments</h3>
        <textarea
          placeholder="Leave a comment..."
          style={{ width: "100%", height: "80px" }}
        />
      </div>
    </main>
  );
} 

