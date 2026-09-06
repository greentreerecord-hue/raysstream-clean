import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getCreatorFromSession,
} from "../../../lib/creator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY;

const creatorLivePriceId =
  process.env.STRIPE_CREATOR_LIVE_PRICE_ID;

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

    if (
      !stripeSecretKey ||
      !creatorLivePriceId
    ) {
      return NextResponse.json(
        {
          error:
            "Creator Live checkout is not configured.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(
      stripeSecretKey
    );

    const requestUrl = new URL(request.url);

    const dashboardUrl = new URL(
      "/creator/dashboard",
      requestUrl.origin
    );

    const successUrl = new URL(
      dashboardUrl.toString()
    );

    successUrl.searchParams.set(
      "checkout",
      "success"
    );

    const cancelUrl = new URL(
      dashboardUrl.toString()
    );

    cancelUrl.searchParams.set(
      "checkout",
      "cancelled"
    );

    const checkoutSession =
      await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: creator.email,
        client_reference_id: String(
          creator.id
        ),
        line_items: [
          {
            price: creatorLivePriceId,
            quantity: 1,
          },
        ],
        metadata: {
          creator_id: String(creator.id),
          creator_email: creator.email,
        },
        subscription_data: {
          metadata: {
            creator_id: String(creator.id),
            creator_email: creator.email,
          },
        },
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
      });

    if (!checkoutSession.url) {
      return NextResponse.json(
        {
          error:
            "Stripe did not return a checkout URL.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error(
      "Creator Live checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to start Creator Live checkout.",
      },
      { status: 500 }
    );
  }
} 
