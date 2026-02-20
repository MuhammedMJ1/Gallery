"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import ProjectForm from "./ProjectForm";

type Props = {
  projects: Project[];
};

export default function ProjectList({ projects }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(data: { title: string; layout: Project["layout"]; animation: Project["animation"]; images: string[] }) {
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveError(json.error ?? `Failed to save (${res.status})`);
        return;
      }
      setCreating(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: { title: string; layout: Project["layout"]; animation: Project["animation"]; images: string[] }) {
    if (!editing) return;
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveError(json.error ?? `Failed to save (${res.status})`);
        return;
      }
      setEditing(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Project
        </button>
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {saveError}
        </div>
      )}

      {creating && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-medium">New Project</h3>
          <ProjectForm onSave={handleCreate} onCancel={() => { setCreating(false); setSaveError(null); }} saving={saving} />
        </div>
      )}

      {editing && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-medium">Edit Project</h3>
          <ProjectForm project={editing} onSave={handleUpdate} onCancel={() => { setEditing(null); setSaveError(null); }} saving={saving} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="aspect-video bg-zinc-100 dark:bg-zinc-800">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">No image</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-xs text-zinc-500">{p.layout} · {p.animation}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEditing(p)}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deleting === p.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !creating && (
        <p className="py-8 text-center text-zinc-500">No projects yet. Add one to get started.</p>
      )}
    </div>
  );
}
