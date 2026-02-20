import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Test Supabase connection and projects table. Remove in production.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
    return NextResponse.json({ ok: true, count: data?.length ?? 0 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
