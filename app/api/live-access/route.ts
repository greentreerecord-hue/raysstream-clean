import { createHash } from "crypto";
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

export async function GET(
  request: NextRequest
) {
  try {
    const sessionToken =
      request.cookies.get(
        SESSION_COOKIE
      )?.value || "";

    if (!sessionToken) {
      return NextResponse.json(
        {
          authorized: false,
          error: "Creator login required.",
        },
        { status: 401 }
      );
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

    if (creatorRows.length === 0) {
      return NextResponse.json(
        {
          authorized: false,
          error:
            "Your creator session has expired.",
        },
        { status: 401 }
      );
    }

    const creator = creatorRows[0];

    const creatorEmail = String(
      creator.email
    )
      .trim()
      .toLowerCase();

    const subscriptionRows = await sql`
      SELECT subscription_status
      FROM live_creator_subscriptions
      WHERE
        LOWER(creator_email) =
          ${creatorEmail}
        AND subscription_status IN (
          'active',
          'trialing'
        )
      LIMIT 1
    `;

    if (subscriptionRows.length === 0) {
      return NextResponse.json(
        {
          authorized: false,
          subscribed: false,
          error:
            "An active Creator Live subscription is required.",
        },
        { status: 403 }
      );
    }

    const publishUrl =
      process.env
        .CLOUDFLARE_STREAM_WEBRTC_PUBLISH_URL;

    const playbackUrl =
      process.env
        .CLOUDFLARE_STREAM_WEBRTC_PLAYBACK_URL;

    if (!publishUrl || !playbackUrl) {
      console.error(
        "Cloudflare Stream environment variables are missing."
      );

      return NextResponse.json(
        {
          authorized: false,
          error:
            "Live streaming is not configured.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        authorized: true,
        subscribed: true,
        creator: {
          id: creator.id,
          name: creator.name,
          email: creator.email,
        },
        publishUrl,
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
      "Live access error:",
      error
    );

    return NextResponse.json(
      {
        authorized: false,
        error:
          "Unable to verify live-stream access.",
      },
      { status: 500 }
    );
  }
} 
