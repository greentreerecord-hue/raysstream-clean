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

async function ensureSubscriptionTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS live_creator_subscriptions (
      id SERIAL PRIMARY KEY,
      creator_email TEXT UNIQUE NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT UNIQUE,
      subscription_status TEXT NOT NULL DEFAULT 'inactive',
      current_period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(request: Request) {
  try {
    await ensureSubscriptionTable();

    const { searchParams } = new URL(request.url);
    const email =
      searchParams.get("email")?.trim().toLowerCase() ||
      "";

    if (!email) {
      return NextResponse.json(
        {
          error: "Creator email is required.",
        },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT
        subscription_status,
        current_period_end
      FROM live_creator_subscriptions
      WHERE LOWER(creator_email) = ${email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        active: false,
        status: "inactive",
        currentPeriodEnd: null,
      });
    }

    const status = rows[0].subscription_status;
    const active =
      status === "active" || status === "trialing";

    return NextResponse.json({
      active,
      status,
      currentPeriodEnd:
        rows[0].current_period_end || null,
    });
  } catch (error) {
    console.error(
      "Live subscription status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to check the Creator Live subscription.",
      },
      { status: 500 }
    );
  }
} 
