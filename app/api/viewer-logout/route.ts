import { NextResponse } from "next/server";

import {
  revokeViewerSession,
  clearViewerSessionCookie,
} from "../../../lib/viewer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (
    request.headers.get("sec-fetch-site") ===
      "cross-site" ||
    (
      origin !== null &&
      origin !== new URL(request.url).origin
    )
  ) {
    return NextResponse.json(
      {
        error: "This logout request is not allowed.",
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    await revokeViewerSession(request);

    const response = NextResponse.json({
      message: "You have been logged out.",
    });

    clearViewerSessionCookie(response);

    return response;
  } catch (error) {
    console.error("Viewer logout error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to log out. Please try again.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
} 
