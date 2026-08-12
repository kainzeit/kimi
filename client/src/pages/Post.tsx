import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Post() {
  const params = useParams();
  const [location] = useLocation();
  const slug = params.slug as string;

  // Determine category from URL path
  const isImagination = location.startsWith("/imagination/");
  const isElsewhere = location.startsWith("/elsewhere/");
  const isAWhim = !isImagination && !isElsewhere;
  const isTitlelessEntry = isAWhim || isElsewhere;
  const category = isElsewhere ? "elsewhere" : isImagination ? "imagination" : "a-whim";
  const backHref = isElsewhere ? "/elsewhere" : isImagination ? "/imagination" : "/a-whim";

  const { data: article, isLoading } = trpc.articles.get.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: allArticles = [] } = trpc.articles.list.useQuery({ category });

  // Track article view count — fire once per mount, use ref to prevent double-fire in React strict mode
  const viewTracked = useRef(false);
  const incrementView = trpc.views.increment.useMutation();

  useEffect(() => {
    if (slug && !viewTracked.current) {
      viewTracked.current = true;
      incrementView.mutate({ slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);


  // Find current article index and prev/next
  const currentIndex = allArticles.findIndex((a: any) => a.slug === slug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  const isHtml = article?.content?.trim().startsWith("<");

  return (
    <div className="public-post-layout">
      <Link
        href={backHref}
        className="text-xs text-muted-foreground hover:text-foreground transition tracking-wide inline-block mb-8"
      >
        ← {category}
      </Link>

      {isLoading ? (
        <div className="flex py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : !article ? (
        <p className="text-sm text-muted-foreground">article not found.</p>
      ) : (
        <>
          <article className={`max-w-xl article-reading-density article-density-comfortable ${isAWhim ? "a-whim-post" : ""}`}>
            {!isTitlelessEntry && (
              <p className="text-xs text-muted-foreground mb-4 tracking-wide">
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            <div className={isTitlelessEntry ? "a-whim-title-row mb-6" : "mb-6"}>
              <h1 className={isTitlelessEntry ? "text-[11px] font-normal text-[#719199] leading-tight a-whim-date-heading" : "text-2xl font-bold"}>
                {isTitlelessEntry
                  ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : article.title}
              </h1>
            </div>
            {isHtml ? (
              <div
                className="prose-content article-reading-content text-base tracking-wide"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="article-reading-content text-base tracking-wide">
                {article.content.split("\n").map((paragraph: string, idx: number) =>
                  paragraph.trim() ? (
                    <p key={idx}>{paragraph}</p>
                  ) : null
                )}
              </div>
            )}
          </article>

          {/* Navigation arrows */}
          {(prevArticle || nextArticle) && (
            <div className="flex items-center justify-between mt-16 pt-8 max-w-xl" style={{ borderTop: "1px solid var(--border)" }}>
              {prevArticle ? (
                <Link
                  href={`${backHref}/${prevArticle.slug}`}
                  className="p-2 rounded hover:bg-muted transition"
                  title="Previous article"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              ) : (
                <div className="p-2" />
              )}

              <span className="text-xs text-muted-foreground tracking-wide">
                {currentIndex + 1} / {allArticles.length}
              </span>

              {nextArticle ? (
                <Link
                  href={`${backHref}/${nextArticle.slug}`}
                  className="p-2 rounded hover:bg-muted transition"
                  title="Next article"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <div className="p-2" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
