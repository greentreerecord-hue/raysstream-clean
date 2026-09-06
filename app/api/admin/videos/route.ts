import {
  del,
  list,
} from "@vercel/blob";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  hasValidAdminSession,
} from "../../../../lib/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStoreId() {
  const storeId =
    process.env.RAYSSTREAM_VIDEO_STORE_ID;

  if (!storeId) {
    throw new Error(
      "RAYSSTREAM_VIDEO_STORE_ID is missing."
    );
  }

  return storeId;
}

function unauthorized() {
  return NextResponse.json(
    {
      error:
        "Administrator login required.",
    },
    {
      status: 401,
    }
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    if (
      !hasValidAdminSession(request)
    ) {
      return unauthorized();
    }

    const result = await list({
      prefix: "videos/",
      storeId: getStoreId(),
    });

    return NextResponse.json({
      videos: result.blobs,
    });
  } catch (error) {
    console.error(
      "VIDEO LIST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load videos.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    if (
      !hasValidAdminSession(request)
    ) {
      return unauthorized();
    }

    const body = await request.json();

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    if (!url) {
      return NextResponse.json(
        {
          error:
            "Video URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await list({
      prefix: "videos/",
      storeId: getStoreId(),
    });

    const videoBelongsToStore =
      result.blobs.some(
        (video) =>
          video.url === url
      );

    if (!videoBelongsToStore) {
      return NextResponse.json(
        {
          error:
            "Video was not found in Ray'sStream storage.",
        },
        {
          status: 404,
        }
      );
    }

    await del(url, {
      storeId: getStoreId(),
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted.",
    });
  } catch (error) {
    console.error(
      "VIDEO DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not delete video.",
      },
      {
        status: 500,
      }
    );
  }
} 
