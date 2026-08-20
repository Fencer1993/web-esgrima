"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

type Post = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
};

const handle = site.social.instagram
  .replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")
  .replace(/\/$/, "");

export function InstagramCta() {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("instagram-feed.php")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.posts) && data.posts.length > 0) {
          setPosts(data.posts);
        }
      })
      .catch(() => {
        // Sin feed disponible (aún no configurado, o hosting estático
        // sin PHP como la vista previa de GitHub Pages): se queda con
        // el CTA de abajo, que siempre funciona.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-sm border border-line bg-paper-raised px-6 py-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-steel-soft text-steel"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
              Síguenos en Instagram
            </p>
            <p className="text-sm text-ink-soft">
              Entrenamientos, competiciones y el día a día del club, en {handle}.
            </p>
          </div>
        </div>
        <a
          href={site.social.instagram}
          className="btn-blade inline-flex shrink-0 items-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
        >
          Ver el perfil
        </a>
      </div>

      {posts && (
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              className="group relative block aspect-square overflow-hidden rounded-sm bg-steel-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.thumbnailUrl || post.mediaUrl}
                alt={post.caption || "Publicación de Instagram del club"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-ink/0 p-2 transition-colors group-hover:bg-ink/40">
                {post.mediaType === "VIDEO" && (
                  <span aria-hidden className="text-white opacity-0 transition-opacity group-hover:opacity-100">
                    ▶
                  </span>
                )}
                {post.mediaType === "CAROUSEL_ALBUM" && (
                  <span aria-hidden className="text-white opacity-0 transition-opacity group-hover:opacity-100">
                    ⧉
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
