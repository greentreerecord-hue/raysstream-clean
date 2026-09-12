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

type CreatorRow = {
  id: number;
  name: string;
  email: string;
  stripe_account_id: string | null;
};

function getStripe() {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is missing"
    );
  }

  return new Stripe(stripeSecretKey);
}

async function ensureConnectColumn() {
  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS
      stripe_account_id TEXT
  `;
}

async function getCreatorEmail(
  request: Request
) {
  const cookie =
    request.headers.get("cookie") ?? "";

  const response = await fetch(
    new URL(
      "/api/creator-session",
      request.url
    ),
    {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return "";
  }

  const session = await response.json();

  return String(
    session.email ??
      session.creatorEmail ??
      session.creator?.email ??
      ""
  )
    .trim()
    .toLowerCase();
}

async function getCreator(email: string) {
  const creators = await sql<CreatorRow[]>`
    SELECT
      id,
      name,
      email,
      stripe_account_id
    FROM creators
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `;

  return creators[0] ?? null;
}

export async function GET(
  request: Request
) {
  try {
    await ensureConnectColumn();

    const creatorEmail =
      await getCreatorEmail(request);

    if (!creatorEmail) {
      return NextResponse.json(
        {
          error:
            "Creator login required.",
        },
        { status: 401 }
      );
    }

    const creator =
      await getCreator(creatorEmail);

    if (!creator) {
      return NextResponse.json(
        {
          error:
            "Creator account not found.",
        },
        { status: 404 }
      );
    }

    if (!creator.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
        payoutsEnabled: false,
        chargesEnabled: false,
      });
    }

    const stripe = getStripe();

    const account =
      await stripe.accounts.retrieve(
        creator.stripe_account_id
      );

    return NextResponse.json({
      connected: true,
      onboardingComplete: Boolean(
        account.details_submitted
      ),
      payoutsEnabled: Boolean(
        account.payouts_enabled
      ),
      chargesEnabled: Boolean(
        account.charges_enabled
      ),
      accountId: account.id,
    });
  } catch (error) {
    console.error(
      "Stripe Connect status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to check payout status.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    await ensureConnectColumn();

    const creatorEmail =
      await getCreatorEmail(request);

    if (!creatorEmail) {
      return NextResponse.json(
        {
          error:
            "Creator login required.",
        },
        { status: 401 }
      );
    }

    const creator =
      await getCreator(creatorEmail);

    if (!creator) {
      return NextResponse.json(
        {
          error:
            "Creator account not found.",
        },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    let stripeAccountId =
      creator.stripe_account_id;

    if (!stripeAccountId) {
      const account =
        await stripe.accounts.create({
          type: "express",
          country: "US",
          email: creator.email,
          business_type: "individual",
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            },
          },
          metadata: {
            creator_id: String(
              creator.id
            ),
            creator_email:
              creator.email,
            platform:
              "raysstream_music",
          },
        });

      stripeAccountId = account.id;

      await sql`
        UPDATE creators
        SET stripe_account_id =
          ${stripeAccountId}
        WHERE id = ${creator.id}
      `;
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ??
      new URL(request.url).origin;

    const accountLink =
      await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url:
          `${origin}/creator/music?stripe=refresh`,
        return_url:
          `${origin}/creator/music?stripe=return`,
        type: "account_onboarding",
      });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error(
      "Stripe Connect onboarding error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe payout setup.",
      },
      { status: 500 }
    );
  }
} 
