import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function AWhim() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "a-whim" });

  return (
    <div className="pt-10 pl-16 pr-12 pb-12">
      <h1 className="text-2xl font-bold mb-10">a whim</h1>

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
                {new Date(article.createdAt).toLocaleDateString("en-US", {
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
