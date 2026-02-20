import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export const runtime = "nodejs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  let valid = false;
  if (token) {
    try {
      valid = verifySession(token);
    } catch {
      valid = false;
    }
  }
  if (!valid) throw new Error("Unauthorized");
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return;
    console.error("Admin projects fetch error:", err);
    const e = err as { message?: string; details?: string; hint?: string };
    const msg = e?.message ?? (err instanceof Error ? err.message : "Failed to fetch");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    let body: { title?: string; layout?: string; animation?: string; images?: string[] };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const title = body?.title ?? "Untitled";
    const layout = body?.layout ?? "grid";
    const animation = body?.animation ?? "fade";
    const images = Array.isArray(body?.images) ? body.images : [];
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .insert({ title, layout, animation, images })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return;
    console.error("Create project error:", err);
    const e = err as { message?: string; details?: string; hint?: string };
    const msg = e?.message ?? (err instanceof Error ? err.message : "Failed to create");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
