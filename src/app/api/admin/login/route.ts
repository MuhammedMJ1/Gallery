import { NextRequest, NextResponse } from "next/server";
import { createSession, verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    let password: string | undefined;
    try {
      const body = await request.json();
      password = typeof body === "object" && body && "password" in body ? body.password : undefined;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin login is not configured" },
        { status: 500 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = createSession();
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    const msg = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    const valid = !!token && verifySession(token);
    return NextResponse.json({ authenticated: valid });
  } catch (err) {
    console.error("Auth check error:", err);
    return NextResponse.json({ authenticated: false });
  }
}
