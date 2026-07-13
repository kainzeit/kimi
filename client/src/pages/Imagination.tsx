import Layout from "@/components/Layout";

export default function Imagination() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">doodle</p>
            <div className="w-full h-64 bg-gray-200 rounded border-2 border-dashed border-yellow-400 flex items-center justify-center mb-6">
              [Image placeholder]
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">还没有文章，去 content.js 里添加一篇吧。</p>
        </div>
      </div>
    </Layout>
  );
}
