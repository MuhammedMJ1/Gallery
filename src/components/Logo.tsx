"use client";

import Link from "next/link";
import { useState } from "react";

export default function Logo() {
  const [hasError, setHasError] = useState(false);

  return (
    <Link href="/" className="flex items-center gap-3">
      {!hasError && (
        <img
          src="/Logo.png"
          alt=""
          className="h-10 w-auto max-w-[100px] object-contain"
          onError={() => setHasError(true)}
        />
      )}
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Graphic Designer
        </span>
        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Muhammed MJ
        </span>
      </div>
    </Link>
  );
}
