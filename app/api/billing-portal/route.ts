import { NextResponse } from "next/server";
import Stripe from "stripe";
import postgres from "postgres";
import {
  getCreatorFromSession,
} from "../../../lib/creator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const databaseUrl =
  process.env.RAYSSTREAM_DB_DATABASE_URL;

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY;

if (!databaseUrl) {
  throw new Error(
    "RAYSSTREAM_DB_DATABASE_URL is missing"
  );
}

const sql = postgres(databaseUrl, {
  ssl: "require",
});

export async function POST(request: Request) {
  try {
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return NextResponse.json(
        {
          error:
            "Please log in to your creator account.",
        },
        { status: 401 }
      );
    }

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error: "Stripe is not configured.",
        },
        { status: 500 }
      );
    }

    const rows = await sql`
      SELECT stripe_customer_id
      FROM live_creator_subscriptions
      WHERE LOWER(creator_email) =
        ${creator.email.trim().toLowerCase()}
      LIMIT 1
    `;

    const stripeCustomerId =
      rows[0]?.stripe_customer_id || "";

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "No Stripe subscription was found for this creator.",
        },
        { status: 404 }
      );
    }

    const stripe = new Stripe(
      stripeSecretKey
    );

    const requestUrl = new URL(request.url);

    const returnUrl = new URL(
      "/creator/dashboard",
      requestUrl.origin
    ).toString();

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
      });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error(
      "Stripe billing portal error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to open subscription management.",
      },
      { status: 500 }
    );
  }
} 
