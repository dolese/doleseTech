import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import type { NextRequest } from "next/server";

/**
 * Admin sign-in: one shared password exchanged for a signed, httpOnly session
 * cookie.
 *
 * The password never travels again after sign-in, and the cookie cannot be
 * read by scripts on the page — unlike the previous scheme, which kept the
 * password in sessionStorage and re-sent it as a header on every request.
 * Sessions expire; the signature is what makes the cookie unforgeable.
 */

export const ADMIN_COOKIE = "dt_admin";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function secret(): string | null {
  // A dedicated secret is better — rotating it ends every session without
  // changing the password — but the password alone keeps setup to one value.
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Constant-time compare, so a wrong guess leaks nothing through timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function passwordMatches(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return safeEqual(provided, expected);
}

export function createSessionToken(): { value: string; maxAge: number } {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  // The nonce makes two sessions issued in the same millisecond distinct.
  const payload = `${expiresAt}.${randomBytes(9).toString("base64url")}`;
  return { value: `${payload}.${sign(payload, key)}`, maxAge: SESSION_MAX_AGE_SECONDS };
}

export function sessionValid(token: string | undefined): boolean {
  const key = secret();
  if (!key || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expiresAt, nonce, signature] = parts;

  if (!safeEqual(signature, sign(`${expiresAt}.${nonce}`, key))) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
}

export function requestHasAdminSession(req: NextRequest): boolean {
  return sessionValid(req.cookies.get(ADMIN_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
