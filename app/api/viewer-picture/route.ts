import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(
  message: string,
  status: number
) {
  return new NextResponse(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isValidPicturePath(pathname: string) {
  if (pathname.length > 2048) {
    return false;
  }

  const parts = pathname.split("/");

  if (parts[0] !== "viewer-pictures") {
    return false;
  }

  // Support both existing pictures and new
  // viewer-pictures/VIEWER_ID/filename uploads.
  if (parts.length !== 2 && parts.length !== 3) {
    return false;
  }

  if (
    parts.length === 3 &&
    !/^[1-9][0-9]*$/.test(parts[1])
  ) {
    return false;
  }

  const filename = parts[parts.length - 1];

  return (
    filename.length > 0 &&
    filename !== "." &&
    filename !== ".." &&
    /^[a-zA-Z0-9._-]+$/.test(filename)
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const pathnames =
      searchParams.getAll("pathname");

    if (
      pathnames.length !== 1 ||
      !isValidPicturePath(pathnames[0])
    ) {
      return errorResponse(
        "A valid picture is required.",
        400
      );
    }

    const result = await get(pathnames[0], {
      access: "private",
    });

    if (
      !result ||
      result.statusCode !== 200 ||
      !result.stream
    ) {
      return errorResponse(
        "Picture not found.",
        404
      );
    }

    const contentType = (
      result.blob.contentType || ""
    )
      .split(";")[0]
      .trim()
      .toLowerCase();

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(contentType)) {
      await result.stream.cancel();

      return errorResponse(
        "Unsupported picture type.",
        415
      );
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error(
      "Unable to load viewer picture:",
      error
    );

    return errorResponse(
      "Unable to load picture.",
      500
    );
  }
} 
