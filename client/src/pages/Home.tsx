import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            just a regular person who likes building things
          </p>
          <p className="text-sm text-muted-foreground">
            exploring ideas through code and design
          </p>
        </div>
      </div>
    </Layout>
  );
}
