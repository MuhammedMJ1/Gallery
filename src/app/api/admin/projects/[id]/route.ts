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

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await _request.json();
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.layout !== undefined) updates.layout = body.layout;
    if (body.animation !== undefined) updates.animation = body.animation;
    if (body.images !== undefined) updates.images = body.images;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return;
    console.error("Update project error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return;
    console.error("Delete project error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
