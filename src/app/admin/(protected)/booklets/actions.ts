"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function uploadBooklet(formData: FormData) {
    const title = formData.get("title") as string;
    const file = formData.get("pdf") as File | null;
    const externalUrl = formData.get("externalUrl") as string | null;

    if (!title) {
        return { error: "Missing title." };
    }

    if (!file && !externalUrl) {
        return { error: "You must provide either a PDF file or an external URL." };
    }

    try {
        const supabase = createAdminClient();
        let finalPdfUrl = externalUrl;

        // 1. Upload the file to Storage ONLY IF a valid file was provided
        if (file && file.size > 0 && file.name !== 'undefined') {
            // File size check (e.g., 250MB limit)
            if (file.size > 250 * 1024 * 1024) {
                return { error: "File exceeds 250MB limit." };
            }

            const fileExt = file.name.split('.').pop() || "pdf";
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("pdfs")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                console.error("Storage Error:", uploadError);
                return { error: `Storage upload failed: ${uploadError.message}` };
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from("pdfs")
                .getPublicUrl(filePath);

            finalPdfUrl = publicUrlData.publicUrl;
        }

        if (!finalPdfUrl) {
            return { error: "Failed to determine the PDF URL." };
        }

        // 2. Insert into database
        const { error: dbError } = await supabase
            .from("booklets")
            .insert([
                { title, pdf_url: finalPdfUrl }
            ]);

        if (dbError) {
            console.error("DB Error:", dbError);
            return { error: `Database insert failed: ${dbError.message}` };
        }

        revalidatePath("/admin/booklets");
        revalidatePath("/booklets");

        return { success: true };
    } catch (error: any) {
        console.error("Unexpected Error:", error);
        return { error: error.message || "An unexpected error occurred." };
    }
}

export async function deleteBooklet(id: string, pdfUrl: string) {
    try {
        const supabase = createAdminClient();

        // Extract file path from public URL
        // Format: .../storage/v1/object/public/pdfs/uploads/filename.pdf
        const urlParts = pdfUrl.split('/pdfs/');
        if (urlParts.length === 2) {
            const filePath = urlParts[1];
            await supabase.storage.from("pdfs").remove([filePath]);
        }

        const { error } = await supabase.from("booklets").delete().eq("id", id);
        if (error) throw error;

        revalidatePath("/admin/booklets");
        revalidatePath("/booklets");

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
