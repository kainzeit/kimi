import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { ManagedPageImage, type ManagedPageImageData } from "@/components/ManagedPageImage";
import { Link } from "wouter";

/** Extract the first sentence/line of plain text from HTML or plain content */
function getPreview(content: string): string {
  let text = content;
  if (text.trim().startsWith("<")) {
    text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const match = text.match(/^(.{10,120}?[.!?。！？])/);
  if (match) return match[1];
  return text.slice(0, 100).trim() + (text.length > 100 ? "…" : "");
}

export default function Elsewhere() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "elsewhere" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "elsewhere" });
  const [viewMode, setViewMode] = useState<"list" | "gallery">("list");
  const [selectedImage, setSelectedImage] = useState<ManagedPageImageData | null>(null);
  const elsewhereImages = images as ManagedPageImageData[];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="public-content-layout">
      <div className="public-text-column flex-1 min-w-0">
        {isLoading ? (
          <div className="flex py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !articles || articles.length === 0 ? (
          <p className="text-base text-muted-foreground tracking-wide">nothing here yet.</p>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <div key={article.id}>
                <Link href={`/elsewhere/${article.slug}`}>
                  <h2 className="text-base font-semibold nav-link inline-block mb-1">{article.title}</h2>
                </Link>
                <p className="text-xs text-muted-foreground tracking-wide mt-1">
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {article.content && (
                  <p className="text-sm text-muted-foreground tracking-wide mt-2 leading-relaxed max-w-lg">
                    {getPreview(article.content)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {elsewhereImages.length > 0 && (
        <div className="public-image-column flex flex-col gap-4 shrink-0 min-w-0">
          <div className="flex items-center gap-3 text-xs tracking-wide text-muted-foreground">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "text-foreground font-semibold" : "hover:text-foreground transition"}
              aria-pressed={viewMode === "list"}
            >
              list
            </button>
            <button
              type="button"
              onClick={() => setViewMode("gallery")}
              className={viewMode === "gallery" ? "text-foreground font-semibold" : "hover:text-foreground transition"}
              aria-pressed={viewMode === "gallery"}
            >
              gallery
            </button>
          </div>

          {viewMode === "list" ? (
            elsewhereImages.map((image) => (
              <ManagedPageImage key={image.id} image={image} fallbackHeight={189} />
            ))
          ) : (
            <div className="grid w-full max-w-sm grid-cols-2 gap-x-3 gap-y-5">
              {elsewhereImages.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className="block min-w-0 text-left"
                  aria-label="Open image"
                >
                  <img
                    src={image.url}
                    alt=""
                    className="h-32 w-full rounded object-cover transition-opacity hover:opacity-80 sm:h-40"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute right-6 top-5 text-2xl leading-none text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={selectedImage.url}
            alt=""
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
