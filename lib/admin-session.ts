import {
  createHmac,
  timingSafeEqual,
} from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE =
  "raysstream_admin_session";

export const ADMIN_SESSION_MAX_AGE =
  60 * 60 * 8;

function getAdminPassword() {
  const adminPassword =
    process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD is missing"
    );
  }

  return adminPassword;
}

function safeEqual(
  firstValue: string,
  secondValue: string
) {
  const first = Buffer.from(firstValue);
  const second = Buffer.from(secondValue);

  if (first.length !== second.length) {
    return false;
  }

  return timingSafeEqual(first, second);
}

function sign(expiresAt: string) {
  return createHmac(
    "sha256",
    getAdminPassword()
  )
    .update(expiresAt)
    .digest("base64url");
}

export function verifyAdminPassword(
  password: string
) {
  return safeEqual(
    password,
    getAdminPassword()
  );
}

export function createAdminSessionToken() {
  const expiresAt = String(
    Date.now() +
      ADMIN_SESSION_MAX_AGE * 1000
  );

  return `${expiresAt}.${sign(expiresAt)}`;
}

export function hasValidAdminSession(
  request: NextRequest
) {
  const token =
    request.cookies.get(
      ADMIN_SESSION_COOKIE
    )?.value || "";

  const separatorIndex =
    token.indexOf(".");

  if (separatorIndex < 1) {
    return false;
  }

  const expiresAt = token.slice(
    0,
    separatorIndex
  );

  const suppliedSignature = token.slice(
    separatorIndex + 1
  );

  const expiresAtNumber =
    Number(expiresAt);

  if (
    !Number.isFinite(expiresAtNumber) ||
    expiresAtNumber <= Date.now()
  ) {
    return false;
  }

  return safeEqual(
    suppliedSignature,
    sign(expiresAt)
  );
} 
