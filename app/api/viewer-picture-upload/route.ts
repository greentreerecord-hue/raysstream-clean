import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData =
      await request.formData();

    const picture = formData.get("picture");

    if (!(picture instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Please choose a profile picture.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(picture.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG, and WebP pictures are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    if (picture.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "Profile picture must be smaller than 4 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const safeName = picture.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    );

    const blob = await put(
      `viewer-pictures/${Date.now()}-${safeName}`,
      picture,
      {
        access: "private",
        addRandomSuffix: true,
      }
    );

    const pictureUrl =
      `/api/viewer-picture?pathname=${encodeURIComponent(
        blob.pathname
      )}`;

    return NextResponse.json({
      url: pictureUrl,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error(
      "Viewer picture upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to upload viewer picture.",
      },
      {
        status: 500,
      }
    );
  }
} 
