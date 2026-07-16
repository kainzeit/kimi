import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

const CONTENT_TOP = "169px";
const IMG_SIZE = "227px";
const IMG_GAP = "113px";

/** Extract the first sentence/line of plain text from HTML or plain content */
function getPreview(content: string): string {
  let text = content;
  // Strip HTML tags if content is HTML
  if (text.trim().startsWith("<")) {
    text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  // Take up to the first sentence boundary or 120 chars
  const match = text.match(/^(.{10,120}?[.!?。！？])/);
  if (match) return match[1];
  // Fallback: first 100 chars
  return text.slice(0, 100).trim() + (text.length > 100 ? "…" : "");
}

export default function Imagination() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "imagination" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "imagination" });

  return (
    <div style={{ paddingTop: CONTENT_TOP, paddingLeft: "64px", paddingRight: "48px", paddingBottom: "48px", display: "flex", alignItems: "flex-start", gap: IMG_GAP }}>
      {/* Article list */}
      <div className="flex-1 min-w-0">
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
                <Link href={`/imagination/${article.slug}`}>
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

      {/* Images: right of content, 6cm×6cm */}
      {(images as any[]).length > 0 && (
        <div className="flex flex-col gap-4 shrink-0">
          {(images as any[]).map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt=""
              style={{ height: IMG_SIZE, width: "auto", objectFit: "contain", borderRadius: "4px" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
