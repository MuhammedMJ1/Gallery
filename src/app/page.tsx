import { createClient } from "@supabase/supabase-js";
import Gallery from "@/components/Gallery";
import { Project } from "@/types";

export default async function HomePage() {
  let projects: Project[] = [];

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createClient(url, key);
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      projects = data ?? [];
    }
  } catch {
    // Supabase not configured
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20">
      <main className="w-full px-4 py-12">
        <Gallery projects={projects} />
      </main>
    </div>
  );
}
