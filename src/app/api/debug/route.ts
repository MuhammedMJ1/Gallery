import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Safe diagnostic endpoint - returns env var presence (not values).
 * Remove or protect in production.
 */
export async function GET() {
  const ok = {
    adminPassword: !!process.env.ADMIN_PASSWORD,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  return NextResponse.json(ok);
}
