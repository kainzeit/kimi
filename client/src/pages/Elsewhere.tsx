import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getFirstRichTextImageSrc } from "@/lib/richtext-image";
import { Link } from "wouter";

export default function Elsewhere() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "elsewhere" });
  const thumbnailArticles = (articles || []).flatMap((article) => {
    const imageSrc = getFirstRichTextImageSrc(article.content);
    return imageSrc ? [{ ...article, imageSrc }] : [];
  });

  if (isLoading) {
    return (
      <div className="public-content-layout">
        <div className="public-text-column flex-1 min-w-0">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="public-content-layout">
      <div className="public-text-column hidden flex-1 min-w-0 md:block" aria-hidden="true" />

      <div className="public-image-column flex flex-col gap-5 shrink-0 min-w-0">
        {thumbnailArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wide">nothing visual here yet.</p>
        ) : (
          thumbnailArticles.map((article) => (
            <Link key={article.id} href={`/elsewhere/${article.slug}`}>
              <img
                src={article.imageSrc}
                alt={article.title || "Elsewhere entry"}
                className="h-32 w-48 rounded object-cover transition-opacity hover:opacity-80 sm:h-36 sm:w-52"
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
