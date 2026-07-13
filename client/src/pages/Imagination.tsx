import Layout from "@/components/Layout";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Imagination() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "imagination" });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8">imagination</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : !articles || articles.length === 0 ? (
          <p className="text-muted-foreground">no articles yet</p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/imagination/${article.slug}`}>
                <div className="cursor-pointer hover:opacity-70 transition">
                  <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
