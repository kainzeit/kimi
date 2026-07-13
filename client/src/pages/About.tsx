import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function About() {
  const { data: pageContent, isLoading } = trpc.pages.getContent.useQuery({ pageKey: "about" });

  const defaultContent = `just a regular person
likes building stuff, makes little apps here and there
loves music and movies — can only tell you if it's good or not, writing's too rough for actual reviews
loves to travel, just haven't been many places yet
studying english, still don't think i'm any good at it
some days i feel unstoppable, some days everything's falling apart
some nights i dream the most beautiful things, some days it all feels over
saw other people writing little things on their own sites, so i figured i'd try too
thanks for making it this far :)`;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8">about</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="max-w-2xl space-y-4 leading-relaxed">
            {(pageContent?.content || defaultContent).split('\n').map((line, idx) => (
              line.trim() && (
                <p key={idx} className="text-sm">
                  {line}
                </p>
              )
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
