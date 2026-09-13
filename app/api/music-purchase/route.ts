import { NextResponse } from "next/server";
import postgres from "postgres";
import Stripe from "stripe";

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

type MusicRelease = {
  id: number;
  title: string;
  artist_name: string;
  genre: string;
  audio_url: string;
  cover_url: string;
  price_cents: number;
};

export async function GET(
  request: Request
) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );
    }

    const { searchParams } =
      new URL(request.url);

    const sessionId =
      searchParams.get("session_id") ??
      "";

    if (
      !sessionId ||
      !sessionId.startsWith("cs_")
    ) {
      return NextResponse.json(
        {
          error:
            "A valid purchase session is required.",
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(
      stripeSecretKey
    );

    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    if (
      session.metadata?.purchase_type !==
      "music"
    ) {
      return NextResponse.json(
        {
          error:
            "This is not a music purchase.",
        },
        { status: 400 }
      );
    }

    if (
      session.payment_status !== "paid"
    ) {
      return NextResponse.json(
        {
          error:
            "Payment has not been completed.",
        },
        { status: 402 }
      );
    }

    const releaseId = Number(
      session.metadata.release_id
    );

    if (
      !Number.isInteger(releaseId) ||
      releaseId < 1
    ) {
      return NextResponse.json(
        {
          error:
            "The purchased song could not be identified.",
        },
        { status: 400 }
      );
    }

    const releases =
      await sql<MusicRelease[]>`
        SELECT
          id,
          title,
          artist_name,
          genre,
          audio_url,
          cover_url,
          price_cents
        FROM music_releases
        WHERE id = ${releaseId}
        LIMIT 1
      `;

    const release = releases[0];

    if (!release) {
      return NextResponse.json(
        {
          error:
            "The purchased song was not found.",
        },
        { status: 404 }
      );
    }

    const buyerEmail = String(
      session.customer_details?.email ??
        session.customer_email ??
        ""
    )
      .trim()
      .toLowerCase();

    return NextResponse.json({
      paid: true,
      sessionId: session.id,
      buyerEmail,
      amountTotalCents:
        session.amount_total ??
        release.price_cents,
      song: {
        id: release.id,
        title: release.title,
        artistName:
          release.artist_name,
        genre: release.genre,
        audioUrl: release.audio_url,
        coverUrl: release.cover_url,
      },
    });
  } catch (error) {
    console.error(
      "Music purchase verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify the music purchase.",
      },
      { status: 500 }
    );
  }
} 
