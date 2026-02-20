"use client";

import { useState } from "react";
import type { Project, ProjectLayout, AnimationType } from "@/types";

const LAYOUTS: { value: ProjectLayout; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "masonry", label: "Masonry" },
  { value: "carousel", label: "Carousel" },
];

const ANIMATIONS: { value: AnimationType; label: string }[] = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "scale", label: "Scale" },
  { value: "none", label: "None" },
];

type Props = {
  project?: Project | null;
  onSave: (data: { title: string; layout: ProjectLayout; animation: AnimationType; images: string[] }) => void;
  onCancel: () => void;
  saving?: boolean;
};

export default function ProjectForm({ project, onSave, onCancel, saving = false }: Props) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [layout, setLayout] = useState<ProjectLayout>(project?.layout ?? "grid");
  const [animation, setAnimation] = useState<AnimationType>(project?.animation ?? "fade");
  const [images, setImages] = useState<string[]>(project?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setError("");
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function setCoverImage(url: string) {
    setImages((prev) => {
      const filtered = prev.filter((u) => u !== url);
      return [url, ...filtered];
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ title, layout, animation, images });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          placeholder="Project title"
          required
        />
      </div>

      <div>
        <label
          htmlFor="layout-select"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Layout
        </label>
        <select
          id="layout-select"
          value={layout}
          onChange={(e) => setLayout(e.target.value as ProjectLayout)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
        >
          {LAYOUTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="animation-select"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Animation
        </label>
        <select
          id="animation-select"
          value={animation}
          onChange={(e) => setAnimation(e.target.value as AnimationType)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
        >
          {ANIMATIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Images</label>
        {images.length > 1 && (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Click an image to set it as the cover photo</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url, idx) => (
            <div
              key={url}
              className={`group relative cursor-pointer rounded-xl transition-all duration-200 ${idx === 0
                  ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-zinc-900 shadow-lg"
                  : "ring-1 ring-transparent hover:ring-zinc-300 dark:hover:ring-zinc-600"
                }`}
              onClick={() => setCoverImage(url)}
              title={idx === 0 ? "Cover image" : "Click to set as cover"}
            >
              <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
              {/* Green checkmark badge for cover image */}
              {idx === 0 && (
                <div className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold shadow-md">
                  ✓
                </div>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(url); }}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 transition-opacity group-hover:opacity-100 shadow-md"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className="mt-2 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800">
          <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} className="hidden" />
          {uploading ? "Uploading…" : "Add images"}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] rounded-lg border border-zinc-300 px-5 py-2.5 text-sm transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
