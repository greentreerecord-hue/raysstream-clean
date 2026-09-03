import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const pathname =
      searchParams.get("pathname");

    if (
      !pathname ||
      !pathname.startsWith(
        "viewer-pictures/"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid picture is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await get(pathname, {
      access: "private",
    });

    if (
      !result ||
      result.statusCode !== 200 ||
      !result.stream
    ) {
      return new NextResponse(
        "Picture not found.",
        {
          status: 404,
        }
      );
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type":
          result.blob.contentType ||
          "image/jpeg",
        "X-Content-Type-Options":
          "nosniff",
        "Cache-Control":
          "private, no-cache",
      },
    });
  } catch (error) {
    console.error(
      "Unable to load viewer picture:",
      error
    );

    return new NextResponse(
      "Unable to load picture.",
      {
        status: 500,
      }
    );
  }
} 
