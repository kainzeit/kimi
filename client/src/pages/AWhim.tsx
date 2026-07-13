import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

// Align content top with "home" nav item: 95px top + ~34px kimi. + 40px mb-10 = ~169px
const CONTENT_TOP = "169px";
const IMG_SIZE = "227px"; // 6cm
const IMG_GAP = "113px";  // 3cm

export default function AWhim() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "a-whim" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "a-whim" });

  return (
    <div style={{ paddingTop: CONTENT_TOP, paddingLeft: "64px", paddingRight: "48px", paddingBottom: "48px", display: "flex", alignItems: "flex-start", gap: IMG_GAP }}>
      {/* Article list */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !articles || articles.length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wide">nothing here yet.</p>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <div key={article.id}>
                <Link href={`/a-whim/${article.slug}`}>
                  <h2 className="text-base font-semibold nav-link inline-block mb-1">{article.title}</h2>
                </Link>
                <p className="text-xs text-muted-foreground tracking-wide mt-1">
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
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
              style={{ width: IMG_SIZE, height: IMG_SIZE, objectFit: "cover", borderRadius: "4px" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
