import { NextResponse } from "next/server";
import postgres from "postgres";
import {
  getCreatorFromSession,
} from "../../../lib/creator-session";

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
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return NextResponse.json(
        {
          error:
            "Please log in to your creator account.",
        },
        {
          status: 401,
        }
      );
    }

    await ensureSubscriptionTable();

    const rows = await sql`
      SELECT
        subscription_status,
        current_period_end
      FROM live_creator_subscriptions
      WHERE LOWER(creator_email) =
        ${creator.email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        active: false,
        status: "inactive",
        currentPeriodEnd: null,
      });
    }

    const status =
      rows[0].subscription_status;

    const active =
      status === "active" ||
      status === "trialing";

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
      {
        status: 500,
      }
    );
  }
} 
