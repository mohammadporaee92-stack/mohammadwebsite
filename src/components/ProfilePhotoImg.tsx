"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";

// Client-side img with graceful fallback: if the file is missing/broken,
// show the monogram instead of a broken-image icon.
export default function ProfilePhotoImg({ src, alt, dims, ig }: {
  src: string; alt: string; dims: string; ig: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={cx("relative grid place-items-center rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white shadow-2xl shadow-blue-900/25 ring-4 ring-white overflow-hidden", dims)}>
        <div className="absolute inset-0 bg-blueprint opacity-70" aria-hidden="true" />
        <div className="absolute -bottom-6 -end-6 w-28 h-28 rounded-full bg-tech-500/30 blur-2xl" aria-hidden="true" />
        <span className="relative font-extrabold tracking-tight" dir="ltr">MP</span>
        <span className="absolute bottom-2 inset-x-0 text-center text-[10px] font-semibold text-sky-200/90 px-2">
          @{ig}
        </span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={cx("object-cover rounded-3xl shadow-2xl shadow-blue-900/25 ring-4 ring-white", dims)} loading="lazy" />;
}
