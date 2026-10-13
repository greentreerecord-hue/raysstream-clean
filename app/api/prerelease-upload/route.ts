import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCreatorFromSession } from "../../../lib/creator-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const token =
      process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Preview storage is not configured." },
        { status: 500 }
      );
    }

    const body =
      (await request.json()) as HandleUploadBody;

    const result = await handleUpload({
      token,
      request,
      body,

      onBeforeGenerateToken: async (pathname) => {
        const origin = request.headers.get("origin");

        if (origin !== new URL(request.url).origin) {
          throw new Error("Invalid request origin.");
        }

        const creator = await getCreatorFromSession(request);

        if (!creator) {
          throw new Error("Please log in as a creator.");
        }

        if (
          !/^prerelease\/[a-zA-Z0-9_-]+\.mp3$/i.test(pathname)
        ) {
          throw new Error("Please choose an MP3 preview.");
        }

        return {
          allowedContentTypes: ["audio/mpeg"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            creatorId: creator.id,
          }),
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("Prerelease preview uploaded:", blob.pathname);
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Prerelease upload failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not upload the preview.",
      },
      { status: 400 }
    );
  }
} 
