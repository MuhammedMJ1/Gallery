import { createClient } from "@/lib/supabase/client";
import BookletsGallery from "@/components/BookletsGallery";

// Ensure this page is rendered dynamically to fetch the latest booklets
export const dynamic = "force-dynamic";

export default async function PublicBookletsGalleryPage() {
    const supabase = createClient();
    const { data: booklets, error } = await supabase
        .from("booklets")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching booklets:", error);
    }

    return <BookletsGallery booklets={booklets} />;
}
