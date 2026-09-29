import { NextResponse } from "next/server";
import postgres from "postgres";
import Stripe from "stripe";

import {
  recordMusicPurchase,
} from "../../../lib/music-purchases";

import {
  getViewerIdFromSession,
} from "../../../lib/viewer-session";

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

function json(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: Request) {
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
      searchParams.get("session_id") ?? "";

    if (
      !/^cs_[a-zA-Z0-9_]+$/.test(sessionId) ||
      sessionId.length > 255
    ) {
      return json(
        {
          error:
            "A valid purchase session is required.",
        },
        400
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
      session.mode !== "payment" ||
      session.metadata?.purchase_type !== "music"
    ) {
      return json(
        {
          error: "This is not a music purchase.",
        },
        400
      );
    }

    if (
      session.payment_status !== "paid" ||
      session.status !== "complete"
    ) {
      return json(
        {
          error:
            "Payment has not been completed. Please refresh shortly.",
        },
        402
      );
    }

    const accountId =
      session.metadata?.viewer_id;

    if (accountId) {
      const purchaseViewerId =
        Number(accountId);

      if (
        !Number.isSafeInteger(purchaseViewerId) ||
        purchaseViewerId < 1
      ) {
        return json(
          {
            error:
              "The purchase account is invalid.",
          },
          400
        );
      }

      const viewerId =
        await getViewerIdFromSession(request);

      if (viewerId === null) {
        return json(
          {
            error:
              "Please sign in to the viewer account used for this purchase, then return to this page.",
          },
          401
        );
      }

      if (viewerId !== purchaseViewerId) {
        return json(
          {
            error:
              "This purchase belongs to a different viewer account.",
          },
          403
        );
      }
    }

    const releaseId = Number(
      session.metadata?.release_id
    );

    if (
      !Number.isSafeInteger(releaseId) ||
      releaseId < 1
    ) {
      return json(
        {
          error:
            "The purchased song could not be identified.",
        },
        400
      );
    }

    // This also runs in the webhook.
    // The session ID prevents duplicate records.
    await recordMusicPurchase(session);

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
      return json(
        {
          error:
            "The purchased song was not found.",
        },
        404
      );
    }

    const buyerEmail = String(
      session.customer_details?.email ??
        session.customer_email ??
        ""
    )
      .trim()
      .toLowerCase();

    return json({
      paid: true,
      sessionId: session.id,
      buyerEmail,
      amountTotalCents:
        session.amount_total ??
        release.price_cents,
      savedToMyMusic:
        Boolean(accountId) && session.livemode,
      song: {
        id: release.id,
        title: release.title,
        artistName: release.artist_name,
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

    return json(
      {
        error:
          "Unable to verify the music purchase. Please try again.",
      },
      500
    );
  }
} 
