import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminCredentialsValidationIssue } from "@/shared/config/env";

export const adminSessionCookieName = "kron_admin_session";

const adminSessionDurationInSeconds = 60 * 60 * 12;

export type AdminSession = {
  username: string;
  expiresAt: string;
};

function hashValue(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeCompare(left: string, right: string) {
  return timingSafeEqual(hashValue(left), hashValue(right));
}

function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const issue = getAdminCredentialsValidationIssue();

  return {
    username,
    password,
    issue,
    configured: issue === null,
  };
}

function createAdminSignatureKey() {
  const credentials = getAdminCredentials();

  if (!credentials.configured) {
    throw new Error("Credenciais de admin não configuradas.");
  }

  return createHash("sha256")
    .update(`${credentials.username}:${credentials.password}`)
    .digest();
}

function signAdminPayload(payload: string) {
  return createHmac("sha256", createAdminSignatureKey()).update(payload).digest("base64url");
}

function encodeAdminToken(payload: AdminSession & { nonce: string }) {
  const serializedPayload = JSON.stringify(payload);
  const encodedPayload = Buffer.from(serializedPayload, "utf8").toString("base64url");
  const signature = signAdminPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function decodeAdminToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signAdminPayload(encodedPayload);

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AdminSession & { nonce: string };

    return parsed;
  } catch {
    return null;
  }
}

async function setAdminCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionDurationInSeconds,
    priority: "high",
  });
}

export function areAdminCredentialsConfigured() {
  return getAdminCredentials().configured;
}

export function getAdminCredentialsIssue() {
  return getAdminCredentials().issue;
}

export function validateAdminCredentials(username: string, password: string) {
  const credentials = getAdminCredentials();

  if (!credentials.configured) {
    return false;
  }

  return (
    safeCompare(username.trim(), credentials.username!) &&
    safeCompare(password, credentials.password!)
  );
}

export async function createAdminSession() {
  const credentials = getAdminCredentials();

  if (!credentials.configured) {
    throw new Error(
      credentials.issue ?? "Credenciais administrativas não configuradas.",
    );
  }

  const expiresAt = new Date(Date.now() + adminSessionDurationInSeconds * 1000).toISOString();
  const token = encodeAdminToken({
    username: credentials.username!,
    expiresAt,
    nonce: randomBytes(16).toString("hex"),
  });

  await setAdminCookie(token);

  return {
    username: credentials.username!,
    expiresAt,
  };
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);
}

export async function getCurrentAdminSession() {
  const credentials = getAdminCredentials();

  if (!credentials.configured) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const parsed = decodeAdminToken(token);

  if (!parsed) {
    return null;
  }

  if (!safeCompare(parsed.username, credentials.username!)) {
    return null;
  }

  if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  return {
    username: parsed.username,
    expiresAt: parsed.expiresAt,
  };
}

export async function requireAdminSession(redirectTo = "/admin") {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect(`/admin/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return session;
}

export async function redirectAuthenticatedAdmin(redirectTo = "/admin") {
  const session = await getCurrentAdminSession();

  if (session) {
    redirect(redirectTo);
  }
}
