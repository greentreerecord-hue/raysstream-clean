import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import {
  getViewerIdFromSession,
} from "../../../lib/viewer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonResponse(
  body: unknown,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");

    if (
      request.headers.get("sec-fetch-site") ===
        "cross-site" ||
      (
        origin !== null &&
        origin !== new URL(request.url).origin
      )
    ) {
      return jsonResponse(
        {
          error:
            "This upload request is not allowed.",
        },
        403
      );
    }

    const viewerId =
      await getViewerIdFromSession(request);

    if (viewerId === null) {
      return jsonResponse(
        {
          error:
            "Please log in to upload a profile picture.",
        },
        401
      );
    }

    const contentType =
      request.headers.get("content-type") || "";

    if (
      !contentType
        .toLowerCase()
        .startsWith("multipart/form-data")
    ) {
      return jsonResponse(
        {
          error: "A picture upload is required.",
        },
        415
      );
    }

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return jsonResponse(
        {
          error: "Invalid picture upload.",
        },
        400
      );
    }

    const picture = formData.get("picture");

    if (!(picture instanceof File)) {
      return jsonResponse(
        {
          error:
            "Please choose a profile picture.",
        },
        400
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(picture.type)) {
      return jsonResponse(
        {
          error:
            "Only JPG, PNG, and WebP pictures are allowed.",
        },
        400
      );
    }

    if (
      picture.size === 0 ||
      picture.size > 4 * 1024 * 1024
    ) {
      return jsonResponse(
        {
          error:
            "Choose a picture larger than 0 bytes and no larger than 4 MB.",
        },
        400
      );
    }

    const extension =
      picture.type === "image/jpeg"
        ? "jpg"
        : picture.type === "image/png"
          ? "png"
          : "webp";

    // The account folder comes from the verified
    // session, never from browser-supplied identity.
    const blob = await put(
      `viewer-pictures/${viewerId}/${Date.now()}.${extension}`,
      picture,
      {
        access: "private",
        addRandomSuffix: true,
        contentType: picture.type,
      }
    );

    const pictureUrl =
      `/api/viewer-picture?pathname=${encodeURIComponent(
        blob.pathname
      )}`;

    return jsonResponse({
      url: pictureUrl,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error(
      "Viewer picture upload error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Unable to upload viewer picture.",
      },
      500
    );
  }
} 
