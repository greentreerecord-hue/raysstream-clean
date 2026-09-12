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

async function ensureMusicTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS music_releases (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER NOT NULL,
      creator_email TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      audio_url TEXT UNIQUE NOT NULL,
      audio_pathname TEXT,
      cover_url TEXT NOT NULL,
      cover_pathname TEXT,
      rights_confirmed BOOLEAN NOT NULL
        DEFAULT FALSE,
      review_status TEXT NOT NULL
        DEFAULT 'pending',
      published BOOLEAN NOT NULL
        DEFAULT FALSE,
      stripe_price_id TEXT,
      created_at TIMESTAMPTZ
        DEFAULT NOW(),
      updated_at TIMESTAMPTZ
        DEFAULT NOW()
    )
  `;
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

export async function GET(
  request: NextRequest
) {
  try {
    await ensureMusicTable();

    const showMine =
      request.nextUrl.searchParams.get(
        "mine"
      ) === "true";

    if (showMine) {
      const creator =
        await getCreator(request);

      if (!creator) {
        return NextResponse.json(
          {
            error:
              "Creator login required.",
          },
          { status: 401 }
        );
      }

      const creatorSongs = await sql`
        SELECT
          id,
          artist_name,
          title,
          genre,
          price_cents,
          audio_url,
          cover_url,
          rights_confirmed,
          review_status,
          published,
          created_at,
          updated_at
        FROM music_releases
        WHERE creator_id = ${creator.id}
        ORDER BY created_at DESC
      `;

      return NextResponse.json(
        {
          songs: creatorSongs.map(
            (song) => ({
              id: Number(song.id),
              artistName:
                song.artist_name,
              title: song.title,
              genre: song.genre,
              priceCents: Number(
                song.price_cents
              ),
              audioUrl: song.audio_url,
              coverUrl: song.cover_url,
              rightsConfirmed:
                song.rights_confirmed,
              reviewStatus:
                song.review_status,
              published: song.published,
              createdAt:
                song.created_at,
              updatedAt:
                song.updated_at,
            })
          ),
        },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidatevalidate",
          },
        }
      );
    }

    const publicSongs = await sql`
      SELECT
        id,
        artist_name,
        title,
        genre,
        price_cents,
        audio_url,
        cover_url,
        created_at
      FROM music_releases
      WHERE
        published = TRUE
        AND review_status = 'approved'
        AND rights_confirmed = TRUE
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      {
        songs: publicSongs.map(
          (song) => ({
            id: Number(song.id),
            artistName:
              song.artist_name,
            title: song.title,
            genre: song.genre,
            priceCents: Number(
              song.price_cents
            ),
            audioUrl: song.audio_url,
            coverUrl: song.cover_url,
            createdAt: song.created_at,
          })
        ),
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
      "Music catalog error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load the music catalog.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    await ensureMusicTable();

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

    const body = await request.json();

    const title = String(
      body.title || ""
    ).trim();

    const artistName = String(
      body.artistName || ""
    ).trim();

    const genre = String(
      body.genre || ""
    ).trim();

    const priceCents = Number(
      body.priceCents
    );

    const audioUrl = String(
      body.audioUrl || ""
    ).trim();

    const audioPathname = String(
      body.audioPathname || ""
    ).trim();

    const coverUrl = String(
      body.coverUrl || ""
    ).trim();

    const coverPathname = String(
      body.coverPathname || ""
    ).trim();

    const rightsConfirmed =
      body.rightsConfirmed === true;

    if (
      !title ||
      !artistName ||
      !genre ||
      !audioUrl ||
      !coverUrl
    ) {
      return NextResponse.json(
        {
          error:
            "Song title, artist, genre, audio, and cover artwork are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(priceCents) ||
      priceCents < 50 ||
      priceCents > 10000
    ) {
      return NextResponse.json(
        {
          error:
            "Song price must be between $0.50 and $100.00.",
        },
        { status: 400 }
      );
    }

    if (!rightsConfirmed) {
      return NextResponse.json(
        {
          error:
            "You must confirm that you own or license all rights.",
        },
        { status: 400 }
      );
    }

    const insertedRows = await sql`
      INSERT INTO music_releases (
        creator_id,
        creator_email,
        artist_name,
        title,
        genre,
        price_cents,
        audio_url,
        audio_pathname,
        cover_url,
        cover_pathname,
        rights_confirmed,
        review_status,
        published,
        updated_at
      )
      VALUES (
        ${creator.id},
        ${String(creator.email)
          .trim()
          .toLowerCase()},
        ${artistName},
        ${title},
        ${genre},
        ${priceCents},
        ${audioUrl},
        ${audioPathname || null},
        ${coverUrl},
        ${coverPathname || null},
        TRUE,
        'pending',
        FALSE,
        NOW()
      )
      RETURNING
        id,
        artist_name,
        title,
        genre,
        price_cents,
        audio_url,
        cover_url,
        review_status,
        published,
        created_at
    `;

    const song = insertedRows[0];

    return NextResponse.json(
      {
        message:
          "Song saved and submitted for review.",
        song: {
          id: Number(song.id),
          artistName: song.artist_name,
          title: song.title,
          genre: song.genre,
          priceCents: Number(
            song.price_cents
          ),
          audioUrl: song.audio_url,
          coverUrl: song.cover_url,
          reviewStatus:
            song.review_status,
          published: song.published,
          createdAt: song.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Save music release error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to save the music release.",
      },
      { status: 500 }
    );
  }
} 
