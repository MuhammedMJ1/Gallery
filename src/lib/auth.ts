import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not set");
  }
  return secret;
}

export function createSession(): string {
  const payload = JSON.stringify({
    admin: true,
    exp: Date.now() + SESSION_DURATION_MS,
  });
  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifySession(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [payload, signature] = decoded.split(".");
    if (!payload || !signature) return false;

    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }

    const data = JSON.parse(payload) as { admin?: boolean; exp?: number };
    if (!data.admin || !data.exp || data.exp < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function isAdmin(): Promise<boolean> {
  const token = await getSessionToken();
  return !!token && verifySession(token);
}
