"use server";

import { createAdminClient } from "@/lib/supabase/admin";

function generateId(): string {
    // Generate a short random ID
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export async function createShareLink(
    pdfUrl: string,
    options: {
        expiryDays?: number;
        secretCode?: string;
    } = {}
) {
    try {
        const supabase = createAdminClient();
        const id = generateId();

        const expiresAt = options.expiryDays
            ? new Date(Date.now() + options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
            : null;

        const { error } = await supabase.from("shared_links").insert([
            {
                id,
                booklet_url: pdfUrl,
                secret_code: options.secretCode || null,
                expires_at: expiresAt,
            },
        ]);

        if (error) {
            console.error("Share link error:", error);
            return { error: error.message };
        }

        return { success: true, id };
    } catch (error: any) {
        console.error("Unexpected error:", error);
        return { error: error.message || "حدث خطأ غير متوقع" };
    }
}

export async function validateShareLink(id: string, secretCode?: string) {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("shared_links")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return { error: "الرابط غير موجود" };
        }

        // Check expiry
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return { error: "انتهت صلاحية هذا الرابط", expired: true };
        }

        // Check secret code
        if (data.secret_code) {
            if (!secretCode) {
                return { requiresCode: true };
            }
            if (secretCode !== data.secret_code) {
                return { error: "الرمز السري غير صحيح", requiresCode: true };
            }
        }

        return { success: true, pdfUrl: data.booklet_url };
    } catch (error: any) {
        return { error: error.message || "حدث خطأ غير متوقع" };
    }
}
