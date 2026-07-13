import Layout from "@/components/Layout";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Post() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: article, isLoading } = trpc.articles.get.useQuery({ slug: slug || "" }, { enabled: !!slug });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <Link href="/a-whim" className="text-sm hover:opacity-70 transition mb-6 inline-block">
          ← a whim
        </Link>
        
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !article ? (
            <p className="text-muted-foreground">article not found</p>
          ) : (
            <article>
              <p className="text-sm text-muted-foreground mb-4">
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
              <div className="max-w-2xl space-y-4 leading-relaxed">
                {article.content.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && (
                    <p key={idx}>
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </article>
          )}
        </div>
      </div>
    </Layout>
  );
}
