"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/types";
import { useLang } from "@/lib/LanguageContext";

type Props = {
  projects: Project[];
};

/* ─── Bubble size patterns ─── */
// Each pattern defines a grid span (colSpan x rowSpan) + border radius style
const BUBBLE_PATTERNS = [
  { col: 2, row: 2, radius: "3rem" },           // large square bubble
  { col: 1, row: 2, radius: "2.5rem 1rem 2.5rem 1rem" }, // tall pill
  { col: 1, row: 1, radius: "2rem" },            // small square
  { col: 2, row: 1, radius: "1rem 2.5rem 1rem 2.5rem" }, // wide pill
  { col: 1, row: 1, radius: "50%" },             // perfect circle
  { col: 1, row: 2, radius: "2rem" },            // tall rectangle
  { col: 2, row: 2, radius: "2.5rem" },          // big bubble
  { col: 1, row: 1, radius: "1.5rem 3rem 1.5rem 3rem" }, // asymmetric
  { col: 2, row: 1, radius: "2.5rem" },          // wide bubble
  { col: 1, row: 1, radius: "2.5rem 1rem" },     // organic
];

// Background accent colors for cards without images
const ACCENT_COLORS = [
  "from-blue-400/20 to-blue-600/30",
  "from-violet-400/20 to-violet-600/30",
  "from-sky-400/20 to-sky-600/30",
  "from-teal-400/20 to-teal-600/30",
  "from-rose-400/20 to-rose-600/30",
  "from-amber-400/20 to-amber-600/30",
];

function BubbleCard({
  project,
  index,
  pattern,
  onClick,
}: {
  project: Project;
  index: number;
  pattern: typeof BUBBLE_PATTERNS[0];
  onClick: () => void;
}) {
  const { t } = useLang();
  const imageUrl = project.images?.[0];
  const imageCount = project.images?.length ?? 0;
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.07, type: "spring", damping: 20 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] active:scale-[0.97]"
      style={{
        gridColumn: `span ${pattern.col}`,
        gridRow: `span ${pattern.row}`,
        borderRadius: pattern.radius,
        minHeight: pattern.row === 2 ? "320px" : "180px",
      }}
    >
      {/* Background */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} backdrop-blur-xl`}>
          <div className="absolute inset-0 bg-white/5 dark:bg-black/10" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Glassmorphism shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 via-transparent to-white/5" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
        <motion.h2
          className="font-bold tracking-tight drop-shadow-lg"
          style={{ fontSize: pattern.col === 2 ? "1.5rem" : "1.1rem" }}
        >
          {project.title}
        </motion.h2>
        <p className="mt-1 text-sm text-white/70 font-medium">
          {imageCount} {imageCount === 1 ? t("gallery.image") : t("gallery.images")}
        </p>

        {/* Explore button - slides up on hover */}
        <div className="mt-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-md border border-white/10">
            {t("gallery.exploreNow")}
            <span className="text-base">→</span>
          </span>
        </div>
      </div>

      {/* Top-right image count badge for multi-image projects */}
      {imageCount > 1 && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-black/30 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm border border-white/10">
          {imageCount} ✦
        </div>
      )}
    </motion.article>
  );
}

function Lightbox({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const images = project.images ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLang();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) setCurrentIndex(i => i + 1);
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex(i => i - 1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, currentIndex, images.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10"
      >
        {images.length > 0 ? (
          <>
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={images[currentIndex]}
              alt={project.title}
              className="max-h-[85vh] max-w-full object-contain"
            />
            {images.length > 1 && (
              <>
                {/* Navigation arrows */}
                {currentIndex > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => i - 1); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                )}
                {currentIndex < images.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => i + 1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                    aria-label="Next"
                  >
                    ›
                  </button>
                )}
                {/* Dot indicators */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent py-4">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-white scale-125" : "bg-white/30 hover:bg-white/60"
                        }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-64 w-96 items-center justify-center text-zinc-500">{t("gallery.noImages")}</div>
        )}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm hover:bg-black/60 transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
        <p className="absolute left-5 top-4 text-lg font-bold text-white drop-shadow-lg">
          {project.title}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery({ projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { t } = useLang();

  // Assign a stable bubble pattern per project
  const projectPatterns = useMemo(() => {
    return projects.map((_, i) => BUBBLE_PATTERNS[i % BUBBLE_PATTERNS.length]);
  }, [projects]);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{t("gallery.noProjects")}</p>
        <p className="mt-2 text-sm text-zinc-500">{t("gallery.loginHint")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Bento Bubble Grid */}
      <div className="mx-auto max-w-6xl px-4">
        <div
          className="grid gap-4 md:gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridAutoRows: "160px",
            gridAutoFlow: "dense",
          }}
        >
          {projects.map((project, index) => (
            <BubbleCard
              key={project.id}
              project={project}
              index={index}
              pattern={projectPatterns[index]}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <Lightbox
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
