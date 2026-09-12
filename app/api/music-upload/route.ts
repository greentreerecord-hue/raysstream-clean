import { createHash } from "crypto";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const databaseUrl =
  process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "RAYSSTREAM_DB_DATABASE_URL is missing"
  );
}

const sql = postgres(databaseUrl, {
  ssl: "require",
});

const SESSION_COOKIE =
  "raysstream_creator_session";

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function safeEmailPath(email: string) {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getCreator(
  request: NextRequest
) {
  const sessionToken =
    request.cookies.get(
      SESSION_COOKIE
    )?.value || "";

  if (!sessionToken) {
    return null;
  }

  const sessionTokenHash =
    hashSessionToken(sessionToken);

  const creatorRows = await sql`
    SELECT
      creators.id,
      creators.name,
      creators.email
    FROM creator_sessions
    INNER JOIN creators
      ON creators.id =
        creator_sessions.creator_id
    WHERE
      creator_sessions.session_token_hash =
        ${sessionTokenHash}
      AND creator_sessions.expires_at > NOW()
    LIMIT 1
  `;

  return creatorRows[0] || null;
}

export async function POST(
  request: NextRequest
) {
  try {
    const creator =
      await getCreator(request);

    if (!creator) {
      return NextResponse.json(
        {
          error: "Creator login required.",
        },
        { status: 401 }
      );
    }

    const body =
      (await request.json()) as HandleUploadBody;

    const creatorPath = safeEmailPath(
      String(creator.email)
    );

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (
        pathname
      ) => {
        const requiredPrefix =
          `music/${creatorPath}/`;

        if (
          !pathname.startsWith(
            requiredPrefix
          )
        ) {
          throw new Error(
            "Invalid music upload path."
          );
        }

        return {
          allowedContentTypes: [
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/mp4",
            "audio/x-m4a",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          maximumSizeInBytes:
            100 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            creatorId: Number(
              creator.id
            ),
            creatorEmail: String(
              creator.email
            )
              .trim()
              .toLowerCase(),
          }),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        console.log(
          "Creator music file uploaded:",
          {
            url: blob.url,
            pathname: blob.pathname,
            tokenPayload,
          }
        );
      },
    });

    return NextResponse.json(
      jsonResponse
    );
  } catch (error) {
    console.error(
      "Music upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload music file.",
      },
      { status: 400 }
    );
  }
} 
