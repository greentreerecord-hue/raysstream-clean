import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import {
  getCreatorFromSession,
} from "../../../lib/creator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const blobToken =
  process.env
    .RAYSSTREAM_VIDEO_READ_WRITE_TOKEN;

function creatorFolders(
  email: string
) {
  const safeEmail = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  return {
    videoFolder:
      `videos/${safeEmail}/`,
    thumbnailFolder:
      `thumbnails/${safeEmail}/`,
  };
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const body =
      (await request.json()) as
        HandleUploadBody;

    const jsonResponse =
      await handleUpload({
        body,
        request,
        token: blobToken,

        onBeforeGenerateToken:
          async (pathname) => {
            const creator =
              await getCreatorFromSession(
                request
              );

            if (!creator) {
              throw new Error(
                "CREATOR_LOGIN_REQUIRED"
              );
            }

            const {
              videoFolder,
              thumbnailFolder,
            } = creatorFolders(
              creator.email
            );

            const isCreatorVideo =
              pathname.startsWith(
                videoFolder
              );

            const isCreatorThumbnail =
              pathname.startsWith(
                thumbnailFolder
              );

            if (
              !isCreatorVideo &&
              !isCreatorThumbnail
            ) {
              throw new Error(
                "INVALID_CREATOR_UPLOAD_PATH"
              );
            }

            if (
              pathname.includes("..") ||
              pathname.includes("\\")
            ) {
              throw new Error(
                "INVALID_CREATOR_UPLOAD_PATH"
              );
            }

            return {
              allowedContentTypes:
                isCreatorVideo
                  ? [
                      "video/mp4",
                      "video/webm",
                      "video/quicktime",
                    ]
                  : [
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                    ],
              addRandomSuffix: true,
            };
          },

        onUploadCompleted:
          async ({ blob }) => {
            console.log(
              "Ray'sStream upload completed:",
              blob.url
            );
          },
      });

    return NextResponse.json(
      jsonResponse
    );
  } catch (error) {
    console.error(
      "Client upload error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message.includes(
        "CREATOR_LOGIN_REQUIRED"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please log in to upload media.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      message.includes(
        "INVALID_CREATOR_UPLOAD_PATH"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot upload to this location.",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to authorize media upload.",
      },
      {
        status: 400,
      }
    );
  }
} 
