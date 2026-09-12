import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

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

function authorized(request: Request) {
  const enteredPassword =
    request.headers.get("x-admin-password");

  const savedPassword =
    process.env.RAYSSTREAM_ADMIN_PASSWORD ??
    process.env.ADMIN_PASSWORD;

  return Boolean(
    savedPassword &&
      enteredPassword === savedPassword
  );
}

export async function GET(request: Request) {
  try {
    if (!authorized(request)) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 401 }
      );
    }

    const releases = await sql`
      SELECT
        id,
        creator_email,
        title,
        artist_name,
        genre,
        price_cents,
        audio_url,
        cover_url,
        rights_confirmed,
        review_status,
        published,
        created_at
      FROM music_releases
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ releases });
  } catch (error) {
    console.error("Admin music GET error:", error);

    return NextResponse.json(
      { error: "Unable to load music releases." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!authorized(request)) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);
    const action = String(body.action ?? "");

    if (
      !Number.isInteger(id) ||
      id < 1 ||
      !["approve", "reject"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Valid release and action required." },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const approved = await sql`
        UPDATE music_releases
        SET
          review_status = 'approved',
          published = TRUE,
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (approved.length === 0) {
        return NextResponse.json(
          { error: "Music release not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Song approved and published.",
        release: approved[0],
      });
    }

    const rejected = await sql`
      UPDATE music_releases
      SET
        review_status = 'rejected',
        published = FALSE,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (rejected.length === 0) {
      return NextResponse.json(
        { error: "Music release not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Song rejected and unpublished.",
      release: rejected[0],
    });
  } catch (error) {
    console.error("Admin music PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update music release." },
      { status: 500 }
    );
  }
} 
