import { NextResponse } from "next/server";
import postgres from "postgres";
import Stripe from "stripe";

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

type MusicRelease = {
  id: number;
  creator_email: string;
  title: string;
  artist_name: string;
  genre: string;
  price_cents: number;
  audio_url: string;
  cover_url: string;
  stripe_account_id: string | null;
};

async function ensureConnectColumn() {
  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS
      stripe_account_id TEXT
  `;
}

export async function POST(
  request: Request
) {
  try {
    await ensureConnectColumn();

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is missing"
      );
    }

    const body = await request.json();

    const releaseId = Number(
      body.releaseId
    );

    if (
      !Number.isInteger(releaseId) ||
      releaseId < 1
    ) {
      return NextResponse.json(
        {
          error:
            "A valid music release is required.",
        },
        { status: 400 }
      );
    }

    const rows =
      await sql<MusicRelease[]>`
        SELECT
          music_releases.id,
          music_releases.creator_email,
          music_releases.title,
          music_releases.artist_name,
          music_releases.genre,
          music_releases.price_cents,
          music_releases.audio_url,
          music_releases.cover_url,
          creators.stripe_account_id
        FROM music_releases
        LEFT JOIN creators
          ON LOWER(creators.email) =
             LOWER(
               music_releases.creator_email
             )
        WHERE
          music_releases.id =
            ${releaseId}
          AND music_releases.review_status =
            'approved'
          AND music_releases.published =
            TRUE
        LIMIT 1
      `;

    const release = rows[0];

    if (!release) {
      return NextResponse.json(
        {
          error:
            "This song is not available for purchase.",
        },
        { status: 404 }
      );
    }

    if (!release.stripe_account_id) {
      return NextResponse.json(
        {
          error:
            "This creator must finish Stripe payout setup before accepting purchases.",
        },
        { status: 409 }
      );
    }

    const priceCents = Number(
      release.price_cents
    );

    if (
      !Number.isInteger(priceCents) ||
      priceCents < 50
    ) {
      return NextResponse.json(
        {
          error:
            "The song price is invalid.",
        },
        { status: 400 }
      );
    }

    const platformFeeCents =
      Math.round(priceCents * 0.4);

    const creatorShareCents =
      priceCents - platformFeeCents;

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ??
      new URL(request.url).origin;

    const stripe = new Stripe(
      stripeSecretKey
    );

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: [
          "card",
        ],

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount:
                priceCents,
              product_data: {
                name: release.title,
                description:
                  `${release.artist_name} · ${release.genre}`,
                images: release.cover_url
                  ? [
                      release.cover_url,
                    ]
                  : [],
              },
            },
          },
        ],

        payment_intent_data: {
          application_fee_amount:
            platformFeeCents,

          transfer_data: {
            destination:
              release.stripe_account_id,
          },

          metadata: {
            purchase_type:
              "music",
            release_id: String(
              release.id
            ),
            creator_email:
              release.creator_email,
            platform_fee_percent:
              "40",
            creator_share_percent:
              "60",
          },
        },

        metadata: {
          purchase_type: "music",
          release_id: String(
            release.id
          ),
          creator_email:
            release.creator_email,
          platform_fee_percent:
            "40",
          creator_share_percent:
            "60",
        },

        success_url:
          `${origin}/music-purchase/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${origin}/music-shop?purchase=cancelled`,
      });

    if (!session.url) {
      throw new Error(
        "Stripe did not return a checkout link."
      );
    }

    return NextResponse.json({
      url: session.url,
      platformFeeCents,
      creatorShareCents,
    });
  } catch (error) {
    console.error(
      "Music checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start music checkout.",
      },
      { status: 500 }
    );
  }
} 
