import Layout from "@/components/Layout";
import { Link } from "wouter";

const posts = [
  {
    slug: "dreamland",
    date: "Jul 13, 2026",
    title: "dreamland",
    excerpt: "I start today",
  },
];

export default function AWhim() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/a-whim/${post.slug}`}>
              <div className="border-2 border-dashed border-green-500 p-6 hover:bg-green-50 transition cursor-pointer">
                <div className="text-xs text-gray-600 mb-2">{post.date}</div>
                <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                <p className="text-sm text-gray-700">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
