import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import BookletManager from "@/components/admin/BookletManager";

export default async function AdminBookletsPage() {
    let booklets: any[] = [];
    let error = "";

    try {
        const supabase = createAdminClient();
        const { data, error: fetchError } = await supabase
            .from("booklets")
            .select("*")
            .order("created_at", { ascending: false });
        if (!fetchError) booklets = data ?? [];
        else error = "Could not load booklets. Run the Supabase migration first.";
    } catch (e) {
        error = "Database not configured. Add Supabase URL and service role key to .env.local, then run the migration in supabase/migrations/.";
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-6">
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            Admin Dashboard - Booklets
                        </h1>
                        <nav className="flex gap-4">
                            <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                                Projects
                            </Link>
                            <Link href="/admin/booklets" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                Booklets
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/booklets"
                            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            View Public Booklets
                        </Link>
                        <form action="/api/admin/logout" method="POST">
                            <button
                                type="submit"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">
                {error && (
                    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        {error}
                    </div>
                )}
                <BookletManager initialBooklets={booklets} />
            </main>
        </div>
    );
}
