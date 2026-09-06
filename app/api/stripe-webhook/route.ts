import { NextResponse } from "next/server";
import Stripe from "stripe";
import postgres from "postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const databaseUrl =
  process.env.RAYSSTREAM_DB_DATABASE_URL;

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY;

const liveWebhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET;

const testWebhookSecret =
  process.env.STRIPE_TEST_WEBHOOK_SECRET;

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

function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
) {
  const legacySubscription =
    subscription as Stripe.Subscription & {
      current_period_end?: number;
    };

  const periodEnd =
    legacySubscription.current_period_end ||
    subscription.items.data[0]
      ?.current_period_end ||
    null;

  return periodEnd
    ? new Date(periodEnd * 1000)
    : null;
}

function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice
) {
  const legacyInvoice =
    invoice as Stripe.Invoice & {
      subscription?:
        | string
        | { id: string }
        | null;
    };

  const legacySubscriptionId = getId(
    legacyInvoice.subscription
  );

  if (legacySubscriptionId) {
    return legacySubscriptionId;
  }

  return getId(
    invoice.parent
      ?.subscription_details
      ?.subscription
  );
}

function verifyWebhook(
  stripe: Stripe,
  body: string,
  signature: string
) {
  if (liveWebhookSecret) {
    try {
      return {
        event: stripe.webhooks.constructEvent(
          body,
          signature,
          liveWebhookSecret
        ),
        mode: "live" as const,
      };
    } catch {
      // Try the sandbox signing secret next.
    }
  }

  if (testWebhookSecret) {
    try {
      return {
        event: stripe.webhooks.constructEvent(
          body,
          signature,
          testWebhookSecret
        ),
        mode: "test" as const,
      };
    } catch {
      // Neither signing secret matched.
    }
  }

  return null;
} 
export async function POST(request: Request) {
  if (!stripeSecretKey) {
    console.error(
      "STRIPE_SECRET_KEY is missing."
    );

    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  if (!liveWebhookSecret && !testWebhookSecret) {
    console.error(
      "Stripe webhook secrets are missing."
    );

    return NextResponse.json(
      {
        error:
          "Stripe webhooks are not configured.",
      },
      { status: 500 }
    );
  }

  const signature = request.headers.get(
    "stripe-signature"
  );

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe signature is missing." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const body = await request.text();

  const verified = verifyWebhook(
    stripe,
    body,
    signature
  );

  if (!verified) {
    console.error(
      "Stripe webhook signature verification failed."
    );

    return NextResponse.json(
      { error: "Invalid Stripe webhook." },
      { status: 400 }
    );
  }

  const { event, mode } = verified;

  if (mode === "test") {
    return NextResponse.json({
      received: true,
      mode: "test",
      eventType: event.type,
    });
  }

  try {
    await ensureSubscriptionTable();

    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      const creatorEmail =
        (
          session.customer_details?.email ||
          session.customer_email ||
          ""
        )
          .trim()
          .toLowerCase();

      const customerId = getId(
        session.customer
      );

      const subscriptionId = getId(
        session.subscription
      );

      if (creatorEmail && subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(
            subscriptionId
          );

        const periodEnd =
          getSubscriptionPeriodEnd(
            subscription
          );

        await sql`
          INSERT INTO live_creator_subscriptions (
            creator_email,
            stripe_customer_id,
            stripe_subscription_id,
            subscription_status,
            current_period_end,
            updated_at
          )
          VALUES (
            ${creatorEmail},
            ${customerId || null},
            ${subscriptionId},
            ${subscription.status},
            ${periodEnd},
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
            current_period_end =
              EXCLUDED.current_period_end,
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
        getSubscriptionPeriodEnd(
          subscription
        );

      await sql`
        UPDATE live_creator_subscriptions
        SET
          subscription_status =
            ${subscription.status},
          current_period_end =
            ${periodEnd},
          updated_at = NOW()
        WHERE stripe_subscription_id =
          ${subscription.id}
      `;
    }

    if (
      event.type ===
      "invoice.payment_failed"
    ) {
      const invoice =
        event.data.object as Stripe.Invoice;

      const subscriptionId =
        getInvoiceSubscriptionId(invoice);

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
      mode: "live",
    });
  } catch (error) {
    console.error(
      "Stripe webhook database error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process Stripe webhook.",
      },
      { status: 500 }
    );
  }
} 
