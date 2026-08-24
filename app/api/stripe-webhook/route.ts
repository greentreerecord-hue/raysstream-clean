import { NextResponse } from "next/server";
import Stripe from "stripe";
import postgres from "postgres";

export const dynamic = "force-dynamic";

const databaseUrl =
  process.env.RAYSSTREAM_DB_DATABASE_URL;

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY;

const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET;

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

function getId(
  value:
    | string
    | { id: string }
    | null
    | undefined
) {
  if (!value) {
    return "";
  }

  return typeof value === "string"
    ? value
    : value.id;
}

export async function POST(request: Request) {
  if (!stripeSecretKey || !webhookSecret) {
    console.error(
      "Stripe environment variables are missing."
    );

    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = request.headers.get(
    "stripe-signature"
  );

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe signature is missing." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature error:",
      error
    );

    return NextResponse.json(
      { error: "Invalid Stripe webhook." },
      { status: 400 }
    );
  }

  try {
    await ensureSubscriptionTable();

    if (event.type === "checkout.session.completed") {
      const session =
        event.data.object as Stripe.Checkout.Session;

      const creatorEmail =
        session.customer_details?.email
          ?.trim()
          .toLowerCase() || "";

      const customerId = getId(session.customer);
      const subscriptionId = getId(
        session.subscription
      );

      if (creatorEmail && subscriptionId) {
        await sql`
          INSERT INTO live_creator_subscriptions (
            creator_email,
            stripe_customer_id,
            stripe_subscription_id,
            subscription_status,
            updated_at
          )
          VALUES (
            ${creatorEmail},
            ${customerId || null},
            ${subscriptionId},
            ${
              session.payment_status === "paid"
                ? "active"
                : "inactive"
            },
            NOW()
          )
          ON CONFLICT (creator_email)
          DO UPDATE SET
            stripe_customer_id =
              EXCLUDED.stripe_customer_id,
            stripe_subscription_id =
              EXCLUDED.stripe_subscription_id,
            subscription_status =
              EXCLUDED.subscription_status,
            updated_at = NOW()
        `;
      }
    }

    if (
      event.type ===
        "customer.subscription.updated" ||
      event.type ===
        "customer.subscription.deleted"
    ) {
      const subscription =
        event.data.object as Stripe.Subscription;

      const periodEnd =
        subscription.items.data[0]
          ?.current_period_end;

      await sql`
        UPDATE live_creator_subscriptions
        SET
          subscription_status =
            ${subscription.status},
          current_period_end = ${
            periodEnd
              ? new Date(periodEnd * 1000)
              : null
          },
          updated_at = NOW()
        WHERE stripe_subscription_id =
          ${subscription.id}
      `;
    }

    if (
      event.type === "invoice.payment_failed"
    ) {
      const invoice =
        event.data.object as Stripe.Invoice;

      const subscriptionId =
        typeof invoice.parent
          ?.subscription_details?.subscription ===
        "string"
          ? invoice.parent.subscription_details
              .subscription
          : invoice.parent
              ?.subscription_details?.subscription
              ?.id || "";

      if (subscriptionId) {
        await sql`
          UPDATE live_creator_subscriptions
          SET
            subscription_status = 'past_due',
            updated_at = NOW()
          WHERE stripe_subscription_id =
            ${subscriptionId}
        `;
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook database error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to process Stripe webhook." },
      { status: 500 }
    );
  }
} 
