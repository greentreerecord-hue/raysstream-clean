import { NextResponse } from "next/server";
import postgres from "postgres";

import {
  getViewerIdFromSession,
} from "../../../lib/viewer-session";

import {
  ensureMusicPurchasesTable,
} from "../../../lib/music-purchases";

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

type PurchasedMusicRow = {
  stripe_session_id: string;
  release_id: number;
  purchased_at: Date;
  title: string | null;
  artist_name: string | null;
  genre: string | null;
  audio_url: string | null;
  cover_url: string | null;
};

function json(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}

export async function GET(request: Request) {
  try {
    const viewerId =
      await getViewerIdFromSession(request);

    if (viewerId === null) {
      return json(
        {
          error:
            "Please sign in to your viewer account to access My Music.",
        },
        401
      );
    }

    await ensureMusicPurchasesTable();

    // Show each song once, even if it was
    // purchased more than once.
    const songs = await sql<PurchasedMusicRow[]>`
      SELECT
        purchases.stripe_session_id,
        purchases.release_id,
        purchases.purchased_at,
        releases.title,
        releases.artist_name,
        releases.genre,
        releases.audio_url,
        releases.cover_url
      FROM (
        SELECT DISTINCT ON (release_id)
          stripe_session_id,
          release_id,
          purchased_at
        FROM viewer_music_purchases
        WHERE viewer_id = ${viewerId}
        ORDER BY
          release_id,
          purchased_at DESC,
          stripe_session_id DESC
      ) AS purchases
      LEFT JOIN music_releases AS releases
        ON releases.id = purchases.release_id
      ORDER BY purchases.purchased_at DESC
    `;

    return json({
      songs: songs.map((song) => ({
        id: Number(song.release_id),
        title:
          song.title || "Unavailable song",
        artistName: song.artist_name || "",
        genre: song.genre || "",
        coverUrl: song.cover_url || "",
        audioUrl: song.audio_url || "",
        available: Boolean(song.audio_url),
        purchasedAt:
          new Date(song.purchased_at).toISOString(),
        purchaseUrl:
          `/music-purchase/success?session_id=${encodeURIComponent(
            song.stripe_session_id
          )}`,
        downloadUrl:
          `/api/music-download?session_id=${encodeURIComponent(
            song.stripe_session_id
          )}`,
      })),
    });
  } catch (error) {
    console.error(
      "My Music error:",
      error
    );

    return json(
      {
        error:
          "Unable to load your purchased music. Please try again.",
      },
      500
    );
  }
} 
