import { del, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

function isAdmin(request: NextRequest) {
  const password = request.headers.get("x-admin-password");

  return (
    password &&
    process.env.ADMIN_PASSWORD &&
    password === process.env.ADMIN_PASSWORD
  );
}

function getStoreId() {
  const storeId = process.env.RAYSSTREAM_VIDEO_STORE_ID;

  if (!storeId) {
    throw new Error("RAYSSTREAM_VIDEO_STORE_ID is missing.");
  }

  return storeId;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: "Incorrect administrator password." },
        { status: 401 }
      );
    }

    const result = await list({
      prefix: "videos/",
      storeId: getStoreId(),
    });

    return NextResponse.json({
      videos: result.blobs,
    });
  } catch (error) {
    console.error("VIDEO LIST ERROR:", error);

    return NextResponse.json(
      { error: "Could not load videos." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: "Incorrect administrator password." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const url = body.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Video URL is required." },
        { status: 400 }
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
    console.error("VIDEO DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Could not delete video." },
      { status: 500 }
    );
  }
} 
