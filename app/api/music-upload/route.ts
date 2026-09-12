import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
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

function safeEmail(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "")
    .replace(/@/g, "-at-");
}

export async function POST(request: Request) {
  try {
    const sessionResponse = await fetch(
      new URL("/api/creator-session", request.url),
      {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: "Creator login required. Please log in again." },
        { status: 401 }
      );
    }

    const session = await sessionResponse.json();

    const creatorEmail = String(
      session.email ||
        session.creatorEmail ||
        session.creator?.email ||
        ""
    )
      .trim()
      .toLowerCase();

    if (!creatorEmail) {
      return NextResponse.json(
        { error: "Creator session email was not found. Please log in again." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as HandleUploadBody;
    const creatorFolder = `music/${safeEmail(creatorEmail)}/`;

    const result = await handleUpload({
      request,
      body,

      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(creatorFolder)) {
          throw new Error("Invalid music upload folder.");
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

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Music file uploaded:", {
          url: blob.url,
          pathname: blob.pathname,
          tokenPayload,
        });
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Music upload token error:", error);

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
