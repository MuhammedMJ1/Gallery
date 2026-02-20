import { createClient } from "@supabase/supabase-js";
import BookletsGallery from "@/components/BookletsGallery";

// Ensure this page is rendered dynamically to fetch the latest booklets
export const dynamic = "force-dynamic";

export default async function PublicBookletsGalleryPage() {
    let booklets = null;

    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
            const supabase = createClient(url, key);
            const { data, error } = await supabase
                .from("booklets")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching booklets:", error);
            }
            booklets = data;
        }
    } catch {
        // Supabase not configured
    }

    return <BookletsGallery booklets={booklets} />;
}

