"import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const filename = new URL(request.url).searchParams.get("filename");

  if (!filename) {
    return Response.json({ error: "Missing filename" }, { status: 400 });
  }

  const blob = await put(`videos/${filename}`, request.body!, {
    access: "public",
    addRandomSuffix: true,
  });

  return Response.json(blob);
} 
