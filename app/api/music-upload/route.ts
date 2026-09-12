import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const allowedContentTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "image/jpeg",
  "image/png",
  "image/webp",
];

function safeEmail(email: string) {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "-");
}

export async function POST(request: Request) {
  try {
    const blobToken =
      process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN;

    if (!blobToken) {
      return NextResponse.json(
        {
          error:
            "RAYSSTREAM_VIDEO_READ_WRITE_TOKEN is missing.",
        },
        { status: 500 }
      );
    }

    const cookie = request.headers.get("cookie") ?? "";

    const sessionResponse = await fetch(
      new URL("/api/creator-session", request.url),
      {
        method: "GET",
        headers: {
          cookie,
        },
        cache: "no-store",
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: "Creator login required." },
        { status: 401 }
      );
    }

    const session = await sessionResponse.json();

    const creatorEmail = String(
      session.email ??
        session.creatorEmail ??
        session.creator?.email ??
        ""
    )
      .trim()
      .toLowerCase();

    if (!creatorEmail) {
      return NextResponse.json(
        {
          error:
            "Creator session email was not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body =
      (await request.json()) as HandleUploadBody;

    const creatorFolder =
      `music/${safeEmail(creatorEmail)}/`;

    const result = await handleUpload({
      token: blobToken,
      request,
      body,

      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("music/")) {
          throw new Error(
            "Invalid music upload folder."
          );
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            creatorEmail,
          }),
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log(
          "Music file uploaded:",
          blob.pathname
        );
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Music upload token error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare the music upload.",
      },
      { status: 400 }
    );
  }
} 
