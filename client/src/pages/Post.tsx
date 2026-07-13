import Layout from "@/components/Layout";
import { Link, useParams } from "wouter";

const posts: Record<string, { date: string; title: string; content: string }> = {
  dreamland: {
    date: "Jul 13, 2026",
    title: "dreamland",
    content: "I start today",
  },
};

export default function Post() {
  const params = useParams();
  const slug = params.slug as string;
  const post = posts[slug];

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <p>Post not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <Link href="/a-whim" className="text-sm hover:opacity-70 transition mb-6 inline-block">
          ← a whim
        </Link>
        
        <div className="mt-8">
          <p className="text-xs text-gray-600 mb-2">{post.date}</p>
          <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
          <p className="text-lg leading-relaxed">{post.content}</p>
        </div>
      </div>
    </Layout>
  );
}
