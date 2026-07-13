import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Imagination() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "imagination" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "imagination" });

  return (
    <div style={{ paddingTop: "95px", paddingLeft: "64px", paddingRight: "48px", paddingBottom: "48px" }}>
      {/* Images for this page */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-10">
          {(images as any[]).map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt=""
              style={{ width: "190px", height: "190px", objectFit: "cover", borderRadius: "4px" }}
            />
          ))}
        </div>
      )}

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
