import postgres from "postgres";
import type Stripe from "stripe";

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

export async function ensureMusicPurchasesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS viewer_music_purchases (
      stripe_session_id TEXT PRIMARY KEY,
      viewer_id INTEGER NOT NULL
        REFERENCES viewers(id) ON DELETE CASCADE,
      release_id INTEGER NOT NULL,
      amount_total_cents INTEGER NOT NULL,
      currency TEXT NOT NULL,
      purchased_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS
      viewer_music_purchases_viewer_idx
    ON viewer_music_purchases (
      viewer_id,
      purchased_at DESC
    )
  `;
}

// Only pass sessions retrieved from Stripe
// or received through a verified Stripe webhook.
export async function recordMusicPurchase(
  session: Stripe.Checkout.Session
) {
  if (
    session.mode !== "payment" ||
    session.metadata?.purchase_type !== "music" ||
    session.payment_status !== "paid" ||
    session.status !== "complete" ||
    !session.livemode
  ) {
    return;
  }

  const viewerId = Number(
    session.metadata?.viewer_id
  );

  // Older guest purchases have no viewer ID.
  // They retain their existing download flow.
  if (
    !Number.isSafeInteger(viewerId) ||
    viewerId < 1
  ) {
    return;
  }

  const releaseId = Number(
    session.metadata?.release_id
  );

  const amountTotal = session.amount_total;

  if (
    !Number.isSafeInteger(releaseId) ||
    releaseId < 1 ||
    amountTotal === null ||
    !Number.isSafeInteger(amountTotal) ||
    amountTotal < 0 ||
    !session.currency
  ) {
    throw new Error(
      "The music purchase details are invalid."
    );
  }

  await ensureMusicPurchasesTable();

  await sql`
    INSERT INTO viewer_music_purchases (
      stripe_session_id,
      viewer_id,
      release_id,
      amount_total_cents,
      currency,
      purchased_at
    )
    SELECT
      ${session.id},
      viewers.id,
      ${releaseId},
      ${amountTotal},
      ${session.currency},
      ${new Date(session.created * 1000)}
    FROM viewers
    WHERE viewers.id = ${viewerId}
    ON CONFLICT (stripe_session_id)
    DO NOTHING
  `;
} 
