import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["video/mp4"],
      addRandomSuffix: true,
    }),
    onUploadCompleted: async ({ blob }) => {
      console.log("Uploaded:", blob.url);
    },
  });

  return NextResponse.json(jsonResponse);
} 
