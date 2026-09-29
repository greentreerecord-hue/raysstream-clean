import { NextResponse } from "next/server";
import postgres from "postgres";
import Stripe from "stripe";

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
  audio_url: string;
};

function json(data: unknown, status: number) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}

function safeFilename(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100) || "raysstream-song"
  );
}

function getExtension(
  audioUrl: string,
  contentType: string
) {
  const pathname =
    new URL(audioUrl).pathname.toLowerCase();

  if (pathname.includes(".wav")) {
    return ".wav";
  }

  if (
    pathname.includes(".m4a") ||
    contentType.includes("mp4")
  ) {
    return ".m4a";
  }

  if (pathname.includes(".aac")) {
    return ".aac";
  }

  if (pathname.includes(".ogg")) {
    return ".ogg";
  }

  return ".mp3";
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
            "Payment has not been completed.",
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
              "Please sign in to the viewer account used for this purchase.",
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

    const releases =
      await sql<MusicRelease[]>`
        SELECT
          id,
          title,
          audio_url
        FROM music_releases
        WHERE id = ${releaseId}
        LIMIT 1
      `;

    const release = releases[0];

    if (!release || !release.audio_url) {
      return json(
        {
          error:
            "The purchased song was not found.",
        },
        404
      );
    }

    const audioUrl = new URL(
      release.audio_url
    );

    if (audioUrl.protocol !== "https:") {
      throw new Error(
        "The song download address is invalid."
      );
    }

    const audioResponse = await fetch(
      audioUrl,
      {
        cache: "no-store",
      }
    );

    if (
      !audioResponse.ok ||
      !audioResponse.body
    ) {
      throw new Error(
        "The song file could not be downloaded."
      );
    }

    const contentType =
      audioResponse.headers.get("content-type") ??
      "audio/mpeg";

    const extension = getExtension(
      release.audio_url,
      contentType
    );

    const filename =
      `${safeFilename(release.title)}${extension}`;

    const headers = new Headers();

    headers.set("Content-Type", contentType);

    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
        filename
      )}`
    );

    headers.set(
      "Cache-Control",
      "private, no-store, max-age=0"
    );

    headers.set("Vary", "Cookie");

    headers.set(
      "X-Content-Type-Options",
      "nosniff"
    );

    return new Response(audioResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(
      "Music download error:",
      error
    );

    return json(
      {
        error:
          "Unable to download the purchased song. Please try again.",
      },
      500
    );
  }
} 
