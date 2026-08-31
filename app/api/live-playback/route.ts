import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const playbackUrl =
      process.env
        .CLOUDFLARE_STREAM_WEBRTC_PLAYBACK_URL;

    if (!playbackUrl) {
      console.error(
        "CLOUDFLARE_STREAM_WEBRTC_PLAYBACK_URL is missing."
      );

      return NextResponse.json(
        {
          available: false,
          error:
            "Live playback is not configured.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        available: true,
        playbackUrl,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Live playback error:",
      error
    );

    return NextResponse.json(
      {
        available: false,
        error:
          "Unable to load live playback.",
      },
      { status: 500 }
    );
  }
} 
