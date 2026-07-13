import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Post() {
  const params = useParams();
  const [location] = useLocation();
  const slug = params.slug as string;

  // Determine category from URL path
  const isImagination = location.startsWith("/imagination/");
  const backHref = isImagination ? "/imagination" : "/a-whim";
  const backLabel = isImagination ? "← imagination" : "← a whim";

  const { data: article, isLoading } = trpc.articles.get.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

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

  const isHtml = article?.content?.trim().startsWith("<");

  return (
    <div className="pt-10 pl-16 pr-12 pb-12">
      <Link
        href={backHref}
        className="text-xs text-muted-foreground hover:text-foreground transition tracking-wide inline-block mb-8"
      >
        {backLabel}
      </Link>

      {isLoading ? (
        <div className="flex py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : !article ? (
        <p className="text-sm text-muted-foreground">article not found.</p>
      ) : (
        <article className="max-w-xl">
          <p className="text-xs text-muted-foreground mb-4 tracking-wide">
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-bold mb-8">{article.title}</h1>
          {isHtml ? (
            <div
              className="prose-content text-sm leading-loose tracking-wide"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="text-sm leading-loose tracking-wide space-y-5">
              {article.content.split("\n").map((paragraph, idx) =>
                paragraph.trim() ? (
                  <p key={idx}>{paragraph}</p>
                ) : null
              )}
            </div>
          )}
        </article>
      )}
    </div>
  );
}
