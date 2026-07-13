import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">
          <div>
            <p className="text-sm text-gray-600 mb-4">a little person sleeping at their desk</p>
            <div className="w-full h-64 bg-gray-200 rounded border-2 border-dashed border-yellow-400 flex items-center justify-center">
              [Image placeholder]
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              just a regular person who likes building things
            </p>
            <p className="text-sm text-gray-600">
              exploring ideas through code and design
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
