import "server-only";

import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import {
  isDatabaseConfigured,
  shouldUseLocalSeedData,
} from "@/backend/features/platform/server/mode";
import type { AuthenticatedUser } from "@/backend/features/platform/types";

const scrypt = promisify(scryptCallback);

export const sessionCookieName = "kron_session";
const sessionDurationInSeconds = 60 * 60 * 24 * 30;

function createSessionTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mapUserRowToAuthenticatedUser(row: {
  id: string;
  public_alias: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  created_at: string | Date;
}): AuthenticatedUser {
  return {
    id: row.id,
    publicAlias: row.public_alias,
    name: row.name,
    email: row.email,
    phone: row.phone,
    ...(row.city ? { city: row.city } : {}),
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, storedKey] = storedHash.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKeyBuffer = Buffer.from(storedKey, "hex");

  if (storedKeyBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKeyBuffer, derivedKey);
}

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationInSeconds,
    priority: "high",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function createSession(userId: string) {
  if (!isDatabaseConfigured() || shouldUseLocalSeedData()) {
    throw new Error("Banco de dados não configurado para criar sessões de usuário.");
  }

  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionDurationInSeconds * 1000);
  const sessionId = randomUUID();
  const tokenHash = createSessionTokenHash(token);

  await withPlatformDatabase(async (sql) => {
    await sql.begin(async (transaction) => {
      await transaction`
        delete from platform_sessions
        where user_id = ${userId}
      `;

      await transaction`
        insert into platform_sessions (
          id,
          user_id,
          token_hash,
          created_at,
          expires_at
        )
        values (
          ${sessionId},
          ${userId},
          ${tokenHash},
          ${now.toISOString()},
          ${expiresAt.toISOString()}
        )
      `;
    });
  });

  await setSessionCookie(token);

  return {
    id: sessionId,
    userId,
    tokenHash,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  try {
    if (token && isDatabaseConfigured() && !shouldUseLocalSeedData()) {
      await withPlatformDatabase(async (sql) => {
        await sql`
          delete from platform_sessions
          where token_hash = ${createSessionTokenHash(token)}
        `;
      });
    }
  } finally {
    await clearSessionCookie();
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(sessionCookieName)?.value;

  if (!sessionToken || !isDatabaseConfigured() || shouldUseLocalSeedData()) {
    return null;
  }

  return withPlatformDatabase(async (sql) => {
    const [row] = await sql<{
      id: string;
      public_alias: string;
      name: string;
      email: string;
      phone: string;
      city: string | null;
      created_at: string | Date;
    }[]>`
      select
        users.id,
        users.public_alias,
        users.name,
        users.email,
        users.phone,
        users.city,
        users.created_at
      from platform_sessions as sessions
      inner join platform_users as users
        on users.id = sessions.user_id
      where sessions.token_hash = ${createSessionTokenHash(sessionToken)}
        and sessions.expires_at > now()
      limit 1
    `;

    if (!row) {
      return null;
    }

    return mapUserRowToAuthenticatedUser(row);
  });
}

export async function requireAuthenticatedUser(redirectTo = "/area") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/entrar?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}
